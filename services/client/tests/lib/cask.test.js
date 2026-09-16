const assert = require('assert');
const config = require('../../config.js');
const cask = require('../../lib/cask.js');

describe('lib/cask.js', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('presents the configured CaskFS identity as an x-user header', () => {
    assert.deepEqual(cask.headers(), { 'x-user': JSON.stringify({ username: config.cask.user }) });
  });

  it('find() calls /api/find with the given subject/limit', async () => {
    let calledUrl;
    global.fetch = async (url) => {
      calledUrl = url;
      return { ok: true, json: async () => ({ totalCount: 0, results: [] }) };
    };

    await cask.find({ subject: 'ark:/87287/d73035', limit: 1 });

    assert.ok(calledUrl.startsWith(`${config.cask.url}${config.cask.pathPrefix}/api/find?`));
    let query = new URL(calledUrl).searchParams;
    assert.equal(query.get('subject'), 'ark:/87287/d73035');
    assert.equal(query.get('limit'), '1');
  });

  it('find() throws on a non-ok response', async () => {
    global.fetch = async () => ({ ok: false, status: 500, text: async () => 'boom' });
    await assert.rejects(() => cask.find({ subject: 'x' }));
  });

  it('resolvePath() returns the first result\'s filepath', async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ totalCount: 1, results: [{ filepath: '/gold/digital-dev/item-a/item.jsonld.json' }] })
    });

    let resolved = await cask.resolvePath('ark:/87287/d73035');
    assert.equal(resolved, '/gold/digital-dev/item-a/item.jsonld.json');
  });

  it('resolvePath() returns null when nothing matches', async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ totalCount: 0, results: [] }) });
    assert.equal(await cask.resolvePath('ark:/87287/dNOPE'), null);
  });

  it('getMetadata() requests the metadata representation of a file', async () => {
    let calledUrl;
    global.fetch = async (url) => {
      calledUrl = url;
      return { ok: true, json: async () => ({ fullPath: '/cas/ab/cd/abcd1234' }) };
    };

    let metadata = await cask.getMetadata('/gold/digital-dev/item-a/photo.tif');
    assert.equal(calledUrl, `${config.cask.url}${config.cask.pathPrefix}/api/fs/gold/digital-dev/item-a/photo.tif?metadata=true`);
    assert.equal(metadata.fullPath, '/cas/ab/cd/abcd1234');
  });

  it('casRelativePath() mirrors CaskFS\'s own hash-sharding convention', () => {
    assert.equal(cask.casRelativePath('abcdef0123456789'), '/cas/abc/def/abcdef0123456789');
  });

  it('fileUrl() builds the content-stream URL for a file path', () => {
    assert.equal(
      cask.fileUrl('/gold/digital-dev/item-a/item.jsonld.json'),
      `${config.cask.url}${config.cask.pathPrefix}/api/fs/gold/digital-dev/item-a/item.jsonld.json`
    );
  });
});
