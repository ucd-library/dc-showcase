import {BaseStore} from '@ucd-lib/cork-app-utils';
import clone from 'clone';

class MediaStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      manifest : {},
    }

    this.events = {
      CLIENT_MEDIA_MANIFEST_UPDATE : 'client-media-manifest-update',
    }

  }

  setManifestLoading(url, request) {
    this._setManifest(url, {
      id : url,
      state : this.STATE.LOADING,
      request
    });
  }

  setManifestError(url, error) {
    this._setManifest(url, {
      id : url,
      state : this.STATE.ERROR,
      error
    });
  }

  setManifestLoaded(url, payload) {
    this._setManifest(url, {
      id : url,
      state : this.STATE.LOADED,
      payload
    });
  }

  _setManifest(url, manifest) {
    this.data.manifest[url] = clone(manifest);
    this.emit(this.events.CLIENT_MEDIA_MANIFEST_UPDATE, url);
  }

}

let mediaStore = new MediaStore();
export default mediaStore;