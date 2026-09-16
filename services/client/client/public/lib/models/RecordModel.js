const ElasticSearchModel = require('./ElasticSearchModel');
const RecordStore = require('../stores/RecordStore');
const RecordService = require('../services/RecordService');
const AppStateModel = require('./AppStateModel');
const config = require('../config');
const utils = require('../utils')

class RecordModel extends ElasticSearchModel {

  constructor() {
    super();

    this.service = RecordService;
    this.store = RecordStore;
    this.store.config = config.elasticSearch;

    this.MAX_WINDOW = 10000;
    this.currentLocation = null;

    this.EventBus.on('app-state-update', e => this._onAppStateUpdate(e));
    this.service.setModel(this);

    this.register('RecordModel');
  }

  /**
   * @method _onAppStateUpdate
   * @description listen for app state update events, load a record
   * if we are on a record page
   * 
   * @param {Object} e 
   */
  async _onAppStateUpdate(e) {
    if( e.location.fullpath === this.currentLocation ) return;
    this.currentLocation = e.location.fullpath;

    let searchUrlParts = e.location.path;

    this.handleSelectingRecord(e);

    if ( ['search', 'collection'].includes(searchUrlParts[0]) ) {
      this.handleSearch(e);
    }
  }

  /**
   * @method handleSelectingRecord
   * @description handle selecting a record from a search result
   */
  async handleSelectingRecord(e) {
    if( e.location.page !== 'item' ) {
      this.currentRecordId = null;
      this.selectedMediaPage = null;
      AppStateModel.setSelectedRecord(null);
      return;
    }

    AppStateModel.set({page: 'item'});
    let id = '/' + e.location.path.join('/');
    let mediaPage = -1;

    // parse out selected page within media
    if( id.match(/:\d+$/) ) {
      mediaPage = parseInt(id.split(':').pop());
      id = id.replace(/:\d+$/, '');
    }

    let result;
    try {
      result = await this.get(id);
      await result.payload.clientMedia.loadManifests();
    } catch(e) {
      console.warn('Error retrieving item', e);
      AppStateModel.setSelectedRecord(null);
      AppStateModel.set({page: '404'});
    }

    // item view controller event vs stuff below?
    
    // only trigger a change if the root record changed.
    if( result && (result.id !== this.currentRecordId || this.selectedMediaPage !== mediaPage) ) {
      this.currentRecordId = result.id;
      this.selectedMediaPage = mediaPage;

      let mediaGroups = result.payload.clientMedia.mediaGroups || [];
      let selectedMedia = mediaGroups.find(node => node['@id'] === id);

      if( !selectedMedia ) {
        if( id !== result.id ) {
          console.warn('Unable to find selected media', id);
        }

        // check for audio/video object first
        mediaGroups.forEach(m => {
          let mediaType = utils.getMediaType(m);
          if( ['AudioObject', 'VideoObject'].includes(mediaType) ) {
            selectedMedia = m;
          }
        });

        // else prioritize imagelist, then pdf
        if( !selectedMedia ) {
          let imageList = (mediaGroups || []).filter(m => m['@shortType'].includes('ImageList'))?.[0];
          if( imageList?.clientMedia?.pages ) {
            selectedMedia = imageList;
          }
        }

        if( !selectedMedia ) {
          let pdf = (mediaGroups || []).filter(m => m.clientMedia.pdf)?.[0];
          if( pdf?.clientMedia?.pages ) {
            selectedMedia = pdf;
          }
        }

        if( !selectedMedia ) {
          selectedMedia = mediaGroups[0];
        }

        if( selectedMedia?.clientMedia?.pages ) {
          mediaPage = 0;
        } else {
          mediaPage = -1;
        }
      }

      AppStateModel.setSelectedRecord({
        graph: result.payload, // record graph class
        clientMedia : result.payload.clientMedia, // client media class
        selectedMedia: selectedMedia, // selected media node
        selectedMediaPage: mediaPage // selected page (integer)
      });
    }
  }

