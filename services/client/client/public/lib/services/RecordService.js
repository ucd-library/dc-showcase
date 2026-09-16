const {BaseService} = require('@ucd-lib/cork-app-utils');
const RecordStore = require('../stores/RecordStore');
const config = require('../config');
// const seo = require('@ucd-lib/fin-service-utils/lib/seo');
// const graphConcat = seo.graphConcat;
const RecordGraph = require('../utils/RecordGraph.js');

class RecordService extends BaseService {

  constructor() {
    super();
    this.store = RecordStore;
    this.baseUrl = '/api/item';
  }

  setModel(model) {
    this.model = model;
  }

  get(id) {
    return this.request({
      url : `${this.baseUrl}${id.replace(/^\/item/, '')}?compact=true`,
      checkCached : () => this.store.getRecord(id),
      onLoading : request => this.store.setRecordLoading(id, request),
      onLoad : result => this.store.setRecordLoaded(id, new RecordGraph(result.body)),
      onError : e => this.store.setRecordError(id, e)
    });
  }

  getGitInfo(id) {
    return this.request({
      url : `/fcrepo/rest${id}`,
      fetchOptions : {
        method : 'HEAD',
      },
      checkCached : () => this.store.data.gitInfo[id],
      onLoad : result => {
        let gitInfo = null;
        result.response.headers.get('Digest')
          .split(',')
          .map(digest => digest.trim().split('='))
          .forEach(digest => {
            if( digest[0] === 'finio-git-source' ) {
              gitInfo = digest[1];
            }
          });

        if( gitInfo ) {
          gitInfo = JSON.parse(atob(gitInfo));
        }

        this.store.setGitInfoLoaded(id, gitInfo)
      },
      onError : e => this.store.setGitInfoError(id, e)
    });
  }

  // getIaBookManifest(url) {
  //   return this.request({
  //     url,
  //     checkCached : () => null,
  //     onLoading : null,
  //     onLoad : null,
  //     onError : null
  //   });
  // }

  /**
   * @method search
   * @description Search the records
   * 
   * @param {Object} searchDocument 
   * 
   * @returns {Promise}
   */
  search(searchDocument = {}, opts={}) {
    if( !searchDocument.textFields ) {
      searchDocument.textFields = config.elasticSearch.textFields.record;
    }

    searchDocument['simple_query_string'] = true;

    let params = {};
    if( opts.debug ) params.debug = true;
    if( opts.compact ) params.compact = true;
    if( opts.singleNode ) params['single-node'] = true;
    opts.debug = true;
    return this.request({
      url : this.baseUrl,
      qs : params,
      json : true,
      fetchOptions : {
        method : 'POST',
        body : searchDocument
      },
      onLoading : promise => this.store.setSearchLoading(opts, searchDocument,  promise),
      onLoad : result => {        
        if( result.body.results ) {
          result.body.results = result.body.results.map(record => new RecordGraph(record));
        }
        this.store.setSearchLoaded(opts, searchDocument, result.body);
      },
      onError : e => this.store.setSearchError(opts, searchDocument, e)
    });
  }

  async searchRecentItems(searchDocument = {}) {
    // searchDocument.textFields = config.elasticSearch.textFields.collection;
    return this.request({
      url : this.baseUrl+'?debug=true&single-node=true&compact=true',
      fetchOptions : {
        method : 'POST',
        headers : {
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify(searchDocument)
      },
      onLoading : null,
      onLoad : null,
      onError : null
    });
  }

    /**
   * @method typeaheadSearch
   * @description Search the records
   * 
   * @param {Object} searchDocument 
   * 
   * @returns {Promise}
   */
  typeaheadSearch(searchDocument = {}, opts={}) {
    if( !searchDocument.textFields ) {
      searchDocument.textFields = config.elasticSearch.textFields.record;
    }

    let qs = {};
    if( opts.debug ) qs.debug = true;
    if( opts.allRecords ) qs.all = true;

    return new Promise((resolve, reject) => {
      this.request({
        url : `${this.baseUrl}`,
        fetchOptions : {
          method : 'POST',
          headers : {
            'Content-Type' : 'application/json'
          },
          body : JSON.stringify(searchDocument)
        },
        qs,
        onLoad : result => resolve({searchDocument, payload: result.body, state: 'loaded'}),
        onError : e => reject({searchDocument, error: e, state: 'error'})
      });
    });
  }


  /**
   * @method defaultSearch
   * @description Search the catalogs
   * 
   * @param {Object} searchDocument elastic search query parameters
   * @returns {Promise}
   */
  defaultSearch(id, searchDocument = {}, compact=false, singleNode=false) {
    return this.request({
      url : `${this.baseUrl}?debug=true${compact ? '&compact=true' : ''}${singleNode ? '&single-node=true' : ''}`,
      fetchOptions : {
        method : 'POST',
        headers : {
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify(searchDocument)
      },
      onLoading : promise => this.store.setDefaultSearchLoading(id, searchDocument, promise),
      onLoad : result => {
        if( result.body.results ) {
          result.body.results = result.body.results.map(record => new RecordGraph(record));
          result.body.results.map(item => item.getChildren(item.root))
          this.store.setDefaultSearchLoaded(id, searchDocument, result.body)
        }        
      },

      onError : e => this.store.setDefaultSearchError(id, searchDocument, e)
    });
  }
}

module.exports = new RecordService();