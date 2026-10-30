const {BaseModel} = require('@ucd-lib/cork-app-utils');
const FcAppConfigStore = require('../stores/FcAppConfigStore');
const FcAppConfigService = require('../services/FcAppConfigService');

/**
 * @class FcAppConfigModel
 * @description Site config and display edits: browse by side images, home page
 * featured collections, and collection/item display edits.
 */
class FcAppConfigModel extends BaseModel {
  
  constructor() {
    super();

    this.store = FcAppConfigStore;
    this.service = FcAppConfigService;
    
    this.register('FcAppConfigModel');
  }

  /**
   * @method getBrowseBySideImages
   * @description load the browse by pages' side images
   *
   * @returns {Promise<Object>} store state, body is {subjectPage, creatorPage, formatPage}
   */
  async getBrowseBySideImages() {
    let resp = await this.service.getBrowseBySideImages();
    if( resp && resp.state === 'loading' ) {
      await resp.request;
    }
    return this.store.data.browseBySideImages;
  }

  /**
   * @method getCollectionDisplayData
   * @description returns a collection's display edit as plain json
   * 
   * @param {String} id collection id
   * @param {Object} opts options object with properties to save
   *
   * @returns {Object} plain json edit
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
    // featured image is saved separately
    return {
      name : title,
      watercolors : { css : watercolor },
      itemCount,
      itemDefaultDisplay,
      showDisclaimer,
      exampleOfWork : savedItems
    };
  }

  /**
   * @method saveCollectionDisplayData
   * @description save a collections display data
   * 
   * @param {String} id collection id
   * @param {Array} displayData record id
   * @param {Object} opts {visibility: 'public'|'private'}, omit to keep current
   *
   * @returns {Promise} resolves to record
   */
  async saveCollectionDisplayData(id, displayData, opts={}) {
    return await this.service.saveCollectionDisplayData(id, displayData, opts);
  }

  /**
   * @method saveCollectionFeaturedImage
   * @description save collection featured image
   * 
   * @param {String} id collection id
   * @param {File} featuredImage image file
   *
   * @returns {Promise<Object|null>} {error, response}, or null with no file
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
     * @description returns an item's display edit
     * 
     * @param {String} id record id
     * @param {String} itemDisplay display override
     * 
     * @returns {Object} plain json edit
     */
  getItemDisplayData(id, itemDisplay) {
    return { itemDefaultDisplay : itemDisplay };
  }

  /**
     * @method updateItemDisplayExceptions
     * @description clear the display override on each item, stopping at the first failure
     *
     * @param {Array} itemExceptions array of record ids
     *
     * @returns {Promise<Object|null>} the failed request's error result, or null
     */
  async updateItemDisplayExceptions(itemExceptions) {
    for( let itemId of itemExceptions ) {
      let newDisplayData = this.getItemDisplayData(itemId, '');
      let result = await this.service.saveItemDisplayData(itemId, newDisplayData);
      if( result?.error ) return result;
    }
    return null;
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

module.exports = new FcAppConfigModel();