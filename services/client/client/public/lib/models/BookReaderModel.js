import {BaseModel} from '@ucd-lib/cork-app-utils';
import BookReaderService from '../services/BookReaderService.js';
import BookReaderStore from '../stores/BookReaderStore.js';

class BookReaderModel extends BaseModel {

  constructor() {
    super();

    this.store = BookReaderStore;
    this.service = BookReaderService;
    this.service.model = this;
    this.xmlParser = new DOMParser();
    this.zoomLevels = [1, 1.25, 1.5, 2, 3, 4];
      
    this.register('BookReaderModel');
  }

  getState() {
    return this.store.data.state;
  }

  zoomIn() {
    let zoomIndex = this.store.data.state.zoomIndex;
    this.setZoom(zoomIndex+1);
  }

  zoomOut() {
    let zoomIndex = this.store.data.state.zoomIndex;
    this.setZoom(zoomIndex-1);
  }

  setZoom(zoomIndex) {
    if( !this.store.data.state.fullscreen ) return;

    zoomIndex = parseInt(zoomIndex);
    if( zoomIndex < 0 ) zoomIndex = 0;
    if( zoomIndex >= this.zoomLevels.length ) {
      zoomIndex = this.zoomLevels.length-1;
    }
    let zoom = this.zoomLevels[zoomIndex];
    
    if( zoom === this.store.data.state.zoom ) return;
    if( zoomIndex === this.store.data.state.zoomIndex ) return;
    
    let state = {zoom, zoomIndex};

    // if we are zooming, we need to adjust the offset
    if( zoomIndex === 0 ) {
      state.offsetX = 0;
      state.offsetY = 0;
    } else {
      let offsetX = this.store.data.state.offsetX;
      let offsetY = this.store.data.state.offsetY;
      let currentZoom = this.store.data.state.zoom;
      state.offsetX = offsetX * (zoom / currentZoom);
      state.offsetY = offsetY * (zoom / currentZoom);
    }

    this.store.setState(state);
  }

  setPan(offsetX, offsetY) {
    if( !this.store.data.state.fullscreen ) return;
    if( this.store.data.state.offsetX === offsetX && 
        this.store.data.state.offsetY === offsetY ) return;
    if( this.store.data.state.zoomIndex === 0 ) return;

    this.store.setState({offsetX, offsetY});
  }

  resetPanZoom() {
    this.store.setState({
      zoom: this.zoomLevels[0],
      zoomIndex: 0,
      offsetX: 0, 
      offsetY: 0
    });
  }

  /**
   * @method setPage
   * @description set the current page to render.  if 'double' view
   * is selected, sets the current page to the left most page
   * 
   * @param {Number} page 
   */
  setPage(page) {
    if( this.isAnimating() ) return;
    this.resetPanZoom();
    this.store.setState('selectedPage', page);
  }

  /**
   * @method setView
   * @description set the current view to render.  either 'single' or 'double'
   * 
   * @param {String} view 
   */
  setView(view) {
    if( this.isAnimating() ) return;
    this.resetPanZoom();
    this.store.setState('selectedView', view);
  }

  /**
   * @method setAnimating
   * @description are we currently animating between pages?
   * 
   * @param {Boolean} animating 
   */
  setAnimating(animating) {
    if( animating ) {
      this.store.setState('animating', animating);
    } else {
      setTimeout(() => 
        this.store.setState('animating', false), 25
      );
    }
  }

  isAnimating() {
    return this.store.data.state.animating;
  }

  /**
   * @method setFullscreen
   * @description set the current fullscreen state
   * 
   * @param {Boolean} fullscreen 
   */
  setFullscreen(fullscreen) {
    this.resetPanZoom();
    this.store.setState('fullscreen', fullscreen);
  }

  /**
   * @method setSearchActive
   * @description set the search to active (search overlay)
   * 
   * @param {Boolean} active 
   */
  setSearchActive(active) {
    if( !active ) this.store.setState('selectedSearchResult', 0);
    this.store.setState('searchActive', active);
  }

  /**
   * @method setSelectedSearchResult
   * @description set the selected search result
   * 
   * @param {Number} page
   */
  setSelectedSearchResult(page) {
    this.store.setState('selectedSearchResult', page);
  }

  setSelectedBook(id, record) {
    this.clearSearch();
    this.store.setState({
      selectedBook : id,
      selectedPage : 0,
      searchResults : null,
      fullscreen : false,
      searchActive: false,
      offsetX : 0,
      offsetY : 0,
      zoomIndex : 0,
      zoom : this.zoomLevels[0]
    });
    if( record ) {
      this.loadBookFromItemRecord(record);
    } else {
      // TODO: load from client media model
      this.logger.error('no record provided to setSelectedBook. TODO: load from client media model');
    }
  }

