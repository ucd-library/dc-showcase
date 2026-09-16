const {config, pg} = require('@ucd-lib/fin-service-utils');
const ioUtils = require('@ucd-lib/fin-api/lib/io/utils.js');

// const ARCHIVAL_GROUP = 'http://fedora.info/definitions/v4/repository#ArchivalGroup';
const ARCHIVAL_GROUP_REGEX = /^\/collection\/(ark:\/[a-z0-9]+\/[a-z0-9]+)/;

const PDF_IMAGE_PRODUCTS = 'pdf-image-products';
const STREAMING_VIDEO_WORKFLOW = 'video-to-stream';
const IMAGE_PRODUCTS = 'image-products';

module.exports = async function(path, graph, headers, utils) {
  let item = {};
  
  let container = utils.get(path, graph);
  let gitsource = utils.get(ioUtils.TYPES.GIT_SOURCE, graph);

  if( !container ) {
    throw new Error('unknown container: '+path);
  }
  

  utils.init(item, container);
  

  if( !utils.isType(container, 'http://fedora.info/definitions/v4/repository#Resource') ) {
    throw new Error('invalid type');
  }
  
  utils.ns({
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
    value : ['schema', 'name'],
    default : ''
  });
  
  await utils.add({
    attr : 'alternativeHeadline',
    value : ['schema', 'alternativeHeadline']
  });

  await utils.add({
    attr : 'contentSize',
    value : ['schema', 'contentSize']
  });

  await utils.add({
    attr : 'description',
    value : ['schema', 'description']
  });

  await utils.add({
    attr : 'creator',
    value : ['schema', 'creator'],
    type : 'id'
  });

  await utils.add({
    attr : 'publisher',
    value : ['schema', 'publisher']
  });

  await utils.add({
    attr : 'parent',
    value : ['fedora', 'hasParent'],
    type : 'id'
  });

  await utils.add({
    attr : 'isPartOf',
    value : ['schema', 'isPartOf'],
    type : 'id'
  });

  // await utils.add({
  //   attr : 'hasPart',
  //   value : ['schema', 'hasPart'],
  //   type : 'id'
  // });

  await utils.add({
    attr : 'image',
    value : ['schema', 'image'],
    type : 'id'
  });

  await utils.add({
    attr : 'associatedMedia',
    value : ['schema', 'associatedMedia'],
    type : 'id'
  });

  await utils.add({
    attr : 'encodesCreativeWork',
    value : ['schema', 'encodesCreativeWork'],
    type : 'id'
  });

  await utils.add({
    attr : 'workExample',
    value : ['schema', 'workExample'],
    type : 'id'
  });

  await utils.add({
    attr : 'thumbnailUrl',
    value : ['schema', 'thumbnailUrl'],
    type : 'id'
  });

  await utils.add({
    attr : 'lastModified',
    value : ['fedora', 'lastModified'],
    type : 'date'
  });

  // both schema:keywords and schema:about are used for subjects
  await utils.add({
    attr : 'subjects',
    value : ['schema', 'about'],
    type : 'id'
  });

  await utils.add({
    attr : 'subjects',
    value : ['schema', 'keywords'],
    parser : (value) => {
      if( typeof value === 'string' ) {
        return {name: value};
      }
      return value;
    }
  });

  // remove duplicate subjects
  if( item.subjects && Array.isArray(item.subjects) ) {
    let subjects = {};
    item.subjects = item.subjects.filter(subject => {
      if( !subject.name ) return true;
      if( subjects[subject.name] ) return false;
      subjects[subject.name] = true;
      return true;
    });
  }

  await utils.add({
    attr : 'datePublished',
    value : ['schema', 'datePublished']
  });

  await utils.add({
    attr : 'identifier',
    value : ['schema', 'identifier']
  });

  await utils.add({
    attr : 'material',
    value : ['schema', 'material']
  });

  await utils.add({
    attr : 'location',
    value : ['schema', 'location']
  });

  await utils.add({
    attr : 'language',
    value : ['schema', 'inLanguage'],
    type : 'id'
  });

  await utils.add({
    attr : 'license',
    value : ['schema', 'license'],
    type : 'id'
  });

  utils.stripFinHost(item);
  // await utils.setImage(item);
  await utils.setIndexableContent(item);

  utils.setYearFromDate(item);

  item._ = {};
  utils.stripFinHost(headers);

  // regex match for ark based fin archival group
  let ag = item['@id'].match(ARCHIVAL_GROUP_REGEX);
  if( ag ) {
    item._.graphId = '/collection/'+ag[1];
  }

  let fetchOpts = {headers: {}}
  utils.getAuthHeader(fetchOpts.headers);

  if( headers.link ) {
    // if( headers.link['archival-group'] ) {
    //   item._['archival-group'] = headers.link['archival-group'].map(item => item.url);
    //   item._.graphId = item._['archival-group'][0];
    // } else if( headers.link.type && 
    //   headers.link.type.find(item => item.rel === 'type' && item.url === ARCHIVAL_GROUP) ) {
    //   item._['archival-group'] = item['@id'];
    //   item._.graphId = item['@id'];
    // }

    item.clientMedia = {};

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

  if( !item._.graphId ) {
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

  // set the collection name to a graph property
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