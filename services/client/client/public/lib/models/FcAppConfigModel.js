const {BaseModel} = require('@ucd-lib/cork-app-utils');
const FcAppConfigStore = require('../stores/FcAppConfigStore');
const FcAppConfigService = require('../services/FcAppConfigService');

/**
 * @class FcAppConfigModel
 * @description a wrapper class around APP_CONFIG.fcAppConfig which contains
 * the /application/ucd-lib-client graph from fcrepo.  Adds nice accessor 
 * methods
 */
class FcAppConfigModel extends BaseModel {
  
  constructor() {
    super();

    this.store = FcAppConfigStore;
    this.service = FcAppConfigService;
    
    this.TYPES = {
      APPLICATION_CONTAINER : 'http://digital.ucdavis.edu/schema#ApplicationContainer'
    };

    this.byId = {};
    
    // TODO: fix
    // if( !APP_CONFIG.fcAppConfig || !APP_CONFIG.fcAppConfig.length ) {
    //   APP_CONFIG.fcAppConfig = {error: true};
    // }

    // this.enabled = Array.isArray(APP_CONFIG.fcAppConfig);

    // if( this.enabled ) {
    //   APP_CONFIG.fcAppConfig.forEach(item => {
    //     if ( item.associatedMedia && Array.isArray(APP_CONFIG.collections) ) {
    //       let collectionData = APP_CONFIG.collections.find(c => c['@id'] === item.associatedMedia['@id']);
    //       if ( collectionData ) Object.assign(item['associatedMedia'], collectionData);
    //     }
    //     this.byId[item['@id']] = item;
    //   });
    // }

    this.defaultHomepageHero = {
      imgSrc: "/images/defaults/annual-winter-sale1952.jpg",
      itemName: "Annual Winter Sale 1952",
      itemLink: "/collection/sherry-lehmann/D-202/d7hg6v",
      collectionName: "Sherry Lehmann Wine Catalogs",
      collectionLink: "/collection/sherry-lehmann"
    };

    this.register('FcAppConfigModel');
  }

  async getDefaultImagesConfig() {
    let resp = await this.service.getDefaultImagesConfig();
    if( resp && resp.state === 'loading' ) {
      await resp.request;
    }
    return this.store.data.defaultImages;
  }

  async getApiAppData() {
    let resp = await this.service.getApiAppData();
    if( resp && resp.state === 'loading' ) {
      await resp.request;
    }

    return this.store.data.apiApplication;
  }

  async getAdminData(id) {
    return await this.service.getAdminData(id);
  }

  /**
   * @method getFeaturedCollections
   * @description return any defined featured collections
   * 
   * @returns {Array}
   */
  getFeaturedCollections() {
    if( !this.enabled ) return [];
    let appContainer = this.getApplicationContainer();
    return sortArray(asArray(appContainer.featuredCollection)
      .map(item => {
        return this.byId[item['@id']];
      }));
  }

  /**
   * @method getFeaturedImages
   * @description return any defined featured images
   * 
   * @returns {Array}
   */
  getFeaturedImages() {
    if( !this.enabled ) return [];
    let appContainer = this.getApplicationContainer();
    let results = sortArray(asArray(appContainer.featuredImage)
      .map(item => this.byId[item['@id']]));
    return results;
  }

  /**
   * @method getHomepageHeroOptions
   * @description get options for rotating homepage hero image.
   * @returns {Object} Object with properties:
   * imgSrc, itemName, itemLink, collectionName, collectionLink
   */
  getHomepageHeroOptions() {
    let out = {};
    out[this.defaultHomepageHero.imgSrc] = this.defaultHomepageHero;
    if( !this.enabled ) return out;

    //TODO: set up image loading other than default
    // this.getFeaturedImages.forEach(img => {});
    console.warn("Featured images not set up. Currently serving default hero image!");
    return out;
  }

