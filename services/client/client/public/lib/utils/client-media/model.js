const definition = require('./definition.js');

// for CommonJS to ES6 module import
let getLoggerProm = import('@ucd-lib/cork-app-utils');
let getLogger;
getLoggerProm.then(module => {
  getLogger = module.getLogger;
});

let loadingMediaProm = import('../../models/MediaModel.mjs')
let mediaModel;
loadingMediaProm.then(module => {
  mediaModel = module.default;
});

class ClientMedia {

  constructor(id, graph, opts={}) {
    this.id = id;
    this.opts = opts;

    this.logger = getLogger('ClientMedia');

    this.missingNodes = new Set();

    // if( graph.node ) graph = graph.node; 
    if( graph['@graph'] ) graph = graph['@graph'];
    if( !Array.isArray(graph) ) graph = [graph];
    
    this.graph = graph;
    this.index = [];

    for( let node of graph ) {
      this.index[node['@id']] = node;
      if( node['@id'] == id ) this.root = node;
    }

    if( !this.root && graph.length ) {
      throw new Error('Root '+id+' not found in graph');
    }

    // parse() populates the mediaGroups array
    this.mediaGroups = new Set();
    this.parse();
    this.mediaGroups = Array.from(this.mediaGroups);

    // just loop all nodes in graph for media
    if( this.mediaGroups.length === 0 ) {
      if( typeof window !== 'undefined' ) {
        this.logger.warn('No media found for '+id, graph);
      }
    }

    this.ensureClientMedia();

    // TODO: this should probably be a function
    // see if we have pdfs point to image lists or image lists point to pdfs
    let pdfRemoveList = new Set();
    let imageLists = new Set();
    let pdfs = new Set();
    this.mediaGroups.forEach(node => {
      let displayType = this.getDisplayType(node);
      if( displayType === 'pdf' ) {
        pdfs.add(node);
      } else if( displayType === 'imagelist' ) {
        imageLists.add(node);
      }
    });
    imageLists = Array.from(imageLists);
    pdfs = Array.from(pdfs);

    for( let node of imageLists ) {
      let mediaLinks = this.getMediaLinks(node);
      for( let link of mediaLinks ) {
        if( pdfs.includes(link) ) {
          pdfRemoveList.add(link);
          node.clientMedia.pdf = link.clientMedia;
          node.clientMedia.download = link.clientMedia.download;
        }
      }
    }
    
    for( let node of pdfs ) {
      let mediaLinks = this.getMediaLinks(node);
      for( let link of mediaLinks ) {
        if( imageLists.includes(link) ) {
          pdfRemoveList.add(node);
          link.clientMedia.pdf = node.clientMedia;
          link.clientMedia.download = node.clientMedia.download;
        }
      }
    }

    this.mediaGroups = this.mediaGroups.filter(node => !pdfRemoveList.has(node));


    // find anything that doesn't have clientMedia.images.original
    for( let node of this.mediaGroups ) {
      let displayType = this.getDisplayType(node);
      if( !node.clientMedia ) {
        node.clientMedia = {};
      }

      if( !node.clientMedia.images ) {
        node.clientMedia.images = {};
      }

      if( !node.clientMedia.images.original && displayType ) {
        node.clientMedia.images.original = {
          missing : true,
          // TODO: DC get better unknown image from kimmy
          url : '/images/tree-bike-illustration.png'
        }
      }

      if( !node.clientMedia.download ) {
        if( displayType !== 'imagelist' ) {
          node.clientMedia.download = [{
            url : '/fcrepo/rest'+node['@id'],
            fileSize : node.fileSize
          }];
        } else {
          node.clientMedia.download = [{
            archive : {
              binary : true,
              metadata : false
            }
          }];
        }
      }
    }

  }

