const {config, pg, models} = require('@ucd-lib/fin-service-utils');
const ioUtils = require('@ucd-lib/fin-api/lib/io/utils.js');
const fetch = require('node-fetch');

const ControllerUtils = require('../utils.js');

const BINARY = 'http://fedora.info/definitions/v4/repository#Binary';
// const ARCHIVAL_GROUP = 'http://fedora.info/definitions/v4/repository#ArchivalGroup';
const ARCHIVAL_GROUP_REGEX = /^\/item\/(ark:\/[a-z0-9]+\/[a-z0-9]+)/;


const PDF_IMAGE_PRODUCTS = 'pdf-image-products';
const STREAMING_VIDEO_WORKFLOW = 'video-to-stream';
const IMAGE_PRODUCTS = 'image-products';

module.exports = async function(path, graph, headers, utils) {
  let item = {};

  let collectionModel = await models.get('collection');
  collectionModel = collectionModel?.model;

  let container = utils.get(path, graph);
  let gitsource = utils.getByType(ioUtils.TYPES.GIT_SOURCE, graph);

  if( !container ) {
    throw new Error('unknown container: '+path);
  }
  
  utils.init(item, container);  

  // if( !utils.isType(container, 'http://fedora.info/definitions/v4/repository#Resource') ) {
  //   throw new Error('invalid type');
  // }
  
  utils.ns({
    "ldp" : "http://www.w3.org/ns/ldp#",
    "fedora" : "http://fedora.info/definitions/v4/repository#",
    "fast": "http://id.worldcat.org/fast/",
    "lcna": "http://id.loc.gov/authorities/names/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "schema": "http://schema.org/",
    "ucdlib": "http://digital.ucdavis.edu/schema#",
    "premis" : "http://www.loc.gov/premis/rdf/v1#",
    "ebucore" : "http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#"
  });

  await utils.add({
    attr : 'name',
    value : ['schema', 'name']
  });

  await utils.add({
    attr : 'audio',
    value : ['schema', 'audio'],
    type: 'id'
  });

  await utils.add({
    attr : 'alternativeHeadline',
    value : ['schema', 'alternativeHeadline']
  });

  await utils.add({
    attr : 'associatedMedia',
    value : ['schema', 'associatedMedia'],
    type : 'id'
  });

  await utils.add({
    attr : 'caption',
    value : ['schema', 'caption'],
    type : 'id'
  });

  await utils.add({
    attr : 'contentSize',
    value : ['schema', 'contentSize']
  });

  await utils.add({
    attr : 'creator',
    value : ['schema', 'creator'],
    type : 'id'
  });

  await utils.add({
    attr : 'datePublished',
    value : ['schema', 'datePublished']
  });
  
  await utils.add({
    attr : 'description',
    value : ['schema', 'description']
  });

  await utils.add({
    attr : 'encodesCreativeWork',
    value : ['schema', 'encodesCreativeWork'],
    type : 'id'
  });

  await utils.add({
    attr : 'encodingFormat',
    value : ['schema', 'encodingFormat']
  });

  await utils.add({
    attr : 'fileFormat',
    value : ['ebucore', 'hasMimeType']
  });

  await utils.add({
    attr : 'fileFormatSimple',
    value : ['ebucore', 'hasMimeType'],
    parser : (value) => {
      let parts = value.split('/');

      if( parts[0] === 'video' ) return 'video';
      if( parts[0] === 'audio' ) return 'audio';
      if( parts[0] === 'image' ) return 'image';
      
      if( value === 'text/plain' ) return 'text';
      if( value === 'application/pdf' ) return 'pdf';

      console.log(parts, value);
     
      return null;
    }
  });

  await utils.add({
    attr : 'filename',
    value : ['ebucore', 'filename']
  });

  await utils.add({
    attr : 'fileSize',
    value : ['premis', 'hasSize'],
    type : 'number'
  });

  await utils.add({
    attr : 'hasPart',
    value : ['schema', 'hasPart'],
    type : 'id'
  });

  await utils.add({
    attr : 'mainEntity',
    value : ['schema', 'mainEntity'],
    type : 'id'
  });

  await utils.add({
    attr : 'identifier',
    value : ['schema', 'identifier']
  });

  await utils.add({
    attr : 'image',
    value : ['schema', 'image'],
    type : 'id'
  });

  await utils.add({
    attr : 'isPartOf',
    value : ['schema', 'isPartOf'],
    type : 'id'
  });

  await utils.add({
    attr : 'subjects',
    value : ['schema', 'about'],
    type : 'id'
  });

  // remove duplicate subjects
  if( item.subjects && Array.isArray(item.subjects)) {
    let subjects = {};
    item.subjects = item.subjects.filter(subject => {
      if( !subject.name ) return true;
      if( subjects[subject.name] ) return false;
      subjects[subject.name] = true;
      return true;
    });
  }

  await utils.add({
    attr : 'language',
    value : ['schema', 'inLanguage'],
    type : 'id'
  });
  
  await utils.add({
    attr : 'lastModified',
    value : ['fedora', 'lastModified'],
    type : 'date'
  });

  await utils.add({
    attr : 'license',
    value : ['schema', 'license'],
    type : 'id'
  });

  await utils.add({
    attr : 'material',
    value : ['schema', 'material']
  });

  await utils.add({
    attr : 'parent',
    value : ['fedora', 'hasParent'],
    type : 'id'
  });

  // await utils.add({
  //   attr : 'contains',
  //   value : ['ldp', 'contains'],
  //   type : 'id'
  // });

  await utils.add({
    attr : 'position',
    value : ['schema', 'position']
  });

  await utils.add({
    attr : 'publisher',
    value : ['schema', 'publisher'],
    type : 'id'
  });

  await utils.add({
    attr : 'textIndexable',
    value : ['ucdlib', 'textIndexable'],
    type : 'boolean'
  });

  await utils.add({
    attr : 'thumbnailUrl',
    value : ['schema', 'thumbnailUrl'],
    type : 'id'
  });

  await utils.add({
    attr: 'transcript',
    value: ['schema', 'transcript'],
    type: 'id'
  });

  await utils.add({
    attr : 'video',
    value : ['schema', 'video'],
    type: 'id'
  });

  await utils.add({
    attr : 'videoFrameSize',
    value : ['schema', 'videoFrameSize']
  });

  await utils.add({
    attr : 'videoQuality',
    value : ['schema', 'videoQuality']
  });

  await utils.add({
    attr : 'workExample',
    value : ['schema', 'workExample'],
    type : 'id'
  });

  utils.stripFinHost(item);
  // await utils.setImage(item);
  await utils.setIndexableContent(item);

  utils.setYearFromDate(item);  

  item._ = {};
  if( !item.clientMedia ) {
    item.clientMedia = {};
  }

  utils.stripFinHost(headers)

  let fetchOpts = {headers: {}}
  utils.getAuthHeader(fetchOpts.headers);

  // regex match for ark based fin archival group
  let ag = item['@id'].match(ARCHIVAL_GROUP_REGEX);
  if( ag ) {
    item._.graphId = '/item/'+ag[1];
  }

  // build text_search_description, composite for searching
  let textSearchDescription = [];  
  if( item._.graphId === item['@id'] ) {
    // add collectionName using the isPartOf id
    if( item.isPartOf ) {
      try {
        // fetch collection
        if( !Array.isArray(item.isPartOf) ) item.isPartOf = [item.isPartOf];
        let collectionId = item.isPartOf.find(part => part['@id'].includes('/collection/'))?.['@id'];
        let collection = await collectionModel.get(collectionId);
        if( collection ) {
          textSearchDescription.push(collection.name);
        }
      } catch(e) {
        // handled in validate.js
      }     
    }

    ControllerUtils.appendJsonLdToArray(item.name, textSearchDescription);
    ControllerUtils.appendJsonLdToArray(item.creator, textSearchDescription);
    ControllerUtils.appendJsonLdToArray(item.subjects, textSearchDescription);
    ControllerUtils.appendJsonLdToArray(item.description, textSearchDescription);
    ControllerUtils.appendJsonLdToArray(item.alternativeHeadline, textSearchDescription);
    item.text_search_description = textSearchDescription.join('\n\n');
  }

  if( headers.link ) {
    // if( headers.link['archival-group'] ) {
    //   item._['archival-group'] = headers.link['archival-group'].map(item => item.url);
    //   item._.graphId = item._['archival-group'][0];
    // } else if( headers.link.type && 
    //   headers.link.type.find(item => item.rel === 'type' && item.url === ARCHIVAL_GROUP) ) {
    //   item._['archival-group'] = item['@id'];
    //   item._.graphId = item['@id'];
    // }

    // check for completed ia reader workflow
    if( headers.link.workflow ) {
      let pdfImageProducts = headers.link.workflow.find(item => PDF_IMAGE_PRODUCTS === item.type);
      let imageProducts = headers.link.workflow.find(item => IMAGE_PRODUCTS === item.type);
      if( pdfImageProducts ) {
        let workflowInfo = await fetch(getGatewayUrl(pdfImageProducts.url), fetchOpts);
        workflowInfo = await workflowInfo.json()

        // fetch the first image product
        let manifest = await fetch(config.gateway.host+config.fcrepo.root+item['@id']+'/svc:gcs/'+workflowInfo.data.gcsBucket+'/'+workflowInfo.data.gcsSubpath+'/0/manifest.json', fetchOpts);
        item.clientMedia.images = await manifest.json();

        // set the full manifest url, this could be big, we will not fetch
        item.clientMedia.pdf = {
          manifest : config.fcrepo.root+item['@id'] + '/svc:gcs/'+workflowInfo.data.gcsBucket+'/'+workflowInfo.data.gcsSubpath+'/manifest.json'
        }
      } else if( imageProducts ) {
        let workflowInfo = await fetch(getGatewayUrl(imageProducts.url), fetchOpts);
        workflowInfo = await workflowInfo.json()
        let manifest = await fetch(config.gateway.host+config.fcrepo.root+item['@id']+'/svc:gcs/'+workflowInfo.data.gcsBucket+'/'+workflowInfo.data.gcsSubpath+'/manifest.json', fetchOpts);
        item.clientMedia.images = await manifest.json();
      }

      let streamVideoSupport = headers.link.workflow.find(item => STREAMING_VIDEO_WORKFLOW === item.type);
      if( streamVideoSupport ) {
        let workflowInfo = await fetch(getGatewayUrl(streamVideoSupport.url), fetchOpts);
        workflowInfo = await workflowInfo.json()

        item.clientMedia.streamingVideo = {
          manifest : config.fcrepo.root+item['@id'] + '/svc:gcs/'+workflowInfo.data.gcsBucket+'/'+workflowInfo.data.gcsSubpath+'/playlist.m3u8'
        }
      }
    }
  }

  // only add if there is content
  if( Object.keys(item.clientMedia).length === 0 ) {
    delete item.clientMedia;
  }

  if( !item._.graphId && item['@type'].includes(BINARY) ) {
    item._.graphId = item['@id'];
  }

  if( gitsource ) {
    item._.source = {};
    for( let attr in gitsource ) {
      if( !attr.startsWith(ioUtils.GIT_SOURCE_PROPERTY_BASE) ) continue;
      item._.source[attr.replace(ioUtils.GIT_SOURCE_PROPERTY_BASE, '')] = gitsource[attr][0]['@value'] || gitsource[attr][0]['@id'];
    }
    item._.source.type = 'git';
  }

  // let edits = await pg.query('SELECT * FROM fin_cache.dams_edits WHERE target = $1', ['info:fedora'+item['@id']]);
  // if( edits.rows.length > 0 ) {
  //   item.damsEdits = {};
  //   for( let edit of edits.rows ) {
  //     item.damsEdits[edit.property.replace('http://digital.ucdavis.edu/schema#', '')] = {
  //       'value' : edit.value,
  //       '@id' : edit.edit_id,
  //     }
  //   }
  //   item.damsEdits.exists = true;
  // }

  graph = {
    '@id' : item._.graphId,
    '@graph' : [item],
  };
  delete item._.graphId;

  if( graph['@id'] === item['@id'] ) {
    graph.name = item.name;
  }

  return graph;
}

function getGatewayUrl(url='') {
  if( url.startsWith('http') ) {
    url = new URL(url);
    return config.gateway.host+url.pathname+url.search;
  } else if( url.startsWith('/fcrepo/rest') ) {
    return config.gateway.host+url;
  }
  return config.gateway.host+'/fcrepo/rest'+url;
}