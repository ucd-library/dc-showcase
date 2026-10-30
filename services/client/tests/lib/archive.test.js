const assert = require('assert');
const express = require('express');
const request = require('supertest');
const archive = require('../../lib/archive.js');

const PAGE = '/cask/api/fs/silver/g/c/latest/item/public-frontend-derivatives/images';

describe('lib/archive.js', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function app() {
    let app = express();
    app.get('/archive', (req, res) => archive.streamArchive(res, req.query.paths || [], { name: req.query.name }));
    return app;
  }

  it('caskPaths() splits a comma list and strips the cask api prefix', () => {
    assert.deepEqual(
      archive.caskPaths(`${PAGE}/a.tif/images/large.jpg,${PAGE}/b.tif/images/large.jpg`),
      ['/silver/g/c/latest/item/public-frontend-derivatives/images/a.tif/images/large.jpg',
        '/silver/g/c/latest/item/public-frontend-derivatives/images/b.tif/images/large.jpg']
    );
  });

  it('caskPaths() rejects non-cask urls and parent traversal', () => {
    assert.throws(() => archive.caskPaths('/etc/passwd'));
    assert.throws(() => archive.caskPaths('/cask/api/fs/../../gold/x.json'));
    assert.throws(() => archive.caskPaths('/cask/api/fs/silver/%2e%2e/%2e%2e/x'));
  });

  it('entryNames() uses file names when they are unique', () => {
    assert.deepEqual(archive.entryNames(['/a/one.jpg', '/b/two.jpg']), ['one.jpg', 'two.jpg']);
  });

  it('entryNames() stays flat and suffixes repeated names', () => {
    assert.deepEqual(
      archive.entryNames(['/x/a/page.tif', '/x/b/page.tif', '/x/c/page.tif']),
      ['page.tif', 'page-2.tif', 'page-3.tif']
    );
  });

  it('zipName() sanitizes and defaults the name', () => {
    assert.equal(archive.zipName('My Item!'), 'My-Item-.zip');
    assert.equal(archive.zipName(''), 'archive.zip');
  });

  it('streams the files as a zip attachment', async () => {
    let fetched = [];
    global.fetch = async (url) => {
      fetched.push(url);
      return new Response('file:' + url.split('/').pop());
    };

    let res = await request(app())
      .get('/archive')
      .query({ paths: `${PAGE}/a.tif,${PAGE}/b.tif`, name: 'item' })
      .buffer(true)
      .parse((res, cb) => {
        let chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => cb(null, Buffer.concat(chunks)));
      });

    assert.equal(res.status, 200);
    assert.equal(res.headers['content-type'], 'application/zip');
    assert.match(res.headers['content-disposition'], /filename="item\.zip"/);
    assert.equal(fetched.length, 2);
    // local file header signature
    assert.equal(res.body.readUInt32LE(0), 0x04034b50);
    let text = res.body.toString('latin1');
    assert.ok(text.includes('file:a.tif') && text.includes('file:b.tif'));
    assert.ok(!text.includes('images/'));
  });

  it('returns 404 json when the first file is missing', async () => {
    global.fetch = async () => new Response('nope', { status: 404 });
    let res = await request(app()).get('/archive').query({ paths: `${PAGE}/a.jpg` });
    assert.equal(res.status, 404);
    assert.equal(res.body.error, true);
  });

  it('returns 400 for paths outside CaskFS', async () => {
    let res = await request(app()).get('/archive').query({ paths: '/etc/passwd' });
    assert.equal(res.status, 400);
  });
});
