import { LitElement } from "lit";
import "@polymer/iron-pages/iron-pages";
import "./app-filter-panel";

import render from "./app-filters-panel.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

// init facet filters from template
import config from "../../../../lib/config";
const facetFilters = [];
for (var key in config.elasticSearch.facets) {
  let c = config.elasticSearch.facets[key];
  facetFilters.push({
    label: c.label,
    type: c.type,
    ignore: c.ignore,
    valueMap: c.valueMap,
    isDollar: c.isDollar,
    includeTypeahead: c.typeahead ? true : false,
    typeaheadField: c.typeahead,
    filter: key,
  });
}

class AppFiltersPanel extends Mixin(LitElement).with(LitCorkUtils) {
  static get properties() {
    return {
      facetFilters: { type: Array },
      selectedCollection: { type: Object },
      collectionMode: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.active = true;
    this._injectModel("AppStateModel");

    this.facetFilters = facetFilters;
    this.selectedCollection = {};
    this.collectionMode = false;
  }

  /**
   * @method _fireToggleDrawer
   * @description called from toggle button, dispatches event for app-search to handle hiding drawer;
   */
  _fireToggleDrawer() {
    this.dispatchEvent(new CustomEvent("toggle-drawer", {
      bubbles: true,
      composed: true,
      detail: 'toggle-drawer'
    }));
  }

  /**
   * @method _removeCollectionFilter
   * @description fired from hard coded collection filter checkbox.  Remove
   * collection filter when clicked
   */
  _removeCollectionFilter() {
    let searchDoc = this._getCurrentSearchDocument();
    this.RecordModel.removeKeywordFilter(searchDoc, "isPartOf.@id");
    this.RecordModel.setPaging(searchDoc, 0);
    this.RecordModel.setSearchLocation(searchDoc);
  }

  _collapseFilters(e) {
    this.dispatchEvent(new CustomEvent("collapse-filters", {
      bubbles: true,
      composed: true,
      detail: 'collapse-filters'
    }));
  }
}

customElements.define("app-filters-panel", AppFiltersPanel);