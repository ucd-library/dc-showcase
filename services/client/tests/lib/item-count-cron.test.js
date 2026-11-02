const assert = require('assert');
const client = require('../../lib/es-client.js');
const collectionModel = require('../../models/collection/model.js');
const cron = require('../../lib/item-count-cron.js');

/**
 * @description build a collection ES hit with a root itemCount.
 *
 * @param {String} id collection @id
 * @param {Number} itemCount stored root itemCount
 *
 * @returns {Object} ES hit
 */
function hit(id, itemCount) {
  return {_id: id, _source: {'@id': id, '@graph': [{'@id': id, itemCount}]}};
}

describe('lib/item-count-cron.js', () => {
  let original, updates, counts;

  beforeEach(() => {
    original = {
      search: client.search,
      update: client.update,
      getItemCount: collectionModel.getItemCount
    };
    updates = [];
    counts = {};
    client.update = async (req) => updates.push(req);
    collectionModel.getItemCount = async (id) => {
      if( counts[id] instanceof Error ) throw counts[id];
      return counts[id];
    };
  });

  afterEach(() => {
    client.search = original.search;
    client.update = original.update;
    collectionModel.getItemCount = original.getItemCount;
    cron.stop();
  });

  it('only updates collections whose count changed', async () => {
    client.search = async () => ({hits: {hits: [hit('/collection/a', 3), hit('/collection/b', 5)]}});
    counts = {'/collection/a': 3, '/collection/b': 6};

    let summary = await cron.run();

    assert.deepEqual(summary, {checked: 2, updated: 1, failed: 0});
    assert.equal(updates.length, 1);
    assert.equal(updates[0].index, 'collection-write');
    assert.equal(updates[0].id, '/collection/b');
    assert.deepEqual(updates[0].script.params, {id: '/collection/b', count: 6});
  });

  it('sets a count on a collection that has none', async () => {
    client.search = async () => ({hits: {hits: [hit('/collection/a', undefined)]}});
    counts = {'/collection/a': 0};

    await cron.run();

    assert.equal(updates.length, 1);
  });

  it('keeps going when one collection fails', async () => {
    client.search = async () => ({hits: {hits: [hit('/collection/a', 1), hit('/collection/b', 1)]}});
    counts = {'/collection/a': new Error('boom'), '/collection/b': 2};

    let summary = await cron.run();

    assert.deepEqual(summary, {checked: 2, updated: 1, failed: 1});
    assert.equal(updates[0].id, '/collection/b');
  });

  it('skips a run while one is in progress', async () => {
    let release;
    client.search = () => new Promise(resolve => { release = resolve; });

    let first = cron.run();
    assert.equal(await cron.run(), null);
    release({hits: {hits: []}});
    assert.deepEqual(await first, {checked: 0, updated: 0, failed: 0});
  });

  it('does not start when disabled', () => {
    assert.equal(cron.start({enabled: false}), false);
  });
});
