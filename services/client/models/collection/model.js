const EsDataModel = require('../../lib/es-model.js');
const config = require('../../config.js');
const { logger } = require('../../lib/logger.js');
const schema = require('./schema.json');
const clientEdits = require('../client-edits');
const clientEditsModel = clientEdits.model;

class CollectionsModel extends EsDataModel {

  constructor() {
    super('collection');

    // we lookup item counts for a collection by querying the item index
    this.itemAlias = 'item-write';
    this.itemReadAlias = 'item-read';
    this.collectionType = 'http://schema.org/Collection';

    this.schema = schema;
  }

  /**
   * @method get
   * @description override to add client edits and image node to
   * collection graph if image node exists in a different graph.
   *
   * @param {String} id
   * @param {Object} opts
   * @param {String} index
   *
   * @returns {Promise}
   */
  async get(id, opts={}, index) {
    let collection = await super.get(id, opts, index);
    await this._appendClientEdits(collection);
    return this._appendImageNode(collection);
  }

  async search(searchDocument = {}, opts={}, index) {
    let result = await super.search(searchDocument, opts, index);
    if( result.results ) {
      for( let collection of result.results ) {
        await this._appendClientEdits(collection);
        await this._appendImageNode(collection);
      }
    }
    return result;
  }

  async getByArk(ark) {
    let searchDocument = {
      "filters":{
        "@graph.identifier.raw":{
            type:"keyword",
            op:"or",
            value:[ark]
        }
      },
      limit: 1
    }
    let resp = await super.search(searchDocument);
    return resp;
  }

  async _appendClientEdits(collection) {
    if( !collection ) return collection;
    let resp = await clientEditsModel.get(collection['@id']);

    if( resp?.collection ) {
      collection['@graph'].push(resp.collection);
    }
  }

  async _appendImageNode(collection) {
    if( !collection ) return collection;

    let id = collection['@id'];
    let root = collection['@graph'].find(node => node['@id'] === id);

    if( !root ) return collection;
    if( !root.image ) return collection;

    try {
      if( root.image['@id'].startsWith(id) ) {
        return collection;
      }

      let modelName = root.image['@id']
        .replace(/\//, '')
        .split('/')[0];
      let model = (await require('../../controllers/models.js').get(modelName)).model;

      let imageGraph = await model.get(
        root.image['@id'],
        {compact: true, singleNode: true, roles: [config.finac.agents.admin]}
      );

      if( !imageGraph ) return collection;

      collection['@graph'].push(imageGraph['@graph'][0]);
    } catch(e) {
      logger.error('Error appending image node to collection graph', e)
    }

    return collection;
  }

  /**
   * @method getItemCount
   * @description get the item count for a collection
   *
   * @param {String} id collection id
   *
   * @returns {Promise}
   */
  async getItemCount(id) {
    let result = await this.client.count({
      index : this.itemAlias,
      body: {
        query: {
          bool : {
            must : [
              {term: {'@graph.isPartOf.@id': id}}
            ]
          }
        }
      }
    });

    return result.count;
  }

  /**
   * @method getPublishedDateRange
   * @description get the published date range for a collection
   *
   * @param {String} id collection id
   *
   * @returns {Promise}
   */
  async getPublishedDateRange(id) {
    let result = await this.client.search({
      index: this.itemAlias,
      body: {
        query: {
          bool: {
            must: [
              { term: { '@graph.isPartOf.@id': id } }
            ]
          }
        },
        aggs: {
          min_year: { min: { field: '@graph.yearPublished' } },
          max_year: { max: { field: '@graph.yearPublished' } }
        },
        size: 0
      }
    });

    const minYear = result.aggregations.min_year.value;
    const maxYear = result.aggregations.max_year.value;

    return { minYear, maxYear };
  }

  /**
   * @method allLabels
   * @description get all labels for collections
   *
   * @returns {Promise} resolves to map of id to label
   */
  async allLabels(roles) {
    let result = await this.esSearch(
      {
        from : 0,
        size : 10000
      },
      {
        roles,
        _source_excludes : false,
        _source_includes : ['@id', 'name']
      }
    );

    let map = {};
    for( let hit of result.hits.hits ) {
      map[hit._source['@id']] = Array.isArray(hit._source.name) ? hit._source.name[0] : hit._source.name;
    }

    return map;
  }

}

module.exports = new CollectionsModel();
