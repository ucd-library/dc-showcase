const client = require('./es-client.js');
const config = require('../config.js');
const uriUtils = require('./uri-utils.js');

const SET_ROLES_SCRIPT = 'ctx._source.roles = params.roles';

/**
 * @class CollectionRoles
 * @description Applies a collection's visibility to the ES roles of its
 * collection, item and page docs. Uses the same roles argonath indexes with.
 */
class CollectionRoles {

  constructor() {
    this.collectionAlias = 'collection-write';
    this.itemAlias = 'item-write';
    this.pageAlias = 'page-search-write';
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
   * @description Update roles on a collection and every item and page in it.
   *
   * @param {String} id collection path or URI
   * @param {String} visibility 'public' or 'private'
   *
   * @returns {Promise<Object>} {roles, collection, items, pages} updated doc counts
   */
  async set(id, visibility) {
    let uri = uriUtils.toUri(id);
    let roles = this.rolesFor(visibility);

    let collection = await this._update(this.collectionAlias, {term: {'@id': uri}}, roles);
    let items = await this._update(this.itemAlias, {term: {'@graph.isPartOf.@id': uri}}, roles);

    let itemIds = await this._itemIds(uri);
    let pages = itemIds.length ? await this._update(this.pageAlias, {terms: {'@id': itemIds}}, roles) : 0;

    return {roles, collection, items, pages};
  }

  /**
   * @method _itemIds
   * @description Ids of a collection's items; page docs use the item id.
   *
   * @param {String} uri collection URI
   *
   * @returns {Promise<Array<String>>}
   */
  async _itemIds(uri) {
    let result = await client.search({
      index: this.itemAlias,
      size: 10000,
      _source: false,
      query: {term: {'@graph.isPartOf.@id': uri}}
    });
    return result.hits.hits.map(hit => hit._id);
  }

  /**
   * @method _update
   * @description Set roles on every doc matching a query.
   *
   * @param {String} index index alias
   * @param {Object} query ES query
   * @param {Array<String>} roles
   *
   * @returns {Promise<Number>} docs updated
   */
  async _update(index, query, roles) {
    let result = await client.updateByQuery({
      index,
      query,
      conflicts: 'proceed',
      refresh: true,
      script: {source: SET_ROLES_SCRIPT, params: {roles}}
    });
    return result.updated;
  }
}

module.exports = new CollectionRoles();