  /**
   * @method loadManifests
   * @description load all manifests for media groups.  This only loads the root item!
   * 
   * @returns {Promise}
   */
  async loadManifests() {
    for( let node of this.mediaGroups ) {
      // pdf manifest load
      if( node.clientMedia.pdf && node.clientMedia.pdf.manifest ) {
        if( node.clientMedia.pdf.loaded ) continue;

        // hack until we port all models to es6
        if( !mediaModel ) {
          await loadingMediaProm;
        }

        let res = await mediaModel.getManifest(node.clientMedia.pdf.manifest);
        node.clientMedia = Object.assign(node.clientMedia, res.payload);
        node.clientMedia.pdf.loaded = true;

        // make sure we are sorted
        if( node.clientMedia.pages ) {
          node.clientMedia.pages.sort((a, b) => {
            if( a.page < b.page ) return -1;
            if( a.page > b.page ) return 1;
            return 0;
          });
        }
      }
    }

    this.ensureClientMedia();
  }

  /**
   * @method ensureClientMedia
   * @description ensure proper clientMedia for all media groups
   */
  ensureClientMedia() {
    for( let i = 0; i < this.mediaGroups.length; i++ ) {
      let node = this.mediaGroups[i];

      let mediaType = this.getMediaType(node);
      let fileType = this.getFileType(node);

      // if image list sort
      if( mediaType === 'ImageList' ) {
        this.handleImageList(node);
      } else if( fileType === 'image' ) {
        this.handleImage(node);
      } else if( fileType === 'pdf' ) {
        this.handlePdf(node); 
      } else if( mediaType === 'VideoObject' ) {
        this.handleVideo(node);
      }
    }
  }

  /**
   * @method handleVideo
   * @description ensure image is properly linked to video
   * 
   * @param {Object} node
   */
  handleVideo(node) {
    if( !node.clientMedia ) {
      node.clientMedia = {};
    }

    if( !node.image ) return;

    let image = this.getNode(node.image);
    if( !image ) return;

    node.clientMedia.images = image.clientMedia?.images;
  }

  /**
   * @method handleImageList
   * @description ensure proper clientMedia for image list
   * 
   * @param {Object} node 
   */
  handleImageList(node) {
    if( !node.clientMedia ) {
      node.clientMedia = {};
    }

    node.clientMedia.pages = this.getCrawlLinks(node)
      .map(node => {
        node = this.getNode(node)
        if( !node ) return null;
        this.handleImage(node);
        
        node.clientMedia.images['@id'] = node['@id'];
        node.clientMedia.images.page = parseInt(node.position);
        node.clientMedia.images.download = node.clientMedia.download;

        return node.clientMedia.images;
      })
      .filter(node => node);

    if( !node.clientMedia.pages ) {
      this.logger.warn('No images found for list '+node['@id']);
      node.clientMedia.pages = [];
    }

    node.clientMedia.pages.sort((a, b) => {
      if( a.page < b.page ) return -1;
      if( a.page > b.page ) return 1;
      return 0;
    });

    node.clientMedia.pages.forEach((page, index) => {
      page.uiPosition = index+1;     
    });

    node.clientMedia.download = node.clientMedia.pages.map(page => {
      return page.download;      
    });

    if( !node.clientMedia.images ) {
      node.clientMedia.images = node.clientMedia.pages[0];
    }
  }

  /**
   * @method handlePdf
   * @description ensure proper clientMedia for pdf
   * 
   * @param {Object} node
   * 
   * @returns {Object} 
   */
  handlePdf(node) {
    if( !node.clientMedia ) {
      if( typeof window !== 'undefined' ) {
        this.logger.warn('No clientMedia for pdf '+node['@id']);
      }
      node.clientMedia = {};
    }

    if( node.clientMedia.pages ) {
      node.clientMedia.pages.sort((a, b) => {
        if( a.page < b.page ) return -1;
        if( a.page > b.page ) return 1;
        return 0;
      });

      node.clientMedia.pages.forEach((page, index) => {
        if( !page['@id'] ) {
          page['@id'] = node['@id']+':'+index;
        }

        page.uiPosition = index+1;     
      });
    }

    if( !node.clientMedia.download ) {
      node.clientMedia.download = [{
        url : '/fcrepo/rest'+node['@id'],
        label : 'pdf',
        fileSize : node.fileSize
      }];
    }
  }

