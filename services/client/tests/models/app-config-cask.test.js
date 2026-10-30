const assert = require('assert');
const express = require('express');
const request = require('supertest');
const config = require('../../config.js');
const cask = require('../../lib/cask.js');
const model = require('../../models/app-config/model.js');
const api = require('../../models/app-config/api.js');

const BASE = config.cask.goldBasePath;

describe('models/app-config caskfs config', () => {
  let originalRead, originalWrite, files, writes;

  beforeEach(() => {
    originalRead = cask.read;
    originalWrite = cask.write;
    files = {};
    writes = [];
    cask.read = async (path) => files[path] ?? null;
    cask.write = async (path, body, opts) => writes.push({path, body, opts});
    model.jsonCache = {};
  });

  afterEach(() => {
    cask.read = originalRead;
    cask.write = originalWrite;
  });

  function app() {
    let app = express();
    app.use(express.json());
    app.use('/api/app-config', api);
    return app;
  }

  it('GET returns [] before anything is saved', async () => {
    let res = await request(app()).get('/api/app-config/featured-collections');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  it('GET returns the saved panels', async () => {
    files[BASE + '/featured-collection-edits.json'] = JSON.stringify([{position: 0, type: 'single'}]);
    let res = await request(app()).get('/api/app-config/featured-collections');
    assert.deepEqual(res.body, [{position: 0, type: 'single'}]);
  });

  it('PUT requires a logged in admin', async () => {
    let res = await request(app()).put('/api/app-config/featured-collections').send([]);
    assert.equal(res.status, 403);
    assert.equal(writes.length, 0);
  });

  it('saveFeaturedEdits() writes edits.json to the gold project', async () => {
    let panels = [{position: 0, type: 'single', collectionId: '/collection/ark:/87293/d33t9dd5t'}];
    assert.deepEqual(await model.saveFeaturedEdits(panels), panels);
    assert.equal(writes[0].path, BASE + '/featured-collection-edits.json');
    assert.deepEqual(JSON.parse(writes[0].body), panels);
    assert.equal(writes[0].opts.mimeType, 'application/json');
  });

  it('saveFeaturedEdits() rejects anything but an array of objects', async () => {
    for( let body of [{}, null, [1], [[]]] ) {
      await assert.rejects(() => model.saveFeaturedEdits(body), e => e.status === 400);
    }
    assert.equal(writes.length, 0);
  });

  it('getHeroImages() maps hero.json entries to servable urls', async () => {
    files[BASE + '/hero-banner.json'] = JSON.stringify([{image: 'hero-banner/a.jpg', itemName: 'A', itemLink: '/item/a'}]);
    assert.deepEqual(await model.getHeroImages(), [
      {imageUrl: '/cask/api/fs' + BASE + '/hero-banner/a.jpg', itemName: 'A', itemLink: '/item/a'}
    ]);
  });

  it('getHeroImages() is [] without hero.json, and caches', async () => {
    assert.deepEqual(await model.getHeroImages(), []);
    files[BASE + '/hero-banner.json'] = JSON.stringify([{image: 'hero-banner/a.jpg'}]);
    assert.deepEqual(await model.getHeroImages(), []);
  });

  it('getBrowseBySideImages() maps left/right images to servable urls', async () => {
    files[BASE + '/browse-by.json'] = JSON.stringify({
      subjectPage: [{page: 1, leftImage: 'browse-by/l.png', leftLabel: 'L', rightImage: 'browse-by/r.png'}],
      formatPage: [{page: 1, leftLabel: 'no image'}]
    });

    let res = await request(app()).get('/api/app-config/browse-by/side-images');

    assert.deepEqual(res.body, {
      subjectPage: [{
        page: 1, leftLabel: 'L',
        leftImgUrl: '/cask/api/fs' + BASE + '/browse-by/l.png',
        rightImgUrl: '/cask/api/fs' + BASE + '/browse-by/r.png'
      }],
      formatPage: [{page: 1, leftLabel: 'no image'}]
    });
  });

  it('getBrowseBySideImages() is {} without browse-by.json', async () => {
    assert.deepEqual(await model.getBrowseBySideImages(), {});
  });
});
