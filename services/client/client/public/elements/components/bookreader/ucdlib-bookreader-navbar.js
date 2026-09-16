import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-bookreader-navbar.tpl.js";
import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import '@ucd-lib/theme-elements/ucdlib/ucdlib-icons/ucdlib-icons';

import './ucdlib-bookreader-slider.js';

export default class UcdlibBookreaderNavbar extends Mixin(LitElement)
.with(LitCorkUtils) {

  static get properties() {
    return {
      selectedPage : { type: Number },
      numPages : { type: Number },
      fullscreen : { type: Boolean },
      singlePageView : { type: Boolean },
      selectedResult : { type: Number },
      searchResults : { type: Array },
      searchResultsCount : { type: Number },
      searching : { type: Boolean },
      selectedPageLabel : { type: String }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._reset();

    this._injectModel('BookReaderModel');
  }

  _onBookreaderStateUpdate(e) {
    this.selectedPage = e.selectedPage || 0;
    this.numPages = e.bookViewData?.pages?.length || 0;
    this.singlePageView = e.selectedView === 'double' ? false : true;
    this.selectedResult = (e.selectedSearchResult || 0) + 1;
    this.searching = e.searchActive;

    this.searchResults = [];
    if( e.searchResults?.state === 'loaded' ) {
      let searchResults = e.searchResults.payload || {};
      let results = [];
      for( let page in searchResults ) {
        results.push(...searchResults[page]);
      }
      this.searchResults = results.sort((a,b) => parseInt(a.page || 0) - parseInt(b.page || 0));
    }
    this.searchResultsCount = this.searchResults.length;

    requestAnimationFrame(() => {
      let slider = this.shadowRoot.querySelector('ucdlib-bookreader-slider');
      if( slider ) slider._onResize();
    });

    this._updatePageLabels();
  }

  _reset() {
    this.selectedPage = 0;
    this.numPages = 0;
    this.fullscreen = false;
    this.singlePageView = false;
    this.selectedResult = 0;
    this.searchResults = [];
    this.searchResultsCount = 0;
    this.searching = false;
    this.selectedPageLabel = '';
  }

  _prevPage(e) {
    let pageIncrement = this.singlePageView ? 1 : 2;
    if( this.selectedPage === 1 ) pageIncrement = 1;
    if( pageIncrement === 2 && this.selectedPage % 2 === 0 ) pageIncrement = 1; // if viewing odd page (0-index) in 2page mode, should only move a single page back

    if( this.selectedPage > 0 ) {
      this.BookReaderModel.setPage(this.selectedPage - pageIncrement);
    }

    this._updatePageLabels();
  }

  _nextPage(e) {
    let pageIncrement = this.singlePageView ? 1 : 2;
    if( this.selectedPage === 0 ) pageIncrement = 1;
    if( pageIncrement === 2 && this.selectedPage % 2 === 0 ) pageIncrement = 1; // if viewing odd page (0-index) in 2page mode, should only move a single page forward

    if( (this.selectedPage+pageIncrement) < this.numPages ) {
      this.BookReaderModel.setPage(this.selectedPage + pageIncrement);
    } else if( !this.singlePageView && this.selectedPage+2 === this.numPages ) {
      // update to last page if in double page view and on last page
      this.BookReaderModel.setPage(this.selectedPage + 1);
    }

    this._updatePageLabels();
  }

  _updatePageLabels() {    
    // update selected page label, the page number if single page, otherwise include the page range if double page
    // if first/last page, since we don't want to show a range if we're on the first
    if( this.singlePageView || this.selectedPage === 0 ) {
      this.selectedPageLabel = this.selectedPage+1;
    } else if( this.selectedPage === (this.numPages-1) && this.numPages % 2 === 1 ) { 
      // very last page (for odd number pages)
      this.selectedPageLabel = this.selectedPage + '-' + (this.selectedPage+1);
    } else if( this.selectedPage === (this.numPages-1) && this.numPages % 2 !== 1 ) { 
      // very last page (for even number pages)
      this.selectedPageLabel = this.selectedPage+1;
    } else {
      this.selectedPageLabel = this.selectedPage+1 + '-' + (this.selectedPage+2);
    }

    // also set custom property to help with styling so nav doesn't jump around
    let pageLabelDiv = this.shadowRoot.querySelector('.br-currentpage-override');
    if( pageLabelDiv ) pageLabelDiv.style.setProperty('--num-pages-length', this.numPages.toString().length);
  }

  _prevSearchResult(e) {
    if( this.selectedResult > 1 ) {
      this.BookReaderModel.setPage((this.searchResults[this.selectedResult - 2]?.page || 1) - 1)
      this.BookReaderModel.setSelectedSearchResult(this.selectedResult - 2);
    }
  }

  _nextSearchResult(e) {
    if( this.selectedResult < this.searchResultsCount ) {
      this.BookReaderModel.setPage((this.searchResults[this.selectedResult]?.page || 1) - 1)
      this.BookReaderModel.setSelectedSearchResult(this.selectedResult);
    }
  }

  updateSearchResults(searchResults=[]) {
    let slider = this.shadowRoot.querySelector('ucdlib-bookreader-slider');
    if( slider ) {
      slider.updateSearchResults(searchResults);
    }
  }

  _onSearchClicked(e) {
    let searching = this.BookReaderModel.store?.data?.state?.searchActive || false;
    this.BookReaderModel.setSearchActive(!searching);
    this.searching = !this.searching;
  }
  

  _onToggleBookView(e) {    
    this.BookReaderModel.setView(this.singlePageView ? 'double' : 'single');
    this.singlePageView = !this.singlePageView;
  }

  _onZoomInClicked(e) {
    this.BookReaderModel.zoomIn();
  }

  _onZoomOutClicked(e) {
    this.BookReaderModel.zoomOut();
  }

  _onCloseClicked(e) {
    this.BookReaderModel.setFullscreen(false);
    this.fullscreen = false;
  }
  
}

customElements.define('ucdlib-bookreader-navbar', UcdlibBookreaderNavbar);