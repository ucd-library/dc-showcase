const {BaseStore} = require('@ucd-lib/cork-app-utils');
const clone = require('clone');
const vcModel = require('../models/RecordVcModel');

class RecordStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      byId : {},
      // by collection id
      defaultSearch : {},
      search : {},
      gitInfo : {}
    }

    this.events = {
      RECORD_UPDATE : 'record-update',
      RECORD_SEARCH_UPDATE : 'record-search-update',
      DEFAULT_RECORD_SEARCH_UPDATE : 'default-record-search-update',
      RECORD_GIT_INFO_UPDATE : 'record-git-info-update'
    }

  }

  getRecord(id) {
    if( !id ) return null;
    let parts = id.split('/').filter(p => p !== '');
    for( let i = parts.length-1; i >= 0; i-- ) {
      let pid = '/'+parts.join('/');
      if( this.data.byId[pid] ) {
        return this.data.byId[pid];
      }
      parts.splice(i, 1);
    }
    return null;
  }

  setRecordLoading(id, promise) {
    this._setRecordState({
      state: this.STATE.LOADING, 
      id,
      request : promise
    });
  }

  setRecordLoaded(id, payload) {
    this._setRecordState({
      state: this.STATE.LOADED,
      id,
      payload, payload
    });
  }

  setRecordError(id, error) {
    this._setRecordState({
      state: this.STATE.ERROR,   
      error, id
    });
  }

  _setRecordState(state) {
    this.data.byId[state.id] = state;

    if( state.state === this.STATE.LOADED ) {
      vcModel.renderRecord(state);
    }
    this.emit(this.events.RECORD_UPDATE, state);
  }

  /**
   * Git Info
   * 
   * @param {*} id 
   * @param {*} payload 
   */
  setGitInfoLoaded(id, payload) {
    this._setGitInfoState({
      state: this.STATE.LOADED,
      id,
      payload
    });
  }

  setGitInfoError(id, error) {
    this._setGitInfoState({
      state: this.STATE.ERROR,   
      error, id
    });
  }

  _setGitInfoState(state) {
    this.data.gitInfo[state.id] = state;
    this.emit(this.events.RECORD_GIT_INFO_UPDATE, state);
  }

  /**
   * Search
   */
  setSearchLoaded(opts, searchDocument, payload) {
    this._setSearchState({
      name: opts.name,
      opts,
      state: this.STATE.LOADED,   
      searchDocument, payload
    });
  }

  setSearchLoading(opts, searchDocument, request) {
    this._setSearchState({
      name: opts.name,
      opts,
      state: this.STATE.LOADING,   
      searchDocument, request
    });
  }

  setSearchError(opts, searchDocument, error, showErrorMessage=false) {
    this._setSearchState({
      name: opts.name,
      opts,
      state: this.STATE.ERROR,   
      searchDocument, error,
      showErrorMessage
    });
  }

  _setSearchState(state) {
    this.data.search[state.name] = state;
    this.emit(this.events.RECORD_SEARCH_UPDATE, state);
  }

  getSearch(name='default') {
    return this.data.search[name] || {};
  }

  /**
   * Default Search
   */
  setDefaultSearchLoading(id, searchDocument, promise) {
    this._setDefaultSearchState({
      id, searchDocument,
      state: this.STATE.LOADING, 
      request : promise
    });
  }

  setDefaultSearchLoaded(id, searchDocument, payload) {
    this._setDefaultSearchState({
      id, searchDocument,
      state: this.STATE.LOADED,   
      payload
    });
  }

  setDefaultSearchError(id, searchDocument, e) {
    this._setDefaultSearchState({
      id, searchDocument,
      state: this.STATE.ERROR,   
      error: e
    });
  }

  getDefaultSearch(id) {
    return this.data.defaultSearch[id];
  }

  _setDefaultSearchState(state) {
    this.data.defaultSearch[state.id] = state;
    this.emit(this.events.DEFAULT_RECORD_SEARCH_UPDATE, this.data.defaultSearch[state.id]);
  }

}

module.exports = new RecordStore();