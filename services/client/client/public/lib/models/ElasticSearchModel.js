const {BaseModel} = require('@ucd-lib/cork-app-utils');
const config = require('../config');

class ElasticSearchModel extends BaseModel {

  constructor() {
    super();
    this.defaultTextFields = ['title', 'description'];

    this.facets = {};
    for( var key in config.elasticSearch.facets ) {
      let facetConfig = config.elasticSearch.facets[key];
      this.facets[key] = {
        // esType lets a facet use a different elasticsearch query/aggregation type
        // than its ui widget type (eg a 'range' widget backed by a 'range-overlap' query)
        type : facetConfig.esType || facetConfig.type
      }
      if( facetConfig.startField ) this.facets[key].startField = facetConfig.startField;
      if( facetConfig.endField ) this.facets[key].endField = facetConfig.endField;
    }
  }

  /**
   * @method emptySearchDocument
   * @description return a base searchDocument
   * 
   * @returns {Object}
   */
  emptySearchDocument() {
    return {
      text : '',
      filters : {},
      sort : null,
      limit : 20,
      offset : 0,
      facets : this.facets
    };
  }

  /**
   * @method urlToSearchDocument
   * @description given array of url parts, create app search document
   * This document can be passed to fromSerializedToEsBody to create es search document. 
   * Parts are /search/{text}/{filters}/{sort}/{limit}/{offset}, empty parts are rendered as '/-/',
   * since // can be truncated to / by some clients, and mess with the ordering of the query.
   * 
   * @param {Array} urlParts array of strings from url
   * 
   * @returns {Object} app query object
   */
  urlToSearchDocument(urlParts) {
    if( !Array.isArray(urlParts) ) throw new Error('UrlParts should be an array');
    let searchDoc = this.emptySearchDocument();

    // '-' marks an empty url part, but still allow search string to contain '-'
    let [text, filters, sort, limit, offset] = urlParts.map(
      part => part === '-' ? '' : decodeURIComponent(part)
    );

    if( text ) searchDoc.text = text;
    if( filters ) searchDoc.filters = this._parseUrlFilters(filters);
    if( sort ) searchDoc.sort = JSON.parse(sort);
    if( limit ) searchDoc.limit = parseInt(limit);
    if( offset ) searchDoc.offset = parseInt(offset);

    return searchDoc;
  }

  /**
   * @method _parseUrlFilters
   * @private
   * @description given the serialized url filters, create the filters object
   * 
   * @param {String} txt url filters
   * 
   * @returns {Object} app filters object
   */
  _parseUrlFilters(txt = '') {
    let filters = {};
    let arr = JSON.parse(txt);
    arr.forEach(filter => {
      let parsedFilter = this._setUrlFilterOp({
        type : this._parseUrlFilterType(filter[1]),
        value : this._parseUrlFilterValue(filter)
      }, filter[1]);

      // startField/endField aren't carried in the url (no need to bloat it), so
      // re-resolve them from config, same source appendRangeFilter() reads from
      if( parsedFilter.type === 'range-overlap' ) {
        let facetConfig = config.elasticSearch.facets[filter[0]] || {};
        parsedFilter.startField = facetConfig.startField;
        parsedFilter.endField = facetConfig.endField;
      }

      filters[filter[0]] = parsedFilter;
    });
    return filters;
  }

  _setUrlFilterOp(filter, op) {
    if( op !== 'range' && op !== 'range-overlap' ) {
      filter.op = op;
    }
    return filter;
  }

  _parseUrlFilterType(type) {
    if( type === 'or' || type === 'and' ) return 'keyword';
    return type;
  }

  _parseUrlFilterValue(filters) {
    if( filters[1] === 'range' || filters[1] === 'range-overlap' ) {
      return filters[2];
    }
    return filters.splice(2, filters.length);
  }

