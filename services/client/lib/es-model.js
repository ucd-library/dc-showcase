const es = require('./es-client.js');
const config = require('../config.js');
const finSearch = require('./fin-search.js');
const { logger } = require('./logger.js');
const utils = require('./es-utils.js');

/**
 * @class EsDataModel
 * @description Read-only base class for Elasticsearch-backed data models,
 * replacing @ucd-lib/fin-service-utils's FinDataModel/FinEsDataModel.
 *
 * Only covers reads: this app no longer owns writing to these indices
 * (fin's dbsync used to trigger `update()`/`is()` on model changes; going
 * forward that's argonath's job - see docs/PORT-PLAN.md Phase 3). Models
 * that still need a write path build it themselves (e.g. the app-config
 * model talks to Postgres directly).
 */
class EsDataModel {

  constructor(modelName) {
    this.id = modelName;
    this.modelName = modelName;
    this.utils = utils;
    this.client = es;

    this.readIndexAlias = modelName+'-read';
    this.writeIndexAlias = modelName+'-write';
  }

  /**
   * @description search using the ucd dams search document format.
   *
   * @param {Object} searchDocument
   * @param {Boolean} options.debug will return searchDocument and esBody in result
   *
   * @returns {Promise} resolves to search result
   */
  async search(searchDocument, options={debug:false}, index) {
    if( !index ) index = this.readIndexAlias;

    if( !searchDocument.sort ) {
      searchDocument.sort = [
        '_score',
        { '@graph.name.raw' : 'asc' }
      ]
    }

    let esBody = finSearch.searchDocumentToEsBody(searchDocument);
    let esResult = await this.esSearch(esBody, {admin: options.admin, roles: options.roles}, index);
    let result = finSearch.esResultToDamsResult(esResult, searchDocument);

    result.results.forEach(item => {
      if( item._source ) item = item._source;
      if( options.compact ) this.utils.compactAllTypes(item);
      if( options.singleNode ) item['@graph'] = this.utils.singleNode(item['@id'], item['@graph']);
    });

    if( options.debug ) {
      result.searchDocument = searchDocument;
      result.esBody = esBody;
      result.options = options;
    }

    return result;
  }

  /**
   * @method get
   * @description get an object by id
   *
   * @param {String} id @graph.identifier or @graph.@id
   *
   * @returns {Promise} resolves to elasticsearch result, or null if not found
   */
  async get(id, opts={}, index) {
    let _source_excludes = true;
    if( opts.admin ) _source_excludes = false;
    else if( opts.compact ) _source_excludes = 'compact';

    let result = await this.esSearch({
        from: 0,
        size: 1,
        query: {
          bool : {
            should : [
              {term : {'@graph.identifier.raw' : id}},
              {term: {'@graph.@id': id}},
              {term: {'@id': id}}
            ],
            minimum_should_match: 1
          }
        }
      },
      {
        _source_excludes,
        roles: opts.roles
      },
      index
    );

    if( result.hits.total.value < 1 ) return null;

    result = result.hits.hits[0]._source;
    if( opts.compact ) this.utils.compactAllTypes(result);
    if( opts.singleNode ) result['@graph'] = this.utils.singleNode(id, result['@graph']);

    return result;
  }

  /**
   * @method esScroll
   * @description continue a scrolling search started via esSearch({scroll: ...}).
   */
  esScroll(options={}) {
    return es.scroll(options);
  }

  esClearScroll(options={}) {
    return es.clearScroll(options);
  }

  /**
   * @method esSearch
   * @description search using a raw elasticsearch query body.
   *
   * @param {Object} body elasticsearch search body
   *
   * @returns {Promise} resolves to elasticsearch result
   */
  esSearch(body={}, options={}, index) {
    if( !index ) index = this.readIndexAlias;

    options.index = index;
    options.body = body;

    this.setRoles(body, options.roles);
    if( options.roles ) delete options.roles;

    if( options._source_excludes === false ) {
      delete options._source_excludes;
    } else if( options._source_excludes === 'compact' ) {
      options._source_excludes = config.elasticsearch.fields.excludeCompact.join(',');
    } else if( Array.isArray(options._source_excludes) ) {
      options._source_excludes = options._source_excludes.join(',');
    } else {
      options._source_excludes = config.elasticsearch.fields.exclude.join(',');
    }

    if( Array.isArray(options._source_includes) ) {
      options._source_includes = options._source_includes.join(',');
    }

    if( options.admin ) {
      delete options.admin;
      if( options._source_excludes && options._source_excludes.includes('roles') ) {
        options._source_excludes.splice(options._source_excludes.indexOf('roles'), 1);
      }
    }

    return this.client.search(options);
  }

  async count(index) {
    if( !index ) index = this.readIndexAlias;
    return (await this.client.count({index})).count;
  }

  /**
   * @method setRoles
   * @description add the public-access (or given) roles filter to a query body.
   * NOTE: this only filters on the `roles` field already indexed on each
   * document - it does not compute/write access grants (that lived in fin's
   * WebAC/FinAC system, retired along with fcrepo). Real per-collection
   * access control is a known follow-up, not yet redesigned for CaskFS/auth-gateway.
   */
  setRoles(body, roles) {
    if( !roles ) {
      roles = [config.finac.agents.public];
    } else if( !roles.includes(config.finac.agents.public) ) {
      roles.push(config.finac.agents.public);
    }

    if( !body.query ) body.query = {};
    if( !body.query.bool ) body.query.bool = {};
    if( !body.query.bool.filter ) body.query.bool.filter = [];
    let hasRoles = body.query.bool.filter.findIndex(item => item?.terms?.roles);

    if( hasRoles === -1 ) {
      body.query.bool.filter.push({ terms : {roles} });
      return;
    }

    body.query.bool.filter[hasRoles].terms.roles = roles;
  }

  getDefaultIndexConfig(schema) {
    if( !schema ) schema = this.schema;
    let newIndexName = `${this.modelName}-${Date.now()}`;

    return {
      index: newIndexName,
      body : {
        settings : {
          analysis : {
            analyzer: {
              autocomplete: { tokenizer: 'autocomplete', filter: ['lowercase'] },
              autocomplete_search : { tokenizer: 'lowercase' },
              punctuation_insensitive: { tokenizer: 'standard', filter: ['lowercase', 'remove_punctuation'] }
            },
            tokenizer: {
              autocomplete: {
                type: 'edge_ngram', min_gram: 1, max_gram: 20,
                token_chars: ['letter', 'digit']
              },
              xml: { type: 'char_group', tokenize_on_chars: ['-', '.', ',', '>', '<', ' '] }
            },
            filter: {
              remove_punctuation: { type: 'pattern_replace', pattern: '[^\\w\\s]', replacement: '' }
            }
          }
        },
        mappings : schema
      }
    }
  }

}

module.exports = EsDataModel;
