const assert = require('assert');
const uriUtils = require('../../lib/uri-utils.js');

const ITEM = 'https://digital.ucdavis.edu/item/ark:/87293/9191';
const COLLECTION = 'https://digital.ucdavis.edu/collection/ark:/87293/d33t9dd5t';

describe('lib/uri-utils.js', () => {

  it('maps item and collection URIs to site paths', () => {
    assert.equal(uriUtils.toPath(ITEM), '/item/ark:/87293/9191');
    assert.equal(uriUtils.toPath(ITEM+'#imagelist/D-612_001.tif'), '/item/ark:/87293/9191/imagelist/D-612_001.tif');
    assert.equal(uriUtils.toPath(COLLECTION), '/collection/ark:/87293/d33t9dd5t');
  });

  it('leaves other values alone', () => {
    assert.equal(uriUtils.toPath('http://rightsstatements.org/vocab/InC-NC/1.0/'), 'http://rightsstatements.org/vocab/InC-NC/1.0/');
    assert.equal(uriUtils.toPath('http://digital.ucdavis.edu/schema#ImageList'), 'http://digital.ucdavis.edu/schema#ImageList');
    assert.equal(uriUtils.toUri('/search'), '/search');
    assert.equal(uriUtils.toPath(5), 5);
  });

  it('round trips paths back to URIs', () => {
    for( let uri of [ITEM, ITEM+'#imagelist', ITEM+'#imagelist/x.tif', ITEM+'#media/doc.pdf:0', COLLECTION] ) {
      assert.equal(uriUtils.toUri(uriUtils.toPath(uri)), uri);
    }
  });

  it('encodes fragment segments like python quote', () => {
    let uri = ITEM+"#imagelist/my%20page%28a%29.tif";
    // decoded path from the router
    assert.equal(uriUtils.toUri("/item/ark:/87293/9191/imagelist/my page(a).tif"), uri);
    // already encoded path from a translated doc
    assert.equal(uriUtils.toUri(uriUtils.toPath(uri)), uri);
    assert.equal(uriUtils.normalizePath("/item/ark:/87293/9191/imagelist/my page(a).tif"), uriUtils.toPath(uri));
  });

  it('translates string values and object keys in a document', () => {
    let doc = {
      '@id': ITEM,
      '@graph': [{'@id': ITEM, image: {'@id': ITEM+'#imagelist/a.tif'}, isPartOf: [{'@id': COLLECTION}]}],
      clientMedia: {[ITEM+'#imagelist/a.tif']: {images: {}}}
    };
    assert.deepEqual(uriUtils.translateDoc(doc), {
      '@id': '/item/ark:/87293/9191',
      '@graph': [{
        '@id': '/item/ark:/87293/9191',
        image: {'@id': '/item/ark:/87293/9191/imagelist/a.tif'},
        isPartOf: [{'@id': '/collection/ark:/87293/d33t9dd5t'}]
      }],
      clientMedia: {'/item/ark:/87293/9191/imagelist/a.tif': {images: {}}}
    });
  });
});
