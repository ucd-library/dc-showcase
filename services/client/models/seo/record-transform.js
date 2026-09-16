const remove = ['createdBy', 'lastModifiedBy', 'yearPublished', 
'collectionId', 'isRootRecord', 'parent', 'creators', 'abouts', 'identifiers',
'fileFormats', 'indexableContents', 'indexableContent', 'type', 'textIndexable',
'media', 'clientMedia', 'clientMediaDownload', 'itemCount', '_'];
const nested = ['associatedMedia', 'hasPart'];

const map = {
  lastModified : 'dateModified'
}

function transform(jsonld, clientMedia, nestedKey) {
  jsonld['@context'] = {
    "@vocab" : "http://schema.org/"
  }

  if( jsonld.error === true ) {
    jsonld.error = {
      description : jsonld.message
    }
    delete jsonld.message;
    return jsonld;
  } 

  if( jsonld.image ) {
    jsonld.image['@type'] = 'ImageObject';
    if( jsonld.image.colorPalette ) delete jsonld.image.colorPalette;
    if( jsonld.image.iiif ) delete jsonld.image.iiif;

    if( jsonld.image.filename ) {
      if( !jsonld.image.name ) jsonld.image.name = jsonld.image.filename;
      delete jsonld.image.filename;
    }
    if( jsonld.fileSize ) {
      if( !jsonld.image.contentSize ) jsonld.image.contentSize = jsonld.fileSize;
      delete jsonld.fileSize;
    }
    if( jsonld.image.fileFormat ) {
      if( !jsonld.image.encodingFormat ) jsonld.image.encodingFormat = jsonld.image.fileFormat;
      delete jsonld.image.fileFormat;
    }
    if( jsonld.image.clientMedia ) delete jsonld.image.clientMedia;
    if( jsonld.image._ ) delete jsonld.image._;
    if( jsonld.image['@shortType'] ) delete jsonld.image['@shortType'];
    if( jsonld.image.id ) delete jsonld.image.id;
    if( jsonld.image['@id'] ) {
      jsonld.image.url = '/fcrepo/rest'+jsonld.image['@id'];
      delete jsonld.image['@id'];
    }
  } else if( jsonld.filename || jsonld.fileSize || jsonld.fileFormat) {
    if( jsonld.filename ) {
      if( !jsonld.name ) jsonld.name = jsonld.filename;
      delete jsonld.filename;
    }
    if( jsonld.fileSize ) {
      if( !jsonld.contentSize ) jsonld.contentSize = jsonld.fileSize;
      delete jsonld.fileSize;
    }
    if( jsonld.fileFormat ) {
      if( !jsonld.encodingFormat ) jsonld.encodingFormat = jsonld.fileFormat;
      delete jsonld.fileFormat;
    }
  }

  if( jsonld.license ) {
    if( jsonld.license['@id'] ) jsonld.license = jsonld.license['@id'];
    else if( jsonld.license['name'] ) jsonld.license = jsonld.license['name'];
    else delete jsonld.license;
  }

  let types = jsonld['@type'];
  if( types ) {
    for( let i = types.length-1; i >= 0; i-- ) {
      if( !types[i].match(/^http:\/\/schema.org/) ) {
        types.splice(i, 1);
      }
    }
  }

  remove.forEach(key => {
    if( jsonld[key] ) delete jsonld[key];
  });

  for( let key in map ) {
    if( jsonld[key] ) {
      if( !jsonld[map[key]] ) jsonld[map[key]] = jsonld[key];
      delete jsonld[key];
    }
  }
  
  nested.forEach(key => {
    let data = (jsonld[key] || [])
    if( !Array.isArray(data) ) data = [data];
    data.forEach(item => 
      transform(item, clientMedia, key)
    );
  });
  
  return jsonld;
}

 module.exports = transform;