const {AppStateModel} = require('@ucd-lib/cork-app-state');
const AppStateStore = require('../stores/AppStateStore');

const {getLogger} = require('@ucd-lib/cork-app-utils');

const config = require('../config');
const clone = require('clone');

class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();
    this.store = AppStateStore;
    // this.logger = getLogger('AppStateModel');

    if( !APP_CONFIG.enableGA4Stats ) console.warn('GA4 stats are disabled by flag');
    if( !window.gtag ) console.warn('No global gtag variable set for analytics events');
    if( !APP_CONFIG.gaId && APP_CONFIG.enableGA4Stats ) console.warn('GA4 stats are enabled but no GA ID is set');

    this.init(APP_CONFIG.appRoutes);
    this._sendGA();
  }

  set(update) {
    if( update.location ) {
      update.lastLocation = clone(this.store.data.location);

      // /collection/* is an alias for a base collection search
      // ^ this might change, since collection in v2 will be a placeholder page with a summary of the collection and links
      // to highlighted items in the collection, and citation copy link section

      let page = update.location.path ? update.location.path[0] : 'home';
      if( !page ) page = 'home'

      // if( page === 'collection' ) {
      //   if( update.location.path.length === 2 ) {
      //     page = 'search';
      //   } else {
      //     page = 'record';
      //   }
      // }

      update.location.page = page;
    }

    this._sendGA();

    return super.set(update);
  }

  /**
   * @method _sendGA
   * @description send a google analytics event if pathname has changed
   */
  _sendGA() {
    if( !APP_CONFIG.enableGA4Stats ) return;
    if( !window.gtag ) return;
    if( !APP_CONFIG.gaId ) return;

    if( this.lastGaLocation === window.location.pathname ) return;
    this.lastGaLocation = window.location.pathname;

    // temp hack until env variables are used
    gtag('set', 'cookie_domain', 'digital.ucdavis.edu');
    gtag('config', APP_CONFIG.gaId, {
      page_path: window.location.pathname,
      page_location: window.location.href,
      cookie_domain: 'digital.ucdavis.edu'
    });
  }

  setSelectedRecord(record) {
    this.store.setSelectedRecord(record);
  }

  getSelectedRecord() {
    return this.store.getSelectedRecord();
  }

  setSelectedCollection(collection) {
    this.store.setSelectedCollection(collection);
  }

  getSelectedCollection() {
    return this.store.getSelectedCollection();
  }

}

module.exports = new AppStateModelImpl();
