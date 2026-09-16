const {BaseModel} = require('@ucd-lib/cork-app-utils');
const AppStateModel = require('./AppStateModel');
const CollectionModel = require('./CollectionModel');
const config = require('../config');
const clone = require('clone');

const seo = require('../../../../models/seo/index.js')

const transform = seo.recordTransform;
const collectionTransform = seo.collectionTransform;

// keep the JSON-LD script tag up to date
class SeoModel extends BaseModel {

  constructor() {
    super();
    if( typeof window === 'undefined' ) return;
    this.ele = document.querySelector('#seo-jsonld');
    
    this.EventBus.on(AppStateModel.store.events.APP_STATE_UPDATE, (e) => this._onAppStateUpdate(e));
    this.EventBus.on(AppStateModel.store.events.SELECTED_RECORD_UPDATE, (e) => this._onAppStateUpdate(e));
    this.EventBus.on(CollectionModel.store.events.COLLECTION_UPDATE, (e) => this._onAppStateUpdate(e));
    this.EventBus.on(CollectionModel.store.events.COLLECTION_UPDATE, (e) => this._onCollectionUpdate(e));

    this.register('SeoModel');
  }

  /**
   * @method _onAppStateUpdate
   * @description set site meta tags and jsonld
   */
  async _onAppStateUpdate(e) {
    return; // TODO loop badness
    if( e.state !== 'loaded' ) return;

    let state = AppStateModel.store.data;

    let isRecord = (state.location.page === 'item');
    let isCollection = (state.location.page === 'collection');

    if( isCollection ) return;

    if( isCollection ) await CollectionModel.get(state.location.fullpath);
    if( state.selectedRecord && isRecord ) {
      this._setJsonLd(state.selectedRecord);
      this._setMetaTags({
        title : state.selectedRecord.name + ' - ' + config.metadata.title,
        description : state.selectedRecord.description || '',
        keywords : (state.selectedRecord.abouts || []).join(', ')
      });
    } else if( !isRecord && !isCollection ) {
      this._clearJsonLd();
      this._setMetaTags({
        title : config.metadata.title,
        description : config.metadata.description,
        keywords : ''
      });
    }
  }

  /**
   * @method _onCollectionUpdate
   * @description set site meta tags and jsonld for collection page
   */
  async _onCollectionUpdate(e) {
    if( e.state !== 'loaded' ) return;
    if( AppStateModel.location.page !== 'collection' ) return;

    let collection = e.payload?.root;
    if( !collection ) return;

    this._setCollectionJsonLd(collection);
    this._setMetaTags({
      title : collection.name + ' - ' + config?.metadata?.title,
      description : collection.description || '',
      keywords : (collection.abouts || []).join(', ')
    });
  }

  /**
   * @method _setMetaTags
   * @description set site title and meta tags
   * 
   * @param {Object} metadata
   * @param {String} metadata.title
   * @param {String} metadata.description
   * @param {String} metadata.keywords
   */
  _setMetaTags(metadata) {
    document.title = metadata.title || '';
    this._setMetaTag('description', metadata.description || '');
    this._setMetaTag('keywords', metadata.keywords || '');
  }

  /**
   * @method _setMetaTag
   * @description set a specific meta tag attributes by name.
   * 
   * @param {String} tagname 
   * @param {String} content 
   */
  _setMetaTag(tagname, content) {
    let ele = document.head.querySelector(`meta[name=${tagname}]`);
    if( !ele ) return;
    ele.setAttribute('content', content);
  }

  _setJsonLd(selectedRecord) {
    let record = clone(selectedRecord);
    
    for( var key in record.root ) {
      if( key[0] === '_' ) delete record[key];
    }
    
    // populate associatedMedia from graph
    if( record.root.associatedMedia ) {
      if( !Array.isArray(record.root.associatedMedia) ) record.root.associatedMedia = [record.root.associatedMedia];
      let associatedMedia = [...record.root.associatedMedia];
      associatedMedia.forEach((media, index1) => {
        let graphMatch = record.clientMedia.graph.filter(r => r['@id'] === media['@id'])[0];
        if( graphMatch ) {
          associatedMedia[index1] = graphMatch;
          if( graphMatch.hasPart ) {
            graphMatch.hasPart.forEach((part, index2) => {
              graphMatch = record.clientMedia.graph.filter(r => r['@id'] === part['@id'])[0];
              if( graphMatch ) {
                let matchedMedia = associatedMedia[index1].hasPart[index2];
                matchedMedia.image = graphMatch;
                matchedMedia['@type'] = graphMatch['@type'];
                if( graphMatch.position ) {
                  matchedMedia.position = parseInt(graphMatch.position);
                  delete graphMatch.position;
                }
                let imageSize = graphMatch.clientMedia?.images?.original?.size;
                if( imageSize ) {
                  matchedMedia.image.width = parseInt(imageSize.width);
                  matchedMedia.image.height = parseInt(imageSize.height);
                }
                let thumbnailUrl = graphMatch.clientMedia?.images?.small?.url;
                if( thumbnailUrl ) {
                  matchedMedia.thumbnailUrl = thumbnailUrl;
                }
                matchedMedia.isPartOf = media;
                matchedMedia.directParent = media['@id'];
              }
            });
          }
        }
      });
      record.root.associatedMedia = associatedMedia;
    }

    record = transform(record.root, record.clientMedia);

    if( this.ele?.innerHTML ) this.ele.innerHTML = JSON.stringify(record, '  ', '  ');
  }

  _setCollectionJsonLd(selectedCollection) {
    let collection = clone(selectedCollection);
    
    for( var key in collection ) {
      if( key[0] === '_' ) delete collection[key];
    }
    collection = collectionTransform(collection, window.location.protocol+'//'+window.location.host);

    if( this.ele?.innerHTML ) this.ele.innerHTML = JSON.stringify(collection, '  ', '  ');
  }

  _clearJsonLd() {
    if( this.ele?.innerHTML ) this.ele.innerHTML = '';
  }

}

module.exports = new SeoModel();