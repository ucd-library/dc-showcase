const {config, RDF_URIS, gc} = require('@ucd-lib/fin-service-utils');
const api = require('@ucd-lib/fin-api');
const fetch = require('node-fetch');
const {gcs} = gc;

const PDF_IMAGE_PRODUCTS = 'pdf-image-products';
const IMAGE_PRODUCTS = 'image-products';
const IMAGE_LIST = 'http://digital.ucdavis.edu/schema#ImageList';
const ARCHIVAL_GROUP_REGEX = /(^ark:\/[a-z0-9]+\/[a-z0-9]+)/;


module.exports = async function(path, graph, headers, utils) {

  let archivalGroup = '';
  let manifest = null;
  let manifestHash = null;
  let item = {};

  let container = utils.get(path, graph);
  utils.init(item, container);  
  utils.stripFinHost(item);
  utils.stripFinHost(headers);

  utils.ns({
    "ebucore" : "http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#",
    "schema": "http://schema.org/"
  });

  await utils.add({
    attr : 'name',
    value : ['schema', 'name']
  });

  await utils.add({
    attr : 'fileFormat',
    value : ['ebucore', 'hasMimeType']
  });

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
    attr : 'isPartOf',
    value : ['schema', 'isPartOf'],
    type : 'id'
  });

  await utils.add({
    attr : 'hasPart',
    value : ['schema', 'hasPart'],
    type : 'id'
  });

  await utils.add({
    attr : 'filename',
    value : ['ebucore', 'filename']
  });

  let identifiers = item.identifier || [];
  for( let id of identifiers ) {
    let ag = id.match(ARCHIVAL_GROUP_REGEX);
    if( ag ) {
      archivalGroup = ag[1];
      break;
    }
  }

  if( headers.link ) {
    // if( headers.link['archival-group'] ) {
    //   archivalGroup = headers.link['archival-group'].map(item => item.url)[0];
    // } else if( headers.link.type && 
    //   headers.link.type.find(item => item.rel === 'type' && item.url === RDF_URIS.TYPES.ARCHIVAL_GROUP) ) {
    //   archivalGroup = item['@id'];
    // }

    // check for completed ia reader workflow
    if( headers.link.workflow ) {
      let pdf = headers.link.workflow.find(item => PDF_IMAGE_PRODUCTS === item.type);
      let image = headers.link.workflow.find(item => IMAGE_PRODUCTS === item.type);

      if( pdf ) {
        let workflowInfo = await fetch(getGatewayUrl(pdf.url));
        workflowInfo = await workflowInfo.json();

        manifest = config.gateway.host+config.fcrepo.root+item['@id'] + '/svc:gcs/' + workflowInfo.data.gcsBucket+'/'+workflowInfo.data.gcsSubpath+'/manifest.json'

        manifestHash = await gcs.getGcsFileMetadata('gs://'+workflowInfo.data.gcsBucket+item['@id']+'/'+workflowInfo.data.gcsSubpath+'/manifest.json');
        if( manifestHash ) {
          manifestHash = manifestHash.md5Hash;
        }
      } else if ( image ) {
        let workflowInfo = await fetch(getGatewayUrl(image.url));
        workflowInfo = await workflowInfo.json();

        manifest = config.gateway.host+config.fcrepo.root+item['@id'] + '/svc:gcs/' + workflowInfo.data.gcsBucket+'/'+workflowInfo.data.gcsSubpath+'/manifest.json'

        manifestHash = await gcs.getGcsFileMetadata('gs://'+workflowInfo.data.gcsBucket+item['@id']+'/'+workflowInfo.data.gcsSubpath+'/manifest.json');
        if( manifestHash ) {
          manifestHash = manifestHash.md5Hash;
        }
      }
    }
  }

  // look up parent, if it's an image list, that image list encodesCreativeWork
  // otherwise it's the item itself
  let parent = item['@id'].split('/').slice(0, -1).join('/');
  item.encodesCreativeWork = item['@id'];
  let parentContainer = await api.head({path: parent});
  if( parentContainer.last.statusCode === 200 ) {
    let links = api.parseLinkHeader(parentContainer.last.headers.link);
    if( links.type && links.type.find(item => item.url === IMAGE_LIST) ) {
      item.encodesCreativeWork = parent;
    }
  }

  if( !manifest ) {
    throw new Error('container does not have image manifest: '+path);
  }

  item.manifest = manifest;

  return {
    '@id' : archivalGroup,
    '@graph' : [item]
  }
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