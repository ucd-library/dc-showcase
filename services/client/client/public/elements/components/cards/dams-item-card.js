import { LitElement } from "lit";

import render from "./dams-item-card.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import "@ucd-lib/theme-elements/ucdlib/ucdlib-icon/ucdlib-icon";

/**
 * @class DamsItemCard
 * @description UI component class for displaying a item preview card
 *
 * @prop {String} id - Item id
 * If used, element will query the RecordModel for the item data.
 * @prop {Object} data - Data object containing item information
 * @prop {String} itemUrl - Url to item
 * @prop {String} thumbnailUrl - Thumbnail url
 * @prop {String} truncatedTitle - Titles over 38 characters will be truncated to fit a single line
 */
export default class DamsItemCard extends Mixin(LitElement).with(LitCorkUtils) {
  static get properties() {
    return {
      id: { type: String, attribute: "data-itemid" },
      // record: { type: Object },
      data: { type: Object },
      itemUrl: { type: String },
      thumbnailUrl: { type: String },
      truncatedTitle: { type: String },
      mediaTypes: { type: Array },
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.id = "";
    // this.record = {};
    this.data = {};
    this.truncatedTitle = "";
    this.itemUrl = "";
    this.thumbnailUrl = "";
    this.mediaTypes = [];

    this._injectModel("RecordModel");
  }

  /**
   * @method willUpdate
   * @description Lit lifecycle method called when element is updated.
   * @param {Map} props - Properties that have changed.
   */
  willUpdate(props) {
    if (this.data.id) {
      this.itemUrl = this.data.id;
      this.thumbnailUrl = this.data.thumbnailUrl || '/images/tree-bike-illustration.png';

      this.mediaTypes = this.data.mediaTypes;
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

    this._truncateTitle();
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
    this.mediaType = this.record.mediaType;

    this._truncateTitle();
  }

  /**
   * @method _getItem
   * @description Fetches item data from RecordModel
   * @param {String} id - Item id to fetch
   */
  async _getItem(id) {
    this._onRecordUpdate(await this.RecordModel.get(id));
  }

  /**
   * @method _truncateTitle
   * @description Truncates titles over 38 characters to fit a single line
   */
  _truncateTitle() {
    if (this.data && this.data.title && this.data.title.length > 38) {
      this.truncatedTitle = this.data.title.substring(0, 34) + "...";
    } else if (this.data && this.data.title) {
      this.truncatedTitle = this.data.title;
    } else if ( this.title && this.title.length > 38 ) {
      this.truncatedTitle = this.title.substring(0, 34) + "...";
    } else if ( this.title ) {
      this.truncatedTitle = this.title;
    } else {
      this.truncatedTitle = "";
    }
  }
}

customElements.define("dams-item-card", DamsItemCard);
