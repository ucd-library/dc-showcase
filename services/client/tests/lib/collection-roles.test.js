const assert = require('assert');
const client = require('../../lib/es-client.js');
const collectionRoles = require('../../lib/collection-roles.js');

const COLLECTION = 'https://digital.ucdavis.edu/collection/ark:/87293/d33t9dd5t';

describe('lib/collection-roles.js', () => {
  let original, updates, itemHits;

  beforeEach(() => {
    original = {search: client.search, updateByQuery: client.updateByQuery};
    updates = [];
    itemHits = [];
    client.updateByQuery = async (req) => {
      updates.push(req);
      return {updated: 2};
    };
    client.search = async () => ({hits: {hits: itemHits}});
  });

  afterEach(() => {
    client.search = original.search;
    client.updateByQuery = original.updateByQuery;
  });

  it('updates every collection, item and page index', async () => {
    itemHits = [{_id: '/item/a'}, {_id: '/item/b'}];

    let result = await collectionRoles.set('/collection/ark:/87293/d33t9dd5t', 'public');

    assert.deepEqual(updates.map(u => u.index), ['collection-*', 'item-*', 'page-search-*']);
    assert.deepEqual(updates[0].query, {term: {'@id': COLLECTION}});
    assert.deepEqual(updates[0].script.params, {roles: ['public', 'admin'], id: COLLECTION, visibility: 'public'});
    assert.deepEqual(updates[1].query, {term: {'@graph.isPartOf.@id': COLLECTION}});
    assert.deepEqual(updates[2].query, {terms: {'@id': ['/item/a', '/item/b']}});
    assert.ok(updates.every(u => u.allow_no_indices && u.ignore_unavailable));
    assert.deepEqual(result, {roles: ['public', 'admin'], collection: 2, items: 2, pages: 2});
  });

  it('dedupes item ids found in several item indexes', async () => {
    itemHits = [{_id: '/item/a'}, {_id: '/item/a'}, {_id: '/item/b'}];

    await collectionRoles.set(COLLECTION, 'private');

    assert.deepEqual(updates[2].query, {terms: {'@id': ['/item/a', '/item/b']}});
    assert.deepEqual(updates[1].script.params, {roles: ['admin']});
  });

  it('skips the page update when the collection has no items', async () => {
    let result = await collectionRoles.set(COLLECTION, 'private');

    assert.equal(updates.length, 2);
    assert.equal(result.pages, 0);
  });
});