  /**
   * @method handleSearch
   * @description handle search event after app state update
   * 
   * @param {*} e 
   */
  async handleSearch(e) {
    let searchUrlParts = e.location.path;
    let query;
    let path = e.location.pathname;

    if (searchUrlParts[0] === "collection") {
      // query = this._urlToSearchDocument(['', encodeURIComponent(JSON.stringify([
      query = this.urlToSearchDocument([
        "",
        encodeURIComponent(
          JSON.stringify([
            // ["isPartOf.@id","or",`/collection/${searchUrlParts[1]}`]
            ["collectionId", "or", path],
          ])
        ),
        "",
        "20",
      ]);

      if (this.lastQuery === query) return;
      this.lastQuery = query;

      // this._searchRecords(query, false);
      this.search(query);
      return;
    } else if (searchUrlParts[0] === "search" && searchUrlParts.length > 1) {
      // query = this._urlToSearchDocument(searchUrlParts.slice(1, searchUrlParts.length));
      query = this.urlToSearchDocument(
        searchUrlParts.slice(1, searchUrlParts.length)
      );
    } else {
      query = this.emptySearchDocument();
    }
    if (this.lastQuery === query) return;
    this.lastQuery = query;

    // this._searchRecords(query);
    this.search(query);
  }

  /**
   * @method defaultSearch
   * @description preform a default search.  Good for finding default
   * agg counts.
   * 
   * @param {String} collectionId
   * @param {Boolean} compact return compacted data, @type only has creative work and UC Davis schema, and minimal timestamps and fedora info
   * @param {Boolean} singleNode return single node
   * @package {Object} facets additional facets to filter on
   * 
   * @returns {Promise}
   */
  async defaultSearch(collectionId, compact=false, singleNode=false, facets={}) {
    let storeId = collectionId;
    if( !storeId ) storeId = 'default';

    let params = [];
    if( compact ) params.push('compact=true');
    if( singleNode ) params.push('single-node=true');
    if( params.length ) storeId += '?' + params.join('&');
    
    if( this.store.getDefaultSearch(storeId) ) {
      let search = this.store.getDefaultSearch(storeId);

      if( search.state === this.store.STATE.LOADING ) {
        await search.request;
      }
      
      return this.store.getDefaultSearch(storeId);
    }

    let searchDocument = this.emptySearchDocument();

    if( collectionId ) {
      this.appendKeywordFilter(searchDocument, '@graph.isPartOf.@id', collectionId, 'and');
    } 

    if( !searchDocument.text ) {
      searchDocument.sort = [
        {
          "name.raw": {
            "order": "asc"
          }
        },
        {
          "@graph.@id": {
            "order": "asc"
          }
        }
      ];
    } else {
      searchDocument.sort = [
        "_score",
        {
          "name.raw": {
            "order": "asc"
          }
        },
        {
          "@graph.@id": {
            "order": "asc"
          }
        }
      ];
    }

    if( Object.keys(facets).length ) searchDocument.facets = facets;

    await this.service.defaultSearch(storeId, searchDocument, compact, singleNode);

    return this.store.getDefaultSearch(storeId);
  }

/**
   * @method searchHighlighted
   * @description perform search for highlighted items in a collection
   * 
   * @param {String} collectionId
   * @param {Boolean} compact return compacted data, @type only has creative work and UC Davis schema, and minimal timestamps and fedora info
   * @param {Boolean} singleNode return single node
   * 
   * @returns {Promise}
   */
  async searchHighlighted(collectionId, compact=false, singleNode=false) {
    let storeId = collectionId;

    let params = [];
    if( compact ) params.push('compact=true');
    if( singleNode ) params.push('single-node=true');
    if( params.length ) storeId += '?' + params.join('&');
    
    let searchDocument = this.emptySearchDocument();

    this.appendKeywordFilter(searchDocument, 'node.isPartOf.@id', collectionId, 'and');
    searchDocument.limit = 6;

    await this.service.defaultSearch(storeId, searchDocument, compact, singleNode);

    return this.store.getDefaultSearch(storeId);
  }

