import { LitElement } from "lit";

import render from "./dams-collection-card.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import utils from "../../../lib/utils/index.js";

/**
 * @class DamsCollectionCard
 * @description UI component class for displaying a collection preview card
 *
 * @prop {Object} collection - An object describing a DAMS collection.
 * If used, element will set all subsequent properties with data from collections object.
 * @prop {String} imgSrc - The collection thumbnail src.
 * @prop {String} cardTitle - The title of the collection.
 * @prop {Number} itemCt - The total number of items in the collections.
 * @prop {String} href - Link to the collection landing page.
 */
export default class DamsCollectionCard extends Mixin(LitElement).with(
  LitCorkUtils
) {
  static get properties() {
    return {
      collection: { type: Object },
      id: { type: String, attribute: "data-id" },
      imgSrc: { type: String, attribute: "img-src" },
      cardTitle: { type: String, attribute: "card-title" },
      itemCt: { type: Number, attribute: "item-ct" },
      href: { type: String },
      darkBg: { type: Boolean, attribute: "data-dark-bg" },
      loading: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.collection = {};
    this.id = "";
    this.renderedId = "";
    this.imgSrc = "";
    this.cardTitle = "";
    this.itemCt = 0;
    this.href = "";
    this.darkBg = false;
    this.loading = true;

    this._injectModel("CollectionModel", "FcAppConfigModel");
  }

  async updated(props) {    
    if (props.has("id") && this.id && this.id !== this.renderedId ) {
      try {
        this._onCollectionUpdate(await this.CollectionModel.get(this.id));
      } catch(e) {
        this.logger.warn('Collection not found', e);
        this.loading = false;
      }
    } else if( props.has("href") && !this.id ) {
      this.id = this.href;
    }
  }

  async _onCollectionUpdate(e) {
    if( e.state !== "loaded" || e.id !== this.id || this.renderedId === this.id ) return;
    this.loading = false;
    this.renderedId = this.id;

    this.collection = e.vcData;

    let clientEditsId = this.collection.clientEdits?.['@id'];
    let overriddenFeatureImage =  this.collection.clientEdits?.thumbnailUrl?.['@id'];
    if( clientEditsId && overriddenFeatureImage ) {
      this.imgSrc = '/fcrepo/rest' + clientEditsId + '/featuredImage.jpg';
    } else if( this.collection.images ) {
      let images = this.collection.images;
      this.imgSrc = images.medium ? images.medium.url : images.original.url;
    } else {
      this.imgSrc = "/images/tree-bike-illustration.png";
    }
    this.cardTitle = this.collection.title;
    this.itemCt = utils.formatNumberWithCommas(this.collection.count);
    this.href = this.collection.id;
    this.darkBg = this.attributes["data-dark-bg"] ? true : false;
  }
}

customElements.define("dams-collection-card", DamsCollectionCard);
