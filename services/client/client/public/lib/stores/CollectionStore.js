var {BaseStore, LruStore} = require('@ucd-lib/cork-app-utils');
const vcModel = require('../models/CollectionVcModel');

class CollectionStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      byId : {},
      edits : {},
      overview : {
        state : this.STATE.INIT
      },
      search : new LruStore({name: 'collection-search', max: 20})
    }

    this.events = {
      COLLECTION_OVERVIEW_UPDATE : 'collection-overview-update',
      COLLECTION_UPDATE : 'collection-update',
      COLLECTION_EDITS_UPDATE : 'collection-edits-update',
      COLLECTION_SEARCH_UPDATE : 'collection-search-update'
    }
  }

  // set(payload, store, event) {
  //   if( !payload.state ) {
  //     if( payload.request ) payload.state = this.STATE.LOADING;
  //     else if( payload.payload ) payload.state = this.STATE.LOADED;
  //     else if( payload.error ) payload.state = this.STATE.ERROR;
  //   }

  //   super.set(payload, store, event);
  // }

  getCollection(id='') {
    return this.data.byId[id];
  }

  /**
   * Search
   */
  setSearchLoading(searchDocument, request, cacheId) {
    this._setSearchState({
      state : this.STATE.LOADING,
      request, searchDocument, cacheId
    })
  }

  setSearchLoaded(searchDocument, payload, cacheId) {
    this._setSearchState({
      state : this.STATE.LOADED,
      searchDocument, payload, cacheId
    })
  }

  setSearchError(searchDocument, error) {
    this._setSearchState({
      state : this.STATE.ERROR,
      searchDocument, error
    })
  }

  _setSearchState(state) {
    if( state.state === this.STATE.LOADED ) {
      vcModel.renderCollections(state);
    }
    this.data.search = state;
    this.emit(this.events.COLLECTION_SEARCH_UPDATE, this.data.search);
  }

  /**
   * Overview
   */
  setCollectionOverviewLoading(promise) {
    this._setCollectionOverviewState({
      state: this.STATE.LOADING, 
      request : promise
    });
  }

  setCollectionOverviewLoaded(payload) {
    // payload = payload.results;

    payload.forEach(item => {
      item._id = item['@id']; // friendly id for polymer data binding
      this.data.byId[item['@id']] = item;
    });

    payload.sort((a,b) => {
      if( a.name > b.name ) return 1;
      if( a.name < b.name ) return -1;
      return 0;
    });

    this._setCollectionOverviewState({
      state: this.STATE.LOADED,   
      payload
    });
  }

  setCollectionOverviewError(error) {
    this._setCollectionOverviewState({
      state: this.STATE.ERROR,   
      error
    });
  }

  _setCollectionOverviewState(state) {
    this.data.overview = state;
    this.emit(this.events.COLLECTION_OVERVIEW_UPDATE, this.data.overview);
  }


  /**
   * Get
   */
  setCollectionLoading(id, promise) {
    this._setCollectionState({
      id,
      state: this.STATE.LOADING, 
      request : promise
    });
  }

  setCollectionLoaded(id, payload) {
    this._setCollectionState({
      id,
      state: this.STATE.LOADED,   
      payload
    });
  }

  setCollectionError(id, error) {
    this._setCollectionState({
      id,
      state: this.STATE.ERROR,   
      error
    });
  }

  _setCollectionState(state) {
    if( state.state === this.STATE.LOADED ) {
      vcModel.renderCollection(state);
    }
    this.data.byId[state.id] = state;
    this.emit(this.events.COLLECTION_UPDATE, state);
  }

  setCollectionEditLoading(id, promise) { 
    this._setCollectionEditState({
      id,
      state: this.STATE.LOADING,
      request : promise
    });
  }

  setCollectionEditLoaded(id, edit) {
    this._setCollectionEditState({
      id,
      payload: edit,
      state: this.STATE.LOADED,
    });
  }

  setCollectionEditError(id, error) {
    this._setCollectionEditState({
      id,
      state: this.STATE.ERROR,
      error
    });
  }

  _setCollectionEditState(state) {
    this.data.edits[state.id] = state;
    this.emit(this.events.COLLECTION_EDIT_UPDATE, state);
  }


  /**
   * Admin Data
   */
  // setAdminDataLoading(promise) {
  //   this._setCollectionState({
  //     state: this.STATE.LOADING, 
  //     request : promise
  //   });
  // }

  // setAdminDataLoaded(payload) {
  //   if( payload.node && payload.node.length ) {
  //     payload.node.forEach(item => {
  //       item._id = item['@id']; // friendly id for polymer data binding
  //       this.data.byId[item['@id']] = item;
  //     });

  //     // payload.sort((a,b) => {
  //     //   if( a.name > b.name ) return 1;
  //     //   if( a.name < b.name ) return -1;
  //     //   return 0;
  //     // });  
  //   }
   
  //   this._setCollectionState({
  //     state: this.STATE.LOADED,   
  //     payload
  //   });
  // }

  // setAdminDataError(error) {
  //   this._setCollectionState({
  //     state: this.STATE.ERROR,   
  //     error
  //   });
  // }

  // _setCollectionState(state) {
  //   this.data.overview = state;
  //   this.emit(this.events.COLLECTION_UPDATE, this.data.overview);
  // }
  
}

module.exports = new CollectionStore();