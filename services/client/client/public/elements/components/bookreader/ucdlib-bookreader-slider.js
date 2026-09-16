import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-bookreader-slider.tpl.js";
import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

export default class UcdlibBookreaderSlider extends Mixin(LitElement)
.with(LitCorkUtils) {

  static get properties() {
    return {
      maxPage : { type: Number },
      selectedPage : { type: Number },
      width : { type: Number },
      searchResults : { type: Array },
      isMoving : { type: Boolean }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('BookReaderModel');

    this._reset();

    this._onMove = this._onMove.bind(this);
    this._onMoveStart = this._onMoveStart.bind(this);
    this._onMoveEnd = this._onMoveEnd.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  firstUpdated() {
    this.track = this.shadowRoot.getElementById('track');
    this.handle = this.shadowRoot.getElementById('handle');
    if( this.handle ) {
      this.handle.addEventListener('mousedown', this._onMoveStart);
      // this.handle.addEventListener('touchstart', () => this.isDragging = true);
    } else {
      this.logger.error('Failed to find handle element');
    }

    this._calculatePages();
  }

  connectedCallback() {
    super.connectedCallback();

    window.addEventListener('resize', this._onResize);

    window.addEventListener('mousemove', this._onMove);
    window.addEventListener('touchmove', this._onMove);

    window.addEventListener('mouseup', this._onMoveEnd);
    window.addEventListener('touchend', this._onMoveEnd);
    window.addEventListener('mouseup', this._onMoveEnd);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('resize', this._onResize);

    window.removeEventListener('touchmove', this._onMove);
    window.removeEventListener('mousemove', this._onMove); 

    window.removeEventListener('mouseup', this._onMoveEnd);
    window.removeEventListener('touchend', this._onMoveEnd);
  }

  _onBookreaderStateUpdate(e) {
    this.selectedPage = e.selectedPage || 0;
    this.maxPage = (e.bookViewData?.pages?.length || 1) - 1;
    this._calculatePages();

    // update slider position with new page
    let newLeft = this.pages[this.selectedPage];
    this.handle.style.left = `${newLeft}px`;
  }

  _reset() {
    this.maxPage = 0;
    this.selectedPage = 0;
    this.width = this.offsetWidth;
    this.searchResults = [];
    this.isMoving = false;
  }

  _calculatePages() {
    let trackRect = this.track.getBoundingClientRect();
    this.pageWidth = trackRect.width / this.maxPage;
    this.pages = Array.from({ length: (this.maxPage+1) }, (_, i) => i * this.pageWidth);
  }

  _onResize(e) {
    this.width = this.offsetWidth || 1;
    this._calculatePages();
    this.updateSearchResults(this.searchResults);
    this.handle.style.left = `${this.pages[this.selectedPage]}px`;  
  }

  _onMoveStart(e) {
    this.isMoving = true;
    this.moveStart = {
      x : e.clientX,
      left : this.handle.offsetLeft
    }
  }

  _onClickTrack(e) {
    this.isMoving = true;
    this._onMove(e);
    this._onMoveEnd(e);
  }

  _onMove(e) {
    if( !this.isMoving ) return;
    
    let trackRect = this.track.getBoundingClientRect();
    let clientX = e.touches?.length ? e.touches[0].clientX : e.clientX;
    let newLeft = clientX - trackRect.left;

    let pageIncrement = this.BookReaderModel.store?.data?.state?.selectedView === 'double' ? 2 : 1;

    // update handle position (between 0 and max track width)
    newLeft = Math.max(0, Math.min(newLeft, trackRect.width));

    // calc new selected page
    let newPage = Math.round((newLeft / trackRect.width) * this.maxPage);
    if( newPage !== this.selectedPage ) {
      this.selectedPage = newPage;
    }

    let closestPage = this.pages.reduce((prev, curr) => 
      Math.abs(curr - newLeft) < Math.abs(prev - newLeft) ? curr : prev
    );

    // if 2page mode, need to flip to odd pages only. if even page, need to flip to next page
    if( pageIncrement === 2 && this.selectedPage % 2 === 0 ) {
      let match = this.pages.findIndex(page => page === closestPage);
      this.selectedPage = match;
    }

    // update handle position
    this.handle.style.left = `${closestPage}px`;    
  }

  _onMoveEnd(e) {
    if( !this.isMoving ) return;

    // this._onMove(e);
    this.isDragging = false;
    this.isMoving = false;
    this.BookReaderModel.setPage(this.selectedPage);
  }

  updateSearchResults(searchResults=[]) {
    // update slider with indicators of matches
    let searchIndicatorsDiv = this.shadowRoot.querySelector('.search-indicators');
    if( !searchIndicatorsDiv ) return;

    searchIndicatorsDiv.innerHTML = '';
    this.searchResults = searchResults;

    // clear all event listeners
    let indicators = searchIndicatorsDiv.querySelectorAll('.indicator');
    (indicators || []).forEach(indicator => {
      indicator.removeEventListener('click');
    });

    searchResults.forEach((result, index) => {
      let pageNumber = result.page || 0;
      let indicator = document.createElement('div');
      indicator.classList.add('indicator');
      indicator.setAttribute('data-search-result', index);
      indicator.style.left = `${(this.pages[pageNumber-1] || 0) - 4}px`;

      let searchQuery = document.createElement('div');
      searchQuery.classList.add('search-query');

      let main = document.createElement('main');
      let mainText = result.text || '';
      if( mainText.indexOf('{{{') !== -1 && mainText.indexOf('}}}') !== -1 ) {
        mainText = mainText.replace('{{{', '<mark>').replace('}}}', '</mark>');
      }
      main.innerHTML = mainText;

      let footer = document.createElement('footer');
      footer.innerText = `Page ${pageNumber}`;

      searchQuery.appendChild(main);
      searchQuery.appendChild(footer);
      indicator.appendChild(searchQuery);

      // add event listener to click/touch of indicator
      indicator.addEventListener('click', e => {
        let pageIncrement = this.BookReaderModel.store?.data?.state?.selectedView === 'double' ? 2 : 1;
        if( pageIncrement === 2 && pageNumber % 2 === 0 ) {
          pageNumber -= 1;
        }
        this.BookReaderModel.setPage(pageNumber-1);
        
        let selectedSearchResult = parseInt(indicator.getAttribute('data-search-result')) || 0;
        this.BookReaderModel.setSelectedSearchResult(selectedSearchResult);
      });

      searchIndicatorsDiv.appendChild(indicator);
    });
  }

}

customElements.define('ucdlib-bookreader-slider', UcdlibBookreaderSlider);