const {BaseStore} = require('@ucd-lib/cork-app-utils');
const clone = require('clone');

class CollectionVcStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      byId : {},
      // by collection id
      defaultSearch : {},
      search : {
        state : this.STATE.INIT
      }
    }

    this.events = {
      COLLECTION_VC_UPDATE : 'collection-vc-update',
    }

  }

  getCollection(id) {
    return this.data.byId[id];
  }

  setCollection(id, payload) {
    this._setCollection({
      state: this.STATE.LOADED,
      payload, id
    });
  }

  _setCollection(state) {
    this.data.byId[state.id] = state;
    this.emit(this.events.COLLECTION_VC_UPDATE, state);
  }

}

module.exports = new CollectionVcStore();