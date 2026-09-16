const {BaseService} = require('@ucd-lib/cork-app-utils');
const config = require('../config');
const FcAppConfigStore = require('../stores/FcAppConfigStore');

class FcAppConfigService extends BaseService {

  constructor() {
    super();
    this.store = FcAppConfigStore;

    this.baseFcrepoUrl = '/fcrepo/rest/application/ucd-lib-client';
    this.baseApiUrl = '/api/application/ucd-lib-client';
  }

  getDefaultImagesConfig() {
    return this.request({
      url : `${this.baseFcrepoUrl}/default-images/config.json`,
      checkCached : () => this.store.data.defaultImages,
      onLoading : request => this.store.setDefaultImagesConfigLoading(request),
      onLoad : config => this.store.setDefaultImagesConfig(config),
      onError : error => this.store.setDefaultImagesConfigError(error)
    });
  }

  getApiApplication() {
    return this.request({
      url : `${this.baseApiUrl}`,
      checkCached : () => this.store.data.apiApplication,
      onLoading : request => this.store.setApiApplicationLoading(request),
      onLoad : data => this.store.setApiApplication(data),
      onError : error => this.store.setApiApplicationError(error)
    });
  }

  getAdminData(id) {
    return this.request({
      url : `${this.baseApiUrl}${id}`,
      checkCached : () => null,
      onLoading : null,
      onLoad : null,
      onError : null
    });
  }

  getCollectionAppData(id) {
    return this.request({
      url : `${this.baseFcrepoUrl}${id}`,
      fetchOptions : {
        headers : {
          'Accept' : 'application/ld+json',
          // 'Accept' : 'application/ld+json; profile="http://www.w3.org/ns/json-ld#flattened"',
          'Prefer' : 'return=representation; omit="http://fedora.info/definitions/fcrepo#ServerManaged"'
        },
      },
      checkCached : () => this.store.data.collectionAppData[id],
      onLoading : request => this.store.setCollectionAppDataLoading(id, request),
      onLoad : data => this.store.setCollectionAppData(id, data),
      onError : error => this.store.setCollectionAppDataError(id, error)
    });
  }

  getItemAppData(id) {
    return this.request({
      url : `${this.baseFcrepoUrl}${id}`,
      fetchOptions : {
        headers : {
          'Accept' : 'application/ld+json',
          // 'Accept' : 'application/ld+json; profile="http://www.w3.org/ns/json-ld#flattened"',
          'Prefer' : 'return=representation; omit="http://fedora.info/definitions/fcrepo#ServerManaged"'
        },
      },
      checkCached : () => this.store.data.itemAppData[id],
      onLoading : request => this.store.setItemAppDataLoading(id, request),
      onLoad : data => this.store.setItemAppData(id, data),
      onError : error => this.store.setItemAppDataError(id, error)
    });
  }

  async saveCollectionDisplayData(id, displayData) {    
    return this.request({
      url : `${this.baseFcrepoUrl}${id}`,
      fetchOptions : {
        method : 'PUT',
        headers : {
          'Content-Type' : 'application/ld+json'
        },
        body : JSON.stringify(displayData)
      },
      checkCached : () => null,
      onLoading : null,
      onLoad : null,
      onError : null
    });
  }

  async saveCollectionFeaturedImage(id, featuredImage) {
    if( featuredImage ) {
      await fetch(`${this.baseFcrepoUrl}${id}/featuredImage.jpg`, {
        method : 'PUT',
        headers : {
            'Content-Type' : 'image/jpg',
        },
        body: featuredImage,
        duplex: 'half'
      }); 
    }
  }

  getFeaturedCollectionAppData() {
    return this.request({
      url : `${this.baseFcrepoUrl}/featured-collections/config.json`,
      checkCached : () => null,
      onLoading : null,
      onLoad : null,
      onError : () => console.warn('No featured collections admin data found')
    });
  }

  async saveFeaturedCollectionDisplayData(displayData) {
    return this.request({
      url : `${this.baseFcrepoUrl}/featured-collections/config.json`,
      fetchOptions : {
        method : 'PUT',
        headers : {
          'Accept' : 'application/json',
          // 'Prefer' : 'handling=lenient',
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
      url : `${this.baseFcrepoUrl}${id}`,
      fetchOptions : {
        method : 'PUT',
        headers : {
          'Content-Type' : 'application/ld+json'
        },
        body : JSON.stringify(displayData)
      },
      checkCached : () => null,
      onLoading : null,
      onLoad : null,
      onError : null
    });
  }

}

module.exports = new FcAppConfigService();