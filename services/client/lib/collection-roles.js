const client = require('./es-client.js');
const config = require('../config.js');
const uriUtils = require('./uri-utils.js');

const SET_ROLES_SCRIPT = 'ctx._source.roles = params.roles';

// also keeps the root's visibility field current
const SET_COLLECTION_SCRIPT = `
ctx._source.roles = params.roles;
for (def node : ctx._source['@graph']) {
  if (node['@id'] == params.id) {
    node.visibility = params.visibility;
  }
}`;

/**
 * @class CollectionRoles
 * @description Applies a collection's visibility to the ES roles of its
 * collection, item and page docs, in every index for each. Uses the same roles argonath indexes with.
 */
class CollectionRoles {

  constructor() {
    // every <model>-<timestamp> index, not just the aliased one
    this.collectionIndexes = 'collection-*';
    this.itemIndexes = 'item-*';
    this.pageIndexes = 'page-search-*';
  }

  /**
   * @method rolesFor
   * @description ES roles for a visibility; admins always see private docs.
   *
   * @param {String} visibility 'public' or 'private'
   *
   * @returns {Array<String>}
   */
  rolesFor(visibility) {
    let {admin, public: pub} = config.finac.agents;
    return visibility === 'public' ? [pub, admin] : [admin];
  }

  /**
   * @method set
   * @description Update roles on a collection and every item and page in it, across all indexes.
   *
   * @param {String} id collection path or URI
   * @param {String} visibility 'public' or 'private'
   *
   * @returns {Promise<Object>} {roles, collection, items, pages} updated doc counts
   */
  async set(id, visibility) {
    let uri = uriUtils.toUri(id);
    let roles = this.rolesFor(visibility);

    let collection = await this._update(this.collectionIndexes, {term: {'@id': uri}}, {
      source: SET_COLLECTION_SCRIPT, params: {roles, id: uri, visibility}
    });
    let items = await this._update(this.itemIndexes, {term: {'@graph.isPartOf.@id': uri}}, {
      source: SET_ROLES_SCRIPT, params: {roles}
    });

    let itemIds = await this._itemIds(uri);
    let pages = itemIds.length ? await this._update(this.pageIndexes, {terms: {'@id': itemIds}}, {
      source: SET_ROLES_SCRIPT, params: {roles}
    }) : 0;

    return {roles, collection, items, pages};
  }

  /**
   * @method _itemIds
   * @description Ids of a collection's items across item indexes; page docs use the item id.
   *
   * @param {String} uri collection URI
   *
   * @returns {Promise<Array<String>>}
   */
  async _itemIds(uri) {
    let result = await client.search({
      index: this.itemIndexes,
      size: 10000,
      _source: false,
      allow_no_indices: true,
      ignore_unavailable: true,
      query: {term: {'@graph.isPartOf.@id': uri}}
    });
    return [...new Set(result.hits.hits.map(hit => hit._id))];
  }

  /**
   * @method _update
   * @description Run a script on every doc matching a query, in every index matching a pattern.
   *
   * @param {String} index index pattern
   * @param {Object} query ES query
   * @param {Object} script {source, params}
   *
   * @returns {Promise<Number>} docs updated
   */
  async _update(index, query, script) {
    let result = await client.updateByQuery({
      index,
      query,
      script,
      conflicts: 'proceed',
      refresh: true,
      allow_no_indices: true,
      ignore_unavailable: true
    });
    return result.updated;
  }
}

module.exports = new CollectionRoles();