  /**
   * @method getAppText
   * @description get application text by the provided identified.  id should be the sort
   * name without the text- prefix.  example: featured-collection for id:
   * /application/ucd-lib-client/text-featured-collection
   * 
   * @param {String} id 
   * 
   * @returns {null|Object} {text: String, label: string}
   */
  getAppText(id) {
    id = '/application/ucd-lib-client/text-'+id;
    let container = this.byId[id];
    if( !container ) return null;
    return {
      text : container.description || '',
      label : container.label || ''
    };
  }

  /**
   * @method getApplicationContainer
   * @description return the main application container from the app graph
   * 
   * @returns {Object}
   */
  getApplicationContainer() {
    return APP_CONFIG.fcAppConfig
      .find(item => item['@type'].includes(this.TYPES.APPLICATION_CONTAINER));
  }

  /**
     * @method getCollectionAppData
     * @description load a collections application container display data by id
     * 
     * @param {String} id collection id
     * 
     * @returns {Promise} resolves to a jsonld graph
     */
  async getCollectionAppData(id) {
    let resp = await this.service.getCollectionAppData(id);
    if( resp && resp.state === 'loading' ) {
      await resp.request;
    }
    return this.store.data.collectionAppData[id];
  }

  /**
     * @method getItemAppData
     * @description load an items application container display data by id
     * 
     * @param {String} id item id
     * 
     * @returns {Promise} resolves to a jsonld graph
     */
  async getItemAppData(id) {
    let resp = await this.service.getItemAppData(id);
    if( resp && resp.state === 'loading' ) {
      await resp.request;
    }
    return this.store.data.itemAppData[id];
  }

  /**
   * @method getCollectionDisplayData
   * @description returns a formatted jsonld object for a collection
   * 
   * @param {String} id collection id
   * @param {Object} opts options object with properties to save
   * 
   * @returns {Promise} resolves to record
   */
  getCollectionDisplayData(id, opts={}) {
    const {
      title, 
      watercolor, 
      itemCount, 
      itemDefaultDisplay, 
      savedItems,
      showDisclaimer
    } = opts;
    let data = {
      "@context" : {
        "@vocab" : "http://schema.org/",
        "fedora" : "http://fedora.info/definitions/v4/repository#",
        "ldp" : "www.w3.org/ns/ldp#",
        "schema" : "http://schema.org/",
        "ucdlib" : "http://digital.ucdavis.edu/schema#",
        "xsd" : "http://www.w3.org/2001/XMLSchema#",
        "collection" : {
          "@type" : "@id",
          "@id" : "ucdlib:collection"
        },
        "watercolors" : {
          "@type" : "@id",
          "@id" : "ucdlib:watercolors"
        },
        "foreground" : {
          "@type" : "xsd:text",
          "@id" : "ucdlib:foreground"
        },
        "background" : {
          "@type" : "xsd:text",
          "@id" : "ucdlib:background"
        },
        "ldp:membershipResource" : {
          "@type" : "@id"
        },
        "ldp:hasMemberRelation" : {
          "@type" : "@id"
        }
      },
      "@id" : '',
      "watercolors" : [
        {
          "@id" : `info:fedora/application/ucd-lib-client${id}#watercolor`,
          "css" : watercolor,
          "foreground" : "",
          "background" : ""
        }
      ],
      'schema:isPartOf': {'@id': `info:fedora${id}`},
      "name" : title,
      "ucdlib:itemCount" : itemCount,
      "ucdlib:itemDefaultDisplay" : itemDefaultDisplay,
      "ucdlib:showDisclaimer" : showDisclaimer,
      "exampleOfWork" : savedItems,
      "isPartOf" : {
        "@id" : `info:fedora${id}`
      }
    };

    if( opts.newFileUploadName || opts.thumbnailUrlOverride ) {
      data['thumbnailUrl'] = {
        "@id" : `info:fedora/application/ucd-lib-client${id}/featuredImage.jpg`
      };
    }

    return data;
  }  

