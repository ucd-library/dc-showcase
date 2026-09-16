import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-bookreader-page.tpl.js";
import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';


export default class UcdlibBookreaderPage extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      debug : { type: Boolean },
      page : { type: Number},
      buffer : { type: Number },
      bookData : { type: Object },
      pageData : { type: Object },
      ocrData : { type: Array},
      loading : { type: Boolean },
      clickNavEnabled : { type: Boolean },
      animating : { type: Boolean }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.page = -1;
    this.debug = false;
    this.pageData = {};
    this.buffer = 0;
    this.ocrData = [];
    this.loading = false;
    this.wordProcessGroupSize = 25;
    this.clickNavEnabled = false;
    this._injectModel('BookReaderModel');
    this.render = render.bind(this);

    this._onClick = this._onClick.bind(this);
  }

  firstUpdated() {
    this.imgEle = this.shadowRoot.querySelector('img');
    this._updatePageData();
    this._onBookreaderStateUpdate(this.BookReaderModel.getState());
  }

  updated(props) {
    if( props.has('currentPage') || props.has('bookData') ) {
      this._updatePageData();
    }

    if( props.has('debug') ) {
      this._debugUpdated();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onClick);
  }

  _onClick() {
    if( !this.clickNavEnabled ) return; 

    // this makes selecting text difficult
    if( this.view === 'double' ) {
      if( this.page % 2 === 0 ) {
        this.BookReaderModel.setPage(this.page+1);
      } else {
        this.BookReaderModel.setPage(this.page-1);
      }
    }
  }

  _onBookreaderStateUpdate(e) {
    if( this.view !== e.selectedView ) {
      this.view = e.selectedView;
    }

    // don't render words if we are animating
    this.animating = e.animating;
    if( this.animating ) {
      this._pauseOnAnimation();
    } else {
      if( this.pauseAnimationResolve ) {
        this.pauseAnimationResolve();
        this.pauseAnimation = null;
        this.pauseAnimationResolve = null;
      }
    }

    if( e.searchResults?.state === 'loaded' && 
        e.searchResults?.itemId === this.bookData?.id ) {
      this._renderOcrData();
    }
  }

  _setLoading(src) {
    this.loading = true;
    let img = new Image();
    img.onload = () => {
      this.loading = false;
    }
    img.src = src;
  }

  _debugUpdated() {
    if( this.debug ) {
      this.style.border = '1px solid red';
      this.style.color = 'red';
    } else {
      this.style.border = 'none';
      this.style.color = 'auto';
    }
  }

  _updatePageData() {
    if( !this.bookData || !this.bookData.pages ) return;
    if( !this.imgEle ) return;
    if( this.page == -1 ) return;

    if( this.page < 0 || this.page >= this.bookData.pages.length ) {
      this.pageData = {};
      this.style.display = 'none';
      return;
    } else {
      this.style.display = 'block';
    }

    this.pageData = this.bookData.pages[this.page];

    this.style.top = this.pageData.renderOffsetTop+'px';
    this.style.left = this.pageData.renderOffsetLeft+'px';
    this.style.width = this.pageData.renderWidth+'px';
    this.style.height = this.pageData.renderHeight+'px';

    this.imgEle.style.width = this.pageData.renderWidth+'px';
    this.imgEle.style.height = this.pageData.renderHeight+'px';

    if( this.lastImgUrl !== this.pageData.imageUrl ) {
      this._setLoading(this.pageData.imageUrl);
      this.lastImgUrl = this.pageData.imageUrl;
    }

    this.BookReaderModel.getOcrData(this.pageData, this.bookData.id)
      .then(data => this._renderOcrData(data));

    this.requestUpdate();
  }

  async _renderOcrData(data) {
    // TODO: this might need to be async rendering
    if( !data && this.renderedOcrData ) {
      data = this.renderedOcrData;
    }
    if( !data ) return;

    let search = this.BookReaderModel.getSearchResults(this.bookData.id, this.page);

    let pageChanged = false;
    if( this.renderedOcrTo ) {
      for( let key in this.renderedOcrTo ) {
        if( this.renderedOcrTo[key] !== this.pageData[key] ) {
          pageChanged = true;
          break;
        }
      }
    }
    if( search.text !== this.renderedSearchText ) {
      pageChanged = true;
    }

    // make sure these haven't changed after render 
    let currentPage = this.page;
    let currentBookId = this.bookData.id;
    let currentSearch = search.text;

    let ocrData = [];
    let time = new Date().getTime();
    if( !this.ocrData || pageChanged ) {
      let wordGroupCount = Math.ceil(data.payload.length / this.wordProcessGroupSize);

      for( let i = 0; i < wordGroupCount; i += 1 ) {
        if( this.pauseAnimation ) {
          await this.pauseAnimation;
        }

        let words = data.payload.slice(i*this.wordProcessGroupSize, (i+1)*this.wordProcessGroupSize);
        let scaledWords = await this._renderWordGroup(words, search);
        ocrData.push(...scaledWords);
      }
    }
    this.logger.debug('page='+this.page+' rendering '+data.payload.length+' words took', new Date().getTime()-time, 'ms');

    // make sure these haven't changed after render
    if( currentPage !== this.page || currentBookId !== this.bookData.id || currentSearch !== search.text ) {
      return;
    }

    this.renderedOcrTo = {
      renderRation : this.pageData.renderRatio,
      top: this.pageData.renderOffsetTop,
      left: this.pageData.renderOffsetLeft,
      width: this.pageData.renderWidth,
      height: this.pageData.renderHeight,
    }
    this.renderedSearchText = search.text;

    this.ocrData = ocrData;
    this.renderedOcrData = data;
    this.requestUpdate();
  }

  /**
   * @method _renderWordGroup
   * @description render a group of words at a time to prevent blocking the UI
   * 
   * @param {*} words 
   * @param {*} search 
   * @returns 
   */
  _renderWordGroup(words, search) {
    return new Promise((resolve, reject) => {
      let scaledWords = words.map(word => this._renderWordSize(word, search));
      setTimeout(() => resolve(scaledWords), 0);
    });
  }

  _pauseOnAnimation() {
    if( !this.animating ) return Promise.resolve();

    this.pauseAnimation = new Promise((resolve, reject) => {
      this.pauseAnimationResolve = resolve;
    });
    return this.pauseAnimation;
  }

  /**
   * @method _renderWordSize
   * @description render a single word, scaling it to the page and search results
   * 
   * @param {*} word 
   * @param {*} search 
   * @returns 
   */
  _renderWordSize(word, search) {
    let scaledWord = {
      text : word.text,
      top : Math.round(word.bbox.top*this.pageData.renderRatio),
      left : Math.round(word.bbox.left*this.pageData.renderRatio),
      right : Math.round(word.bbox.right*this.pageData.renderRatio),
      bottom : Math.round(word.bbox.bottom*this.pageData.renderRatio)
    }

    let fontSize = scaledWord.bottom-scaledWord.top;
    let letterSpacing = this.getWordLetterSpacing(fontSize, word.text, scaledWord.right-scaledWord.left);
    
    scaledWord.letterSpacing = letterSpacing.toFixed(2)+'px';
    scaledWord.fontSize = fontSize;
    scaledWord.top += this.buffer;
    scaledWord.bottom = this.pageData.renderHeight - scaledWord.bottom + this.buffer;
    scaledWord.right = this.pageData.renderWidth - scaledWord.right;
    scaledWord.selected = this._isSelectedWord(word, search.results);

    return scaledWord;
  }

  _isSelectedWord(word, results) {
    let hit, re;
    for( hit of results ) {
      for( re of hit.regex ) {
        if( re.test(word.text) ) {
          return true;
        }
      }
    }
    return false;
  }

  getWordLetterSpacing(fontSize, word, width) {
    let span = document.createElement('span');
    span.style.fontSize = fontSize+'px';
    span.style.visibility = 'hidden';
    span.innerHTML = word;
    document.body.appendChild(span);

    let spanWidth = span.offsetWidth;
    let spacing = (width - spanWidth) / (word.length-1);
    document.body.removeChild(span);
    return spacing
  }

}

customElements.define('ucdlib-bookreader-page', UcdlibBookreaderPage);