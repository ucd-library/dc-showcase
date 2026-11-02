const {BaseService} = require('@ucd-lib/cork-app-utils');
const config = require('../config');
const FcAppConfigStore = require('../stores/FcAppConfigStore');

class FcAppConfigService extends BaseService {

  constructor() {
    super();
    this.store = FcAppConfigStore;

    this.appConfigApiUrl = '/api/app-config';
  }

  getBrowseBySideImages() {
    return this.request({
      url : `${this.appConfigApiUrl}/browse-by/side-images`,
      checkCached : () => this.store.data.browseBySideImages,
      onLoading : request => this.store.setBrowseBySideImagesLoading(request),
      onLoad : sideImages => this.store.setBrowseBySideImages(sideImages),
      onError : error => this.store.setBrowseBySideImagesError(error)
    });
  }

  async saveCollectionDisplayData(id, displayData, opts={}) {
    return this.request({
      url : `${this.appConfigApiUrl}${id}`,
      fetchOptions : {
        method : 'PUT',
        headers : {
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify({edit : displayData, visibility : opts.visibility})
      },
      checkCached : () => null,
      onLoading : null,
      onLoad : null,
      onError : null
    });
  }

  async saveCollectionFeaturedImage(id, featuredImage) {
    if( featuredImage ) {
      let resp = await fetch(`${this.appConfigApiUrl}${id}/featured-image`, {
        method : 'POST',
        headers : {
          'Content-Type' : featuredImage.type || 'image/jpeg'
        },
        body : featuredImage
      });
      if( !resp.ok ) {
        console.warn('Featured image upload failed', resp.status);
        return {error: true, response: resp};
      }
      return {response: resp};
    }
    return null;
  }

  getFeaturedCollectionAppData() {
    return this.request({
      url : `${this.appConfigApiUrl}/featured-collections`,
      checkCached : () => null,
      onLoading : null,
      onLoad : null,
      onError : () => console.warn('No featured collections admin data found')
    });
  }

  async saveFeaturedCollectionDisplayData(displayData) {
    return this.request({
      url : `${this.appConfigApiUrl}/featured-collections`,
      fetchOptions : {
        method : 'PUT',
        headers : {
          'Accept' : 'application/json',
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify(displayData)
      },
      checkCached : () => null,
      onLoading : null,
      onLoad : null,
      onError : null
    });
  }

  async saveItemDisplayData(id, displayData) {
    return this.request({
      url : `${this.appConfigApiUrl}${id}`,
      fetchOptions : {
        method : 'PUT',
        headers : {
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify({edit : displayData})
      },
      checkCached : () => null,
      onLoading : null,
      onLoad : null,
      onError : null
    });
  }

}

module.exports = new FcAppConfigService();