  /**
   * @method searchDocumentToUrl
   * @description given a app search document, create the url representation
   * 
   * @param {Object} searchDocument app search document
   * 
   * @return {String} url path string
   */
  searchDocumentToUrl(searchDocument, allowSpecial=false) {
    let filters = [];
    if( searchDocument.filters ) {
      for( var attr in searchDocument.filters ) {
        let filter = searchDocument.filters[attr];
        let arr = [attr, filter.op || filter.type];

        if( Array.isArray(filter.value) ) arr = arr.concat(filter.value);
        else arr.push(filter.value);

        filters.push(arr);
      }
    }

    // special collection url
    if( allowSpecial &&
        !searchDocument.text &&
        !searchDocument.sort &&
        !searchDocument.offset &&
        filters.length === 1 && 
        searchDocument.limit === 10 &&
        filters[0].length === 3 &&
        // filters[0][0] === 'isPartOf.@id' &&
        filters[0][0] === 'collectionId' &&
        filters[0][1] === 'or' &&
        filters[0][2].match(/^\/collection\//) ) {
      return filters[0][2];
    }

    // empty parts are rendered as '-' instead of '' so the url never contains '//'
    return [
      this._encodeUrlText(searchDocument.text),
      encodeURIComponent(JSON.stringify(filters)),
      searchDocument.sort ? encodeURIComponent(JSON.stringify(searchDocument.sort)) : '-',
      searchDocument.limit || '-',
      searchDocument.offset || '-'
    ].join('/')
  }

  /**
   * @method _encodeUrlText
   * @private
   * @description encode the search text url part. Empty text is rendered as '-',
   * a literal '-' search is rendered as %2D so it isn't read back as empty.
   *
   * @param {String} text search text
   *
   * @returns {String} url part
   */
  _encodeUrlText(text) {
    if( !text ) return '-';
    if( text === '-' ) return '%2D';
    return encodeURIComponent(text);
  }

  /**
   * @method setSort
   * @description set the search sort order. Will reset offset
   * and preform query.
   * 
   * https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-sort.html#search-request-sort
   * 
   * @param {Object} searchDocument search document to update
   * @param {String|Object} attr either attribute to sort on or sort object.  if not provide
   * sort is removed from search.
   * @param {String} order of attr is string, then provide order (asc or desc)
   * 
   * @return {Object} searchDocument
   */
  setSort(searchDocument, attr, order) {
    if( !attr ) searchDocument.sort = null;
    else if( typeof attr === 'object' ) searchDocument.sort = key;
    else if( order ) searchDocument.sort = {[attr]: order};

    searchDocument.offset = 0;

    return searchDocument;
  }

  /**
   * @method setPaging
   * @description set the paging offset and limit.  Limit is optional.
   * Will reset offset and preform query.
   * 
   * @param {Object} searchDocument search document to update
   * @param {Number} offset 
   * @param {Number} limit 
   * 
   * @return {Promise} service query promise
   */
  setPaging(searchDocument, offset, limit) {
    if( offset !== undefined ) searchDocument.offset = offset;
    if( limit !== undefined ) searchDocument.limit = limit;

    return searchDocument;
  }

  /**
   * @method setTextFilter
   * @description set the text search string.  Will reset offset
   * and preform query.
   * 
   * @param {Object} searchDocument search document to update
   * @param {String} text text string to search on
   * 
   * @return {Promise} service query promise
   */
  setTextFilter(searchDocument, text) {
    searchDocument.text = text;
    return searchDocument;
  }

  /**
   * @method clearFilters
   * @description clear all text and attribute filters.  resets offset and
   * preforms query.
   * 
   * @param {Object} searchDocument search document to update
   * 
   * @return {Promise} service query promise
   */
  clearFilters(searchDocument) {
    searchDocument.text = '';
    searchDocument.filters = {};
    return searchDocument;
  }

  /**
   * @method appendKeywordFilter
   * @description append keyword attribute filter to query.  Will reset offset
   * and preform query.
   * 
   * @param {Object} searchDocument search document to update
   * @param {String} attr attribute to filter
   * @param {String} value value of attribute to filter on
   * 
   * @return {Promise} service query promise
   */
  appendKeywordFilter(searchDocument, attr, value, op = 'or') {
    if( !searchDocument.filters[attr] ) {
      searchDocument.filters[attr] = {
        type : 'keyword',
        op : op,
        value : [value]
      }
    } else {
      searchDocument.filters[attr].value.push(value);
    }

    return searchDocument;
  }

  setKeywordFilter(searchDocument, attr, value, op = 'or') {
    searchDocument.filters[attr] = {
      type : 'keyword',
      op : op,
      value : [value]
    }
    return searchDocument;
  }

  /**
   * @method removeKeywordFilter
   * @description remove keyword attribute filter from query. Will reset offset
   * and preform query.
   *  
   * @param {Object} searchDocument search document to update
   * @param {String} attr attribute to remove
   * @param {String} value value of attribute to remove
   * 
   * @return {Promise} service query promise
   */
  async removeKeywordFilter(searchDocument, attr, value) {
    if( !searchDocument.filters[attr] ) return searchDocument;

    if( value === undefined ) {
      delete searchDocument.filters[attr];
    } else {
      let filter = searchDocument.filters[attr];
      let index = filter.value.indexOf(value);
      if( index === -1 ) return searchDocument;
  
      filter.value.splice(index, 1);
      if( filter.value.length === 0 ) {
        delete searchDocument.filters[attr];
      }
    }

    return searchDocument;
  }

   /**
   * @method appendRangeFilter
   * @description add range attribute filter from query. Will reset offset
   * and preform query.
   * 
   * @param {Object} searchDocument search document to update
   * @param {String} attr attribute to add
   * @param {Object} value range value. ex {gte: 1931, lte: 1960}
   * 
   * @return {Promise} service query promise
   */
  appendRangeFilter(searchDocument, attr, value) {
    let facetConfig = config.elasticSearch.facets[attr] || {};

    if( facetConfig.esType === 'range-overlap' ) {
      searchDocument.filters[attr] = {
        type : 'range-overlap',
        startField : facetConfig.startField,
        endField : facetConfig.endField,
        value
      }
    } else {
      searchDocument.filters[attr] = {
        type : 'range',
        value
      }
    }

    return searchDocument;
  }

  /**
   * @method removeRangeFilter
   * @description remove range attribute filter from query. Will reset offset
   * and preform query
   * 
   * @param {Object} searchDocument search document to update
   * @param {String} attr attribute to remove
   * 
   * @return {Promise} service query promise
   */
  removeRangeFilter(searchDocument, attr) {
    if( !searchDocument.filters[attr] ) return searchDocument;
    delete searchDocument.filters[attr];
    return searchDocument;
  }

}

module.exports = ElasticSearchModel;