  /**
   * @method handleImage
   * @description ensure proper clientMedia for image
   * 
   * @param {*} node 
   */
  handleImage(node) {
    if( !node.clientMedia ) {
      if( typeof window !== 'undefined' ) {
        this.logger.warn('No clientMedia for '+node['@id']);
      }
      node.clientMedia = {};
    }

    if( !node.clientMedia.images ) {
      node.clientMedia.images = {};
    }

    if( !node.clientMedia.images.original ) {
      node.clientMedia.images.original = {
        url : '/fcrepo/rest'+node['@id'],
      }
    }

    if( !node.clientMedia.download ) {
      node.clientMedia.download = {
        url : node.clientMedia.images.original.url,
        label : node.clientMedia.images.original.url.split('.').pop(),
        fileSize : node.fileSize
      };
    }
  }

  /**
   * @method getNode
   * @description get a node from the graph by @id
   * 
   * @param {String|Object} node with object with @id or @id string
   * 
   * @returns {Object}
   **/
  getNode(node) {
    if( typeof node === 'string' ) {
      if( this.index[node] === undefined ) {
        this.missingNodes.add(node);
      }
      return this.index[node];
    }

    // TODO talk with Justin, this is a hack for /collection/sherry-lehmann
    // the image "/item/ark:/87287/d7dw8t/media/images/d7dw8t-001.jpg" is an object with an id but doesn't exist as a graph in this.index graph
    if( this.index[node['@id']] === undefined ) {
      this.missingNodes.add(node['@id']);
    }
    return this.index[node['@id']]; // || node;
  }

  parse(node, crawled={}) {
    if( !node ) {
      node = this.root;
    }

    // make sure no cycles
    if( crawled[node['@id']] ) return;
    crawled[node['@id']] = true;

    let mediaLinks = this.getMediaLinks(node);
    for( let child of mediaLinks ) {
      this._crawlMedia(child);
    }

    let crawlLinks = this.getCrawlLinks(node);
    for( let child of crawlLinks ) {
      this.parse(child, crawled);
    }
  }

  /**
   * @method _crawlMedia
   * @description given a associateMedia root node, crawl all child links
   * for related media and add to array
   * 
   * @param {Object|String} node node we are crawling
   * @param {Array} media array of all associated media for root media
   * @param {Object} crawled bookkeeping to make sure we don't crawl twice
   * @returns 
   */
  _crawlMedia(node, crawled={}) {
    node = this.getNode(node);
    if( !node ) {
      this.logger.warn('Could not find media node for ', node);
      return;
    } 

    // make sure no cycles
    if( crawled[node['@id']] ) return;
    crawled[node['@id']] = true;

    // check if node is of display type
    let displayType = this.getDisplayType(node);
    if( displayType && 
      definition.DISPLAY_ORDER.DISPLAY_TYPES.includes(displayType) ) {
      this.mediaGroups.add(node);
    }

    // crawl child media links
    let mediaLinks = this.getMediaLinks(node);
    for( let child of mediaLinks ) {
      this._crawlMedia(child, crawled);
    }
  }

