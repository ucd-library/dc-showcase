import { LitElement } from "lit";

// import AppSearchResult from "./app-search-result";
import render from "./app-search-list-result.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

/**
 * @class AppSearchListResult
 * @description UI component class for displaying a item preview card
 *
 * @prop {String} id - Item id
 * If used, element will query the RecordModel for the item data.
 * @prop {Object} data - Data object containing item information
 * @prop {String} itemUrl - Url to item
 * @prop {String} thumbnailUrl - Thumbnail url
 * @prop {String} title - Title
 * @prop {String} date - Date of digitization
 * @prop {String} collection - Collection item belongs to
 * @prop {String} format - Item format
 */
export class AppSearchListResult extends Mixin(LitElement).with(LitCorkUtils) {
  static get properties() {
    return {
      id: { type: String, attribute: "data-itemid" },
      data: { type: Object },
      itemUrl: { type: String },
      thumbnailUrl: { type: String },
      title: { type: String },
      date: { type: String },
      collection: { type: String },
      format: { type: String },
      creator: { type: String },
    };
  }

  constructor() {
    super();
    this.active = true;
    this.render = render.bind(this);

    this.id = "";
    this.data = {};
    this.itemUrl = "";
    this.thumbnailUrl = "";
    this.title = "";
    this.date = "";
    this.collection = "";
    this.format = "";
    this.creator = "";

    this._injectModel("RecordModel");
  }

  /**
   * @method willUpdate
   * @description Lit lifecycle method called when element is updated.
   * @param {Map} props - Properties that have changed.
   */
  willUpdate(props) {
    if (this.data.id) {
      let collectionName = APP_CONFIG.collectionLabels[this.data.collectionId?.['@id']] || '';
      this.itemUrl = this.data.id;
      this.thumbnailUrl = this.data.thumbnailUrl || '/images/tree-bike-illustration.png';
      this.title = this.data.title;
      this.date = this.data.date;
      this.collection = collectionName;
      this.format = this.data.format;
      this.creator = this.data.creator;
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

    // TODO populate
    // this.date = res.date;
    // this.collection = res.collection;
    // this.format = res.format;
    
  }

  /**
   * @method _getItem
   * @description Fetches item data from RecordModel
   * @param {String} id - Item id to fetch
   */
  async _getItem(id) {
    this._onRecordUpdate(await this.RecordModel.get(id));
  }
}

customElements.define("app-search-list-result", AppSearchListResult);
