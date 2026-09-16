const {BaseStore} = require('@ucd-lib/cork-app-utils');
const clone = require('clone');

class FcAppConfigStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      itemAppData : {},
      collectionAppData : {}
    }

    this.events = {
      // COLLECTION_VC_UPDATE : 'collection-vc-update',
    }

  }

  setDefaultImagesConfig(config) {
    this.data.defaultImages = config;
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }

  setDefaultImagesConfigLoading(request) {
    this.data.defaultImages = {
      state : 'loading',
      request
    };
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }

  setDefaultImagesConfigError(error) {
    this.data.defaultImages = {
      state : 'error',
      error
    };
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }

  setApiApplicationLoading(request) {
    this.data.apiApplication = {
      state : 'loading',
      request
    };
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }

  setApiApplicationError(error) {
    this.data.apiApplication = {
      state : 'error',
      error
    };
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }

  setApiApplication(data) {
    this.data.apiApplication = data;
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }

  setCollectionAppDataLoading(id, request) {
    this._setCollectionAppData(id, {
      state : 'loading',
      request
    });
  }

  setCollectionAppData(id, data) {
    this._setCollectionAppData(id, {
      state : 'loaded',
      data
    });
  }

  setCollectionAppDataError(id, error) {
    this._setCollectionAppData(id, {
      state : 'error',
      error
    });
  }

  _setCollectionAppData(id, data) {
    this.data.collectionAppData[id] = data;
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }

  setItemAppDataLoading(id, request) {
    this._setItemAppData(id, {
      state : 'loading',
      request
    });
  }

  setItemAppData(id, data) {
    this._setItemAppData(id, {
      state : 'loaded',
      data
    });
  }

  setItemAppDataError(id, error) {
    this._setItemAppData(id, {
      state : 'error',
      error
    });
  }

  _setItemAppData(id, data) {
    this.data.itemAppData[id] = data;
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }
}

module.exports = new FcAppConfigStore();