  /**
   * @method saveCollectionDisplayData
   * @description save a collections display data
   * 
   * @param {String} id collection id
   * @param {Array} displayData record id
   * 
   * @returns {Promise} resolves to record
   */
  async saveCollectionDisplayData(id, displayData) {
    return await this.service.saveCollectionDisplayData(id, displayData);
  }

  /**
   * @method saveCollectionFeaturedImage
   * @description save collection featured image
   * 
   * @param {String} id collection id
   * @param {Array} featuredImage record id
   *  
   */
  async saveCollectionFeaturedImage(id, featuredImage) {
    return await this.service.saveCollectionFeaturedImage(id, featuredImage);
  }

  /**
     * @method getFeaturedCollectionAppData
     * @description load landing page featured collections application container display data
     * 
     * @returns {Promise} resolves to a json object
     */
  async getFeaturedCollectionAppData() {
    return await this.service.getFeaturedCollectionAppData();
  }

  /**
   * @method saveFeaturedCollectionAppData
   * @description save landing page featured collections application container display data
   * 
   * @param {Array} displayData json data
   * 
   * @returns {Promise} resolves to record
   */
  async saveFeaturedCollectionAppData(displayData) {
    return await this.service.saveFeaturedCollectionDisplayData(displayData);
  }

  /**
     * @method getItemDisplayData
     * @description returns a formatted jsonld object for an item
     * 
     * @param {String} id record id
     * @param {String} itemDisplay display override
     * 
     * @returns {Object} jsonld object
     */
  getItemDisplayData(id, itemDisplay) {
    return {
      "@context" : {
        "@vocab" : "http://schema.org/",
        "fedora" : "http://fedora.info/definitions/v4/repository#",
        "ldp" : "www.w3.org/ns/ldp#",
        "schema" : "http://schema.org/",
        "ucdlib" : "http://digital.ucdavis.edu/schema#",
        "xsd" : "http://www.w3.org/2001/XMLSchema#",
        "item" : {
          "@type" : "@id",
          "@id" : "ucdlib:item"
        },
        "ldp:membershipResource" : {
          "@type" : "@id"
        },
        "ldp:hasMemberRelation" : {
          "@type" : "@id"
        }
      },
      "@id" : '',
      "ucdlib:itemDefaultDisplay" : itemDisplay,
      "isPartOf" : {
        "@id" : `info:fedora${id}`
      }
    }
  }

  /**
     * @method getItemDisplayData
     * @description returns a formatted jsonld object for an item
     * 
     * @param {Array} itemExceptions array of record ids
     * 
     * @returns {Object} jsonld object
     */
  async updateItemDisplayExceptions(itemExceptions) {
    for( let itemId of itemExceptions ) {
      let newDisplayData = this.getItemDisplayData(itemId, '');
      await this.service.saveItemDisplayData(itemId, newDisplayData);
    }
  }

  /**
   * @method saveItemDisplayData
   * @description save an items display data
   * 
   * @param {String} id record id
   * @param {Array} displayData record id
   * 
   * @returns {Promise} resolves to record
   */
  async saveItemDisplayData(id, displayData) {
    return await this.service.saveItemDisplayData(id, displayData);
  }

}

/**
 * @func asArray
 * @description Always returns an array given a (possibly non-array) value
 * @param {*} val 
 * 
 * @returns {Array}
 */
function asArray(val) {
  if( val === undefined ) return [];
  if( Array.isArray(val) ) return val;
  return [val];
}

/**
 * @func sortArray
 * @description Sorts array by position property
 * @param {*} arr 
 * 
 * @returns sorted array
 */
function sortArray(arr) {
  arr.forEach(container => {
    if( container && typeof container.position !== 'number' ) {
      container.position = container.position ? parseInt(container.position) : 9999;
    }
  });
  arr.sort((a, b) => a.position < b.position ? -1 : 1);
  return arr;
}

module.exports = new FcAppConfigModel();