  // /**
  //    * @method getIaBookManifest
  //    * @description load a records IA bookreader page data by id
  //    * 
  //    * @param {String} url the manifest url
  //    * 
  //    * @returns {Promise} resolves to record
  //    */
  // async getIaBookManifest(url) {
  //   return await this.service.getIaBookManifest(url);
  // }
    

  /**
   * @method get
   * @description load a record by id from elastic search
   * 
   * @param {String} id record id
   * 
   * @returns {Promise} resolves to record
   */
  async get(id) {
    let state = this.store.getRecord(id);

    if( state && state.request ) {
      await state.request;
    } else if( state && state.state === 'loaded' ) {
      if( state.id !== id ) {
        this.store.setRecordLoaded(id, state.payload)
      }
    } else {
      await this.service.get(id);
    }

    return this.store.getRecord(id);
  }

  async getGitInfo(id) {
    await this.service.getGitInfo(id);
    return this.store.data.gitInfo[id];
  }

  setSearchLocation(searchDocument) {
    AppStateModel.setLocation('/search/'+this.searchDocumentToUrl(searchDocument));
  }

  /**
   * @method search
   * @description preform a es collection search given an app search document
   * 
   * @param {Object} searchDocument
   * 
   * @returns {Promise}
   */
  async search(searchDocument = {}, opts={}) {
    if( !opts.compact ) opts.compact = false;
    if( !opts.singleNode ) opts.singleNode = false;
    if( !opts.ignoreClientMedia ) opts.ignoreClientMedia = false;
    if( !opts.debug ) opts.debug = false;
    if( !opts.name ) opts.name = 'default';

    if( !searchDocument.filters ) searchDocument.filters = {};

    if( searchDocument.limit + searchDocument.offset > this.MAX_WINDOW ) {
      this.store.setSearchError(searchDocument, new Error('Sorry, digital.ucdavis.edu does not serve more than 10,000 results for a query'), true);
      return this.store.getSearch();
    }

    if( searchDocument.text && !searchDocument.sort ) {      
      searchDocument.sort = [
        '_score', 
        { "name.raw": { "order": "asc" } },
        { "@graph.@id": { "order": "asc" } }    
      ];
    } else if( !searchDocument.sort ) {
      searchDocument.sort = [
        { "name.raw": { "order": "asc" } },
        { "@graph.@id": { "order": "asc" } }    
      ];
    }
    if( searchDocument.text && !searchDocument.sort.includes('_score')) {
      searchDocument.sort.unshift('_score');
    }

    if( !searchDocument.sort.find(s => s['@graph.@id'])) {
      searchDocument.sort.push({ "@graph.@id": { "order": "asc" } });
    }

    try {
      await this.service.search(searchDocument, opts);
    } catch(e) {}

    return this.store.getSearch();
  }

  /**
   * @method getCurrentSearchDocument
   * @description return the current search document
   * 
   * @returns {Object}
   */
  getCurrentSearchDocument() {
    if( this.store.data.search?.default?.searchDocument ) {
      return this.store.getSearch().searchDocument;
    }
    return this.emptySearchDocument();
  }

  getRecentItems(collectionId, limit=3) {
    let searchDocument = {
        filters: {
            '@graph.isPartOf.@id': {
                type: 'keyword',
                value: [
                    collectionId
                ],
                op: 'or'
            }
        },
        limit
    };
    return this.service.searchRecentItems(searchDocument);
  }

  typeaheadSearch(searchDocument, opts={}) {
    try {
      return this.service.typeaheadSearch(searchDocument, opts);
    } catch(e) {
      return {searchDocument, error: e, state: 'error'};
    }
  }

}

module.exports = new RecordModel();