import { LitElement } from 'lit';

import render from "./dams-hero.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import '@ucd-lib/theme-elements/brand/ucd-theme-header/ucd-theme-header.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-primary-nav/ucd-theme-primary-nav.js';

import "./dams-watercolor";

/**
 * @class DamsHero
 * @description UI component for displaying a hero image
 * @prop {Array} srcOptions - Set of image sources to randomly display
 * @prop {String} src - Fallback background image source
 * @prop {String} watercolor - Watercolor type
 * @prop {String} selectedSrcUrl - The currently displayed image source
 */
export default class DamsHero extends Mixin(LitElement)
.with(LitCorkUtils) {

  static get properties() {
    return {
      src: {type: String},
      srcOptions: {type: Array, attribute: "src-options"},
      watercolor: {type: String},
      selectedSrcUrl: {type: String, attribute: "selected-src-url"}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.src = "";
    this.srcOptions = [];
    this.selectedSrcUrl = "";
    this.watercolor = "border-white";

    this._srcChange = new CustomEvent('src-change', {
      detail: {
        message: 'A new image has been loaded'
      }
    });

    this._injectModel('FcAppConfigModel');
  }


  /**
   * @method shuffleImage
   * @description Randomly displays a new hero image.
   * 
   * @returns {String} The new img src
   */
  shuffleImage(){
    this._setSrc();
    return this.selectedSrcUrl;
  }

  updated(changedProperties) {
    if( changedProperties.has('selectedSrcUrl') && this.selectedSrcUrl.length > 0 ) {
      let img = new Image();
      img.src = this.selectedSrcUrl;

      img.onload = () => {
        let element = this.shadowRoot.querySelector('.image');
        element.style.backgroundImage += 'var(--gradient-ag-putah), url(' + img.src + ')';
        element.style.backgroundSize = 'cover';
        element.style.opacity = '1';
      };
    }
  }

  /**
   * @method _setSrc
   * @description Sets the background image src property.
   */
  async _setSrc(){
    // let featuredImages = await this.FcAppConfigModel.getDefaultImagesConfig();
    // this.srcOptions = featuredImages?.body?.featuredImages;

    if( !this.srcOptions || this.srcOptions.length < 1 ) {
      this.selectedSrcUrl = '/images/defaults/annual-winter-sale1952.jpg';
      this.dispatchEvent(this._srcChange);
      return;
    }

    let i = Math.floor(Math.random() *  this.srcOptions.length);
    let src = this.srcOptions[i];
    this.selectedSrcUrl = src.imageUrl;

    let img = new Image();
    img.src = this.selectedSrcUrl;

    img.onload = () => {
      let element = this.shadowRoot.querySelector('.image');
      element.style.backgroundImage += 'var(--gradient-ag-putah), url(' + img.src + ')';
      element.style.opacity = '1';
    };

    
    this.dispatchEvent(this._srcChange);
  }

  /**
   * @method getContainerStyles
   * @description Inline styles for element's base container
   * 
   * @returns {Object}
   */
  getContainerStyles(){
    let styles = {
      'background-image': 'var(--gradient-ag-putah)'
    };
    return styles;
  }

}

customElements.define('dams-hero', DamsHero);