  /**
   * @method getMediaType
   * @description get the media type for a node.  The media type is the actual
   * rdf @type string.
   * 
   * @param {Object} node 
   * @returns {String}
   */
  getMediaType(node) {
    if( !node ) return '';
    let type = definition.MEDIA_TYPES.find(type => node['@type']?.includes(type)) || '';
    
    // TODO chat with Justin about this, should data structure change so that type has a value?
    // hack since type is just [] for root collection-type nodes with an image
    // ie collection "/collection/ark:/13030/kt4w1032bf" with image id "/item/ark:/87293/d3jf5s/cua_000011_access006.jpg"
    // if( !type && node.fileFormat?.includes('image') ) {
    //   type = 'ImageObject';
    //   node['@type'].push('http://schema.org/ImageObject');
    //   this.logger.warn('@type is empty for node ', node);
    // }

    // or node['@id'] === '/item/ark:/87287/d7dw8t/media/images/d7dw8t-001.jpg' 
    // sherry lehmann image with no types or fileFormats, just @id key in object
    // if( !type && node['@id'] === '/item/ark:/87287/d7dw8t/media/images/d7dw8t-001.jpg' ) {
    //   node['@type'] = ['http://schema.org/ImageObject'];
    //   type = 'ImageObject';
    //   this.logger.warn('@type is empty for node ', node);
    // }

    return type.split(/(#|\/)/).pop();
  }

  /**
   * @method getDisplayType
   * @description get the display type for node.  Often this is a shorten
   * (and cleaned) version of the mediaType, but can fall back on hasMimeType
   * and encodingFormat
   * 
   * @param {Object} node  
   * @returns {String}
   */
  getDisplayType(node) {
    if( !node ) return '';
    let parts;
    let mediaType = this.getMediaType(node);
    if( mediaType ) {
      let displayType = mediaType.replace(/(object|streaming)/ig, '').toLowerCase();
      if( displayType !== 'media' ) return displayType;
    }

    if( node.hasMimeType ) {
      parts = node.hasMimeType.split('/');
      if( parts.length ) return parts[0].toLowerCase();
    }

    if( node.encodingFormat ) {
      parts = node.encodingFormat.split('/');
      if( parts.length ) return parts[0].toLowerCase();
    }

    if( node.fileFormat ) {
      parts = node.fileFormat.split('/');
      if( parts.length ) return parts[0].toLowerCase();
    }

    return '';
  }

  /**
   * @method getFileType
   * @description get the fileType for a node. this is used to sort within mediaTypes.
   * Often the file type is the file extension.  However this can be the hasMimeType
   * or encodingFormat mime types second param (after slash).  If the node is a list
   * media type, the first node in the hasPart list is used.
   * 
   * @param {*} node 
   * @param {*} displayType 
   * @returns 
   */
  getFileType(node, displayType='') {
    // crawl for first item in list
    if( displayType.match('list') ) {

      let found = false;
      for( let link of definition.CRAWL_LINKS ) {
        if( !node[link] ) continue;
        if( !Array.isArray(node[link]) ) node[link] = [node[link]]; // make sure list is an array, hack for ark:/87287/d7xs9t with single hasPart
        node = this.getNode(node[link][0]);
        if( node ) {
          found = true;
          break;
        }
      }

      if( !found ) return '';
    }

    let parts;

    if( node.fileFormat ) {
      parts = node.fileFormat.split('/');
      if( parts.length ) return parts[1];
    }

    if( node.hasMimeType ) {
      parts = node.hasMimeType.split('/');
      if( parts.length ) return parts[1];
    }

    if( node.encodingFormat ) {
      parts = node.encodingFormat.split('/');
      if( parts.length ) return parts[1];
    }

    parts = node['@id'].split('/').pop().split('.');
    if( parts.length > 1 ) return parts.pop();

    if( node.filename ) {
      parts = node.filename.split('.');
      if( parts.length > 1 ) return parts.pop();
    }

    return '';
  }

  /**
   * @method getMediaLinks
   * @description get all media links for a node
   * 
   * @param {Object} node
   *  
   * @returns {Array}
   */
  getMediaLinks(node) {
    let links = new Set();

    definition.MEDIA_LINK.forEach(link => {
      if( !node[link] ) return;
      let children = node[link];
      
      if( !Array.isArray(children) ) {
        children = [children];
      }

      children
        .map(child => this.getNode(child))
        .filter(child => child)
        .forEach(child => links.add(child));
    });

    return Array.from(links);
  }

  /**
   * @method getCrawlLinks
   * @description get all crawl links for a node
   * 
   * @param {Object} node
   *  
   * @returns {Array}
   */
  getCrawlLinks(node) {
    let links = new Set();

    definition.CRAWL_LINKS.forEach(link => {
      if( !node[link] ) return;
      let children = node[link];
      
      if( !Array.isArray(children) ) {
        children = [children];
      }

      children
        .map(child => this.getNode(child))
        .filter(child => child)
        .forEach(child => links.add(child));
    });

    return Array.from(links);
  }

}

module.exports = ClientMedia;