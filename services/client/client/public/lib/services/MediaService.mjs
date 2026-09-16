import {BaseService} from '@ucd-lib/cork-app-utils';
import MediaStore from '../stores/MediaStore.mjs';
class MediaService extends BaseService {

  constructor() {
    super();
    this.store = MediaStore;

    this.baseUrl = '/fin/archive';
  }

  async downloadMediaZip(name, urls) {    
    // POST request, todo doesn't trigger browser download of zip
    return this.request({
      url : `${this.baseUrl}${name ? '?name='+name : ''}}`,
      json : true,
      fetchOptions : {
        method : 'POST',
        // headers : {
        //   'Content-Type' : 'application/json',
        //   // 'Transfer-Encoding' : 'chunked' // also tried gzip
        // },
        body : urls
      },
      checkCached : () => null,
      onLoading : null,
      onLoad : null,
      onError : null
    });
  }

  async getManifest(url) {
    return this.request({
      url,
      json : true,
      checkCached : () => this.store.data.manifest[url],
      onLoading : request => this.store.setManifestLoading(url, request),
      onLoad : response => this.store.setManifestLoaded(url, response.body),
      onError : error => this.store.setManifestError(url, error)
    });
  }

}

let mediaService = new MediaService();
export default mediaService;