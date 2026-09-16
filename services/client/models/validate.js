const RecordGraph = require('../ucd-lib-client/client/public/lib/utils/RecordGraph');
const fetch = require('node-fetch');


class Validate {

  /**
   * @method validateItem
   * @description validate an data model item or collection
   * 
   * @param {Object} jsonld 
   * @returns {Object}
   */
  async validateItem(jsonld, serverHost) {
    if( !jsonld ) {
      throw new Error('Elastic search response is empty');
    }

    let result = {
      id : jsonld['@id'],
      errors : [],
      warnings : [],
      comments : []
    };

    let graph = new RecordGraph(jsonld);

    // graph checks
    if( !graph.root ) {
      result.errors.push('No root node found in graph');
      return result;
    }

    if( !graph.data['@graph'] ) {
      result.errors.push('No @graph found');
    } else if( !graph.root['@shortType'].includes('Collection') ) {
      // check that all nodes are crawlable from root
      let nodeCount = jsonld['@graph'].length;

      try {
        let crawled = this._validateCrawlable(graph, graph.root);
        if( crawled.length !== nodeCount ) {
          let missing = [];
          for( let node of jsonld['@graph'] ) {
            if( !crawled.includes(node['@id']) ) {
              // skip direct containers
              if( !node['@shortType'].includes('DirectContainer') && !node['@shortType'].includes('IndirectContainer') ) {
                missing.push(node['@id']);
              }
            }
          }

          if( missing.length ) {
            result.warnings.push({
              label : 'Not all nodes are crawlable from root',
              id: missing
            });
          }
        }
      } catch(e) { 
        result.errors.push({
          label : 'Error validating crawlable nodes',
          message : e.message,
          stack : e.stack
        });
      }
    }

    // ensure items are associated with a collection
    if( !graph.root['@shortType'].includes('Collection') ) {
      let isPartOf = graph.root.isPartOf;
      let found = false;
      let collectionId;

      if( !isPartOf ) {
        result.errors.push('Collection isPartOf not found');
      } else {
        if( !Array.isArray(isPartOf) ) {
          isPartOf = [isPartOf];
        }

        for( let part of isPartOf ) {
          if( !part['@id'] ) {
            continue;
          } else if( part['@id'].match(/^\/collection\//) ) {
            collectionId = part['@id'];
            found = true;
            break;
          }
        }

        if( !found ) {
          result.errors.push('Collection isPartOf not found');
        }
      }

      // also make sure we can fetch the collection to get its name
      if( found && collectionId) {
        const collectionModel = require('./collection/model');
        try {
          let collection = await collectionModel.get(collectionId);
          if( !collection || !collection.name ) {
            result.errors.push({
              label : 'Collection name not found for id: '+collectionId,
            });
          }
        } catch(e) {
          result.errors.push({
            label : 'Error fetching collection name for id: '+collectionId,
            message : e.message
          });
        }
      }
    }

    // check subjects
    if( !graph.root.subjects ) {
      result.warnings.push('No subjects found');
    } else {
      let found = false;

      if( !Array.isArray(graph.root.subjects) ) {
        graph.root.subjects = [graph.root.subjects];
      }

      for( let subject of graph.root.subjects ) {
        if( subject.name ) {
          found = true;
        } else {
          result.comments.push({
            label : 'Subject has no name', 
            id : subject['@id']
          });
        }
      }
      if( !found ) {
        result.warnings.push('No subjects found with a name');
      }
    }

    // check that all nodes in graph exist.  The mediaModel keeps track of
    // these when crawling
    let missingNodes = Array.from(graph.clientMedia.missingNodes);
    if( missingNodes.length ) {
      result.errors.push({
        label : 'Missing media graph nodes',
        id : missingNodes
      });
    }

    // media checks
    if( graph.clientMedia.mediaGroups.length === 0 ) {
      result.errors.push('No media groups found');
    }

    // check that all media groups have images
    for( let node of graph.clientMedia.mediaGroups ) {
      if( !node.clientMedia ) {
        result.errors.push({
          label : 'Media group has no clientMedia',
          id : node['@id']
        });
        continue;
      }

      // check for a download
      if( !node.clientMedia.download ) {
        result.errors.push({
          label : 'Media group has no download',
          id : node['@id']
        });
      }

      if( !node.clientMedia.images ) {
        result.errors.push({
          label : 'Media group has no images',
          id : node['@id']
        });
        continue;
      }
      let images = node.clientMedia.images;

      let missingOriginal = false;
      if( !images.original ) {
        missingOriginal = true;
      } else if( images.original.missing === true ) {
        missingOriginal = true;
      }

      // if( missingOriginal ) {
      //   result.errors.push('Media has no original image: '+node['@id']);
      //   continue;
      // }

      if( !images.large || !images.medium || !images.small ) {
        if( missingOriginal ) {
          result.errors.push({
            label : 'Media group is missing sized image and has no original',
            id : node['@id']
          });
        } else {
          result.warnings.push({
            label : 'Media group is missing sized image',
            id : node['@id']
          });
        }
      }

      if( !images.ocr ) {
        result.warnings.push({
          label : 'Image is missing ocr file',
          id : node['@id']
        });
      }

      let pdf = node.clientMedia.pdf;
      if( !pdf && node.fileFormat && node.fileFormat.includes('pdf') ) {
        result.errors.push({
          label : 'No pdf client media found for',
          id : node['@id']
        });
      }
      if( pdf && pdf.manifest ) {
        let url = serverHost+pdf.manifest;
        let hResp = await fetch(serverHost+pdf.manifest, {method: 'HEAD'});
        if( hResp.status !== 200 ) {
          result.errors.push({
            label : 'Pdf client media manifest is not available',
            id : node['@id'],
            manifest : url,
            status : hResp.status
          });
        }
      }

    }

    return result;
  }

  _validateCrawlable(graph, currentNode, crawled=[]) {
    if( !crawled.includes(currentNode['@id']) ) {
      crawled.push(currentNode['@id']);
    }
    let links = graph.getChildren(currentNode);

    for( let link in links ) {
      for( let child of links[link] ) {
        if( !child['@id'] ) continue;
        if( crawled.includes(child['@id']) ) continue;
        crawled.push(child['@id']);
        this._validateCrawlable(graph, child, crawled);
      }
    }

    return crawled;
  }

}

module.exports = new Validate();