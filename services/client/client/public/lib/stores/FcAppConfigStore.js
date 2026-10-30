const {BaseStore} = require('@ucd-lib/cork-app-utils');
const clone = require('clone');

class FcAppConfigStore extends BaseStore {

  constructor() {
    super();

    this.data = {}

    this.events = {
      // COLLECTION_VC_UPDATE : 'collection-vc-update',
    }

  }

  setBrowseBySideImages(sideImages) {
    this.data.browseBySideImages = sideImages;
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }

  setBrowseBySideImagesLoading(request) {
    this.data.browseBySideImages = {
      state : 'loading',
      request
    };
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }

  setBrowseBySideImagesError(error) {
    this.data.browseBySideImages = {
      state : 'error',
      error
    };
    // this.emit(this.events.COLLECTION_VC_UPDATE);
  }
}

module.exports = new FcAppConfigStore();