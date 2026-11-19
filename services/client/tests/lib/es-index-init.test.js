const assert = require('assert');
const client = require('../../lib/es-client.js');
const EsDataModel = require('../../lib/es-model.js');
const esIndexInit = require('../../lib/es-index-init.js');

/**
 * @description build a fake ES alias state on the shared client: which
 * aliases exist and which indices each one resolves to.
 *
 * @param {Object} aliases alias name -> array of index names
 *
 * @returns {Object} record of putAlias calls made against the fake
 */
function fakeAliases(aliases) {
  let calls = {putAlias: []};
  client.indices.existsAlias = async ({name}) => !!aliases[name];
  client.indices.getAlias = async ({name}) => {
    let info = {};
    for( let index of aliases[name] || [] ) info[index] = {aliases: {[name]: {}}};
    return info;
  };
  client.indices.putAlias = async (req) => calls.putAlias.push(req);
  return calls;
}

describe('lib/es-index-init.js', () => {
  let original, registry;

  beforeEach(() => {
    original = {
      existsAlias: client.indices.existsAlias,
      getAlias: client.indices.getAlias,
      putAlias: client.indices.putAlias
    };
    registry = {collection: {model: new EsDataModel('collection')}};
  });

  afterEach(() => {
    client.indices.existsAlias = original.existsAlias;
    client.indices.getAlias = original.getAlias;
    client.indices.putAlias = original.putAlias;
  });

  describe('verifyEsIndices', () => {
    it('passes when both aliases resolve to one index', async () => {
      fakeAliases({'collection-read': ['collection-1'], 'collection-write': ['collection-1']});
      await esIndexInit.verifyEsIndices(registry);
    });

    it('throws when an alias is missing', async () => {
      fakeAliases({'collection-read': ['collection-1']});
      await assert.rejects(esIndexInit.verifyEsIndices(registry), /missing alias\(es\) collection-write.*init job/);
    });

    it('throws when the write alias resolves to more than one index', async () => {
      fakeAliases({
        'collection-read': ['collection-1', 'collection-2'],
        'collection-write': ['collection-1', 'collection-2']
      });
      await assert.rejects(esIndexInit.verifyEsIndices(registry), /points at 2 indices/);
    });
  });

  describe('ensureModelIndices (partial state)', () => {
    it('adds the missing alias to the single existing index', async () => {
      let calls = fakeAliases({'collection-read': ['collection-1']});
      await esIndexInit.ensureModelIndices(registry.collection.model);
      assert.deepEqual(calls.putAlias, [{index: 'collection-1', name: 'collection-write'}]);
    });

    it('refuses to add the missing alias to multiple indices', async () => {
      let calls = fakeAliases({'collection-read': ['collection-1', 'collection-2']});
      await assert.rejects(esIndexInit.ensureModelIndices(registry.collection.model), /multiple indices/);
      assert.equal(calls.putAlias.length, 0);
    });
  });
});