  async loadBookFromItemRecord(record) {
    let id = record.clientMedia.id;

    // let imageList = null;
    let imageList = record.clientMedia?.mediaGroups?.find(item => item?.['@shortType'].includes('ImageList'));
    let pdf = record.clientMedia?.mediaGroups?.find(item => item?.fileFormatSimple === 'pdf');

    // debugger;
    if( imageList ) {
      this.store.set(
        {id, payload: imageList.clientMedia.pages, state: this.store.STATE.LOADED, src: imageList}, 
        this.store.data.bookManifest
      );
    } else if( pdf ) {
      await this.service.loadPdfManifest(id, pdf);
    } else {
      this.logger.error('no valid media found for book', record.clientMedia.id);
      return;
    }

    let manifest = this.store.data.bookManifest.get(id);
    let index, image, ocrUrl, imageUrl, height, width, originalHeight, originalWidth, scale, filename;
    let bookViewData = {
      id,
      totalHeight : 0,
      pages : null
    }

    let isIndex0 = false;
    if( manifest.payload.length ) {
      isIndex0 = manifest.payload[0].page === 0;
    }

    bookViewData.pages = manifest.payload
      .filter(page => this._isValidPage(page))
      .map(page => {
        index = isIndex0 ? page.page : page.page - 1;
        image = page[page.ocr.imageSize];
        ocrUrl = page.ocr.url;
        imageUrl = image.url;

        height = parseInt(image.size.height);
        width = parseInt(image.size.width);
        originalHeight = parseInt(page?.original?.size?.height || page?.large?.size?.height);
        originalWidth = parseInt(page?.original?.size?.width || page?.large?.size?.width);
        scale = width / originalWidth;
        filename = page['@id']?.split('/').pop()
        return {height, width, imageUrl, scale, ocrUrl, index, originalHeight, originalWidth, page: page.page, filename};
    });

    bookViewData.pages.sort((a, b) => {
      if( a.page < b.page ) return -1;
      if( a.page > b.page ) return 1;

      if( a.filename.toLowerCase() < b.filename.toLowerCase() ) return -1;
      if( a.filename.toLowerCase() > b.filename.toLowerCase() ) return 1;

      return 0;
    });

    bookViewData.pages.forEach((page, displayIndex) => {
      page.displayIndex = displayIndex;
    });

    this.store.setState('bookViewData', bookViewData);
  }

  _isValidPage(page) {
    if( isNaN(page.page) ) return false;
    if( page.page === null || page.page === undefined ) return false;
    if( !page.ocr?.url || !page.ocr?.size ) return false;
    return true;
  }

  async getOcrData(page, itemId) {
    return this.service.getOcrData(page.ocrUrl, itemId, page.index);
  }

  async search(itemId, bookItemId, query) {
    this.clearSearch();
    return this.service.search(itemId, bookItemId, query);
  }

  async clearSearch() {
    this.store.setState('searchResults', null);
  }

  getSearchResults(itemId, page) {
    let searchResults = this.store.data.state.searchResults;
    if( !searchResults || searchResults.itemId !== itemId ) {
      return {results: [], itemId, page, text: ''};
    }

    let results = searchResults.payload[page];
    return {results: results || [], itemId, page, text: searchResults.text};
  }

  getBookViewPage(itemId, page) {
    let bookData = this.store.data.state.bookViewData
    if( !bookData || bookData?.id !== itemId ) {
      this.logger.error('could not find book data for page', itemId, page);
      return null;
    }

    let pageData = bookData.pages.find(i => i.index === page);
    if( !pageData ) {
      this.logger.error('could not find page data for page', itemId, page);
      return null;
    }

    return pageData;
  }

  parsePageWords(xml, itemId, page) {
    let xmlDoc = this.xmlParser.parseFromString(xml, "text/xml");
    let ocrData = [];

    // let o = xmlDoc.querySelector('OBJECT');
    // let height = parseInt(o.getAttribute('height'));
    // let width = parseInt(o.getAttribute('width'));

    let bookData = this.store.data.state.bookViewData
    if( !bookData || bookData?.id !== itemId ) {
      this.logger.error('could not find book data for page', itemId, page);
      return ocrData;
    }

    let pageData = bookData.pages.find(i => i.index === page);
    if( !pageData ) {
      this.logger.error('could not find page data for page', page, bookData);
      return ocrData;
    }

    let {scale} = pageData;

    xmlDoc.querySelectorAll('WORD').forEach(word => {
      var [left, bottom, right, top] = word
        .getAttribute('coords')
        .split(',')
        .map(v => parseInt(v));

      word = {
        bbox: {left, bottom, right, top, scale},
        text : word.textContent
      }

      ocrData.push(word);
    });

    return ocrData
  }
}

const model = new BookReaderModel();
export default model;