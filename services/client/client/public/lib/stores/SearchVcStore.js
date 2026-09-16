const {BaseStore} = require('@ucd-lib/cork-app-utils');
const clone = require('clone');

class SearchVcStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      search : {}
    }

    this.events = {
      SEARCH_VC_UPDATE : 'search-vc-update',
    }

  }


  /**
   * Search
   */
  setSearchLoaded(name, searchDocument, payload) {
    this._setSearchState({
      name,
      state: this.STATE.LOADED,   
      searchDocument, payload
    });
  }

  // setSearchLoading(name, searchDocument, request) {
  //   this._setSearchState({
  //     name,
  //     state: this.STATE.LOADING,   
  //     searchDocument, request
  //   });
  // }

  // setSearchError(name, searchDocument, error, showErrorMessage=false) {
  //   this._setSearchState({
  //     name,
  //     state: this.STATE.ERROR,   
  //     searchDocument, error,
  //     showErrorMessage
  //   });
  // }

  _setSearchState(state) {
    this.data.search[state.name] = state;
    this.emit(this.events.SEARCH_VC_UPDATE, state);
  }

  getSearch(name='default') {
    return this.data.search[name];
  }

}

module.exports = new SearchVcStore();