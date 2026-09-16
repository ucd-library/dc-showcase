import { LitElement } from "lit";

import render from "./dams-highlighted-collection.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import utils from "../../../lib/utils/index.js";

/**
 * @class DamsHighlightedCollection
 * @description Homepage UI component class for displaying a page section higlighting a collection.
 *
 * @prop {Object} collection - A featured collection from the FcAppConfigModel.
 * @prop {Boolean} imageRight - Should the image be on the right or left?
 */
export default class DamsHighlightedCollection extends Mixin(LitElement).with(
  LitCorkUtils
) {
  static get properties() {
    return {
      collection: { type: Object },
      collectionId: { type: String, attribute: "collection-id" },
      imageRight: { type: Boolean, attribute: "image-right" },
      collectionTitle: { type: String, attribute: "collection-title" },
      imgSrc: { type: String, attribute: "img-src" },
      collectionDesc: { type: String, attribute: "collection-desc" },
      itemCt: { type: Number, attribute: "item-ct" },
      href: { type: String },
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.collection = {};
    this.collectionId = "";
    this.renderedCollectionid = "";
    this.imageRight = false;
    this.collectionTitle = "";
    this.imgSrc = "";
    this.collectionDesc = "";
    this.itemCt = 0;
    this.href = "";

    this._injectModel("CollectionModel");
  }

  /**
   * @method willUpdate
   * @description Lit lifecycle method called when element is updated.
   * @param {Map} props - Properties that have changed.
   */
  willUpdate(props) {
    if (Object.keys(this.collection).length) {
      if (this.collection.label) {
        this._collectionTitle = this.collection.label;
      } else if (this.collection.associatedMedia.name) {
        this._collectionTitle = this.collection.associatedMedia.name;
      }
      if (this.collection.description) {
        this._collectionDesc = this.collection.description;
      } else if (this.collection.associatedMedia.description) {
        this._collectionDesc = this.collection.associatedMedia.description;
      }
      this._imgSrc = this.collection.thumbnailUrl
        ? this.collection.thumbnailUrl
        : this.collection.associatedMedia.thumbnailUrl;
      this._itemCt = this.collection.associatedMedia.recordCount;
      this._href = this.collection.associatedMedia["@id"];
    } else if (this.collectionId && this.collectionId !== this.renderedCollectionid) {
      this.renderedCollectionid = this.collectionId;
      this._getCollection(this.collectionId);
    }
  }

  async _getCollection(id) {
    let res = await this.CollectionModel.get(id);

    let clientEditsId = res.vcData.clientEdits?.['@id'];
    let overriddenFeatureImage =  res.vcData.clientEdits?.thumbnailUrl?.['@id'];
    if( clientEditsId && overriddenFeatureImage ) {
      this.imgSrc = '/fcrepo/rest' + clientEditsId + '/featuredImage.jpg';
    } else if( res.vcData.images ) {
      let images = res.vcData.images;
      this.imgSrc = images.medium ? images.medium.url : images.original.url;
    } else {
      this.imgSrc = "/images/tree-bike-illustration.png";
    }
    this.collectionTitle = res.vcData.title;
    this.itemCt = utils.formatNumberWithCommas(res.vcData.count);
    this.href = res.id;
  }
}

customElements.define("dams-highlighted-collection", DamsHighlightedCollection);
