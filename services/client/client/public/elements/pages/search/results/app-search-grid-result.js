import { LitElement } from "lit";

// import AppSearchResult from "./app-search-result"
import render from "./app-search-grid-result.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

/**
 * @class AppSearchGridResult
 * @description UI component class for displaying a item preview card
 *
 * @prop {String} id - Item id
 * If used, element will query the RecordModel for the item data.
 * @prop {Object} data - Data object containing item information
 * @prop {String} itemUrl - Url to item
 * @prop {String} thumbnailUrl - Thumbnail url
 * @prop {String} title - Item title
 */
export class AppSearchGridResult extends Mixin(LitElement).with(LitCorkUtils) {
  static get properties() {
    return {
      id: { type: String, attribute: "data-itemid" },
      data: { type: Object },
      itemUrl: { type: String },
      thumbnailUrl: { type: String },
      title: { type: String },
      bounds: { type: Array },
      size: { type: Object },
      imageHeight: { type: Number },
      mediaTypes: { type: Array }
    };
  }

  constructor() {
    super();
    this.active = true;
    this.render = render.bind(this);

    this.id = "";
    this.data = {};
    this.title = "";
    this.itemUrl = "";
    this.thumbnailUrl = "";
    this.bounds = [];
    this.size = {};
    this.imageHeight = 0;
    this.mediaTypes = [];

    this._injectModel("RecordModel");
  }

  /**
   * @method firstUpdated
   * @description Lit lifecycle method called when element is updated.
   * @param {Map} props - Properties that have changed.
   */
  firstUpdated(props) {
    if (this.data.id) {
      this.title = this.data.title;
      this.itemUrl = this.data.id;
      this.thumbnailUrl = this.data.thumbnailUrl || '/images/tree-bike-illustration.png';
      this.size = this.data.size;

      if (this.thumbnailUrl) this._renderImage();
      if (this.data.mediaTypes?.includes("Image")) {
        this.mediaTypes.push("image");
      } 
      if (this.data.mediaTypes?.includes("Video")) {
        this.mediaTypes.push("video");
      } 
      if (this.data.mediaTypes?.includes("Audio")) {
        this.mediaTypes.push("audio");
      }
      if( this.data.multiImage ) {
        this.mediaTypes.push("imageList");
      }
    } else {
      this._getItem(this.id);
    }
  }

  async _onRecordUpdate(e) {
    if (e.state !== "loaded" || e.id !== this.id) return;

    this.record = e.vcData;
    if( this.record.images ) {
      let images = this.record.images;
      this.thumbnailUrl = images.medium ? images.medium.url : images.original.url;
    }
    this.title = this.record.name;
    this.itemUrl = this.record['@id'];
    this.id = this.record['@id'];
    this._renderImage();
  }

  /**
   * @method _loadImage
   * @description preload image and set bounds to image dimensions
   *
   * @param {String} url url of image to load
   *
   * @returns {Promise} resolves when image is loaded and bounds array has been set
   */
  _loadImage(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();

      img.onload = () => {
        let res = [img.naturalHeight, img.naturalWidth];
        this.bounds = [[0, 0], res];
        resolve();
      };

      img.src = url;
    });
  }

  /**
   * @method _getItem
   * @description Fetches item data from RecordModel
   * @param {String} id - Item id to fetch
   */
  async _getItem(id) {
    this._onRecordUpdate(await this.RecordModel.get(id));
  }

  async _renderImage() {
    if( !this.size.width || !this.size.height ) {
      await this._loadImage(this.thumbnailUrl);
    }

    this._calcImageHeight();
    this.dispatchEvent(new CustomEvent("rendered", { detail: this }));

    requestAnimationFrame(() => {
      let img = this.shadowRoot.querySelector("#img");
      if (img.complete) {
        img.style.display = "block";
      } else {
        img.onload = () => {
          img.style.display = "block";
        };
      }
    });
  }

  _calcImageHeight() {
    let img = this.shadowRoot.querySelector("#img");
    let width = 100;
    if( img ) {
      img.style.display = "block";
      width = img.width;
      img.style.display = "none";  
    }

    let imageHeight = this.size.height || this.bounds?.[1]?.[0] || 100;
    let imageWidth = this.size.width || this.bounds?.[1]?.[1] || 100;
    let ratio = imageHeight / imageWidth;
    let height = width * ratio;
    this.imageHeight = height;
  }
}

customElements.define("app-search-grid-result", AppSearchGridResult);
