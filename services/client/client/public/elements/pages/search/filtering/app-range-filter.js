import { LitElement } from "lit";
import render from "./app-range-filter.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import "../../../utils/app-range-slider";

export default class AppRangeFilter extends Mixin(LitElement).with(
  LitCorkUtils
) {
  static get properties() {
    return {
      label: { type: String },
      filter: { type: String },
      absMinValue: { type: Number },
      absMaxValue: { type: Number },
      minValue: { type: Number },
      maxValue: { type: Number },
      showUnknown: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.active = true;

    this.label = "";
    this.filter = "";
    this.absMinValue = -1;
    this.absMaxValue = -1;
    this.minValue = -1;
    this.maxValue = Number.MAX_VALUE;
    this.showUnknown = false;

    this._injectModel("AppStateModel", "RecordModel", "CollectionModel", "FiltersModel");
  }

  async firstUpdated() {
    if( this.AppStateModel.location.page !== 'search' ) return;

    let searchDoc = this.RecordModel.getCurrentSearchDocument();
    if( searchDoc ) {
      this._onRecordSearchUpdate(await this.RecordModel.search(searchDoc));
    }

    this.resize();
  }

  resize() {
    this.shadowRoot.querySelector("#slider")._onResize();

    setTimeout(() => {
      this.shadowRoot.querySelector("#slider")._onResize();
    }, 100);
  }

  /**
   * @method _isDefaultState
   * @description is range filter in the default state?  ie abs min/max
   * is the same as min/max and unknown values are included?  If so
   * we don't actually need a filter on.
   */
  _isDefaultState() {
    if (!this._isFilterApplied()) {
      let searchDoc = this.RecordModel.getCurrentSearchDocument();
      this.RecordModel.removeRangeFilter(searchDoc, this.filter);
      this.RecordModel.setSearchLocation(searchDoc);

      return true;
    }
    return false;
  }

  /**
   * @method _onRangeSliderChange
   * @description bound to custom 'range-value-change' event from app-range-slider
   */
  _onRangeSliderChange(e) {
    this.minValue = e.detail.min;
    this.maxValue = e.detail.max;

    this.shadowRoot.querySelector("#minValueInput").value = this.minValue;
    this.shadowRoot.querySelector("#maxValueInput").value = this.maxValue;

    this._onRangeNullChange();
  }

  /**
   * @method _onRangeNullChange
   * @description bound to input checkbox.  Currently called by internal
   * functions as well to search after value change :/
   */
  _onRangeNullChange() {
    let value = {
      gte: this.minValue,
      lte: this.maxValue,
    };

    if (this.shadowRoot.querySelector("#unknown").checked) {
      value.includeNull = true;
    }

    // remove filter and return
    if (this._isDefaultState()) return;

    let searchDoc = this.RecordModel.getCurrentSearchDocument();
    this.RecordModel.setPaging(searchDoc, 0);
    this.RecordModel.appendRangeFilter(searchDoc, this.filter, value);
    this.RecordModel.setSearchLocation(searchDoc);
  }

  /**
   * @method _onInputChange
   * @description bound to min/max number inputs.
   */
  _onInputChange() {
    let min = this.shadowRoot.querySelector("#minValueInput").value;
    let max = this.shadowRoot.querySelector("#maxValueInput").value;

    if (min < this.absMinValue) {
      this.shadowRoot.querySelector("#minValueInput").value = this.absMinValue;
      min = this.absMinValue;
    }
    if (max > this.absMaxValue) {
      this.shadowRoot.querySelector("#maxValueInput").value = this.absMaxValue;
      max = this.absMaxValue;
    }
    if (min > max) min = max;

    this.minValue = min;
    this.maxValue = max;

    this._onRangeNullChange();
  }

  /**
   * @method _onFilterBucketsUpdate
   * @description from FilterService
   * 
   * @param {Object} e
   */
  _onFilterBucketsUpdate(e) {
    if( e.filter !== '@graph.isPartOf.@id' ) return;

    if( e.buckets.length === 1 ) {
      this.selectedCollection = e.buckets[0].key;
    } else {
      this.selectedCollection = '';
    }
    this._renderFilters();
  }

  /**
   * @method _onRecordSearchUpdate
   * @description from RecordInterface
   *
   * @param {Object} e
   */
  _onRecordSearchUpdate(e) {
    if (e.state !== "loaded") return;

    this.currentFilters = e.searchDocument.filters || {};
    this._renderFilters();
  }

  /**
   * @method _renderFilters
   * @description called after a collection is selected or a filter set updates.
   * make sure range filter is set correctly.
   *
   */
  async _renderFilters() {
    if (!this.currentFilters) return;

    // grab default aggregations for collection
    let result;
    if( this.selectedCollection ) {
      let facets = this.FiltersModel.getFacets();
      result = await this.RecordModel.defaultSearch(this.selectedCollection, null, null, facets);        
    } else {
      result = await this.RecordModel.defaultSearch('');
    }
    this.default = result;

    let rangeFilter = this.default?.payload?.aggregations?.ranges?.[this.filter];
    if (rangeFilter) {
      this.absMinValue = rangeFilter.min;
      this.absMaxValue = rangeFilter.max;
    } else {
      return this._show(false);
    }

    this._show(true);

    // make sure any current values are set correctly
    if (this.minValue < this.absMinValue || !this.currentFilters[this.filter]) {
      this.minValue = this.absMinValue;
      this.shadowRoot.querySelector("#minValueInput").value = this.minValue;
    }
    if (this.maxValue > this.absMaxValue || !this.currentFilters[this.filter]) {
      this.maxValue = this.absMaxValue;
      this.shadowRoot.querySelector("#maxValueInput").value = this.maxValue;
    }

    // now set the current filters from search
    if (this.currentFilters[this.filter]) {
      let value = this.currentFilters[this.filter].value;

      this.minValue = value.gte;
      this.maxValue = value.lte;
      this.shadowRoot.querySelector("#minValueInput").value = this.minValue;
      this.shadowRoot.querySelector("#maxValueInput").value = this.maxValue;
      this.shadowRoot.querySelector("#unknown").checked = value.includeNull
        ? true
        : false;
    }

    // to trigger slider rerender when filters are removed
    let rangeSlider = this.shadowRoot.querySelector("app-range-slider");
    if (rangeSlider) {
      rangeSlider.hasRendered = false;
    }

    this._notifySelected();
  }

  /**
   * @method _isFilterApplied
   * @description is there currenlty a filter set
   *
   * @return {Boolean}
   */
  _isFilterApplied() {
    if (
      this.minValue === this.absMinValue &&
      this.maxValue === this.absMaxValue &&
      this.shadowRoot.querySelector("#unknown").checked === true
    ) {
      return false;
    }
    return true;
  }

  /**
   * @method _notifySelected
   * @description notify parent of selected/unselected filter
   */
  _notifySelected() {
    let selected = false;
    let key = "";

    if (
      this.minValue !== this.absMinValue ||
      this.maxValue !== this.absMaxValue ||
      !this.shadowRoot.querySelector("#unknown").checked
    ) {
      selected = true;
    }

    if (selected) {
      key = this.minValue + " to " + this.maxValue;
    }

    this.dispatchEvent(
      new CustomEvent(`set-selected`, {
        detail: {
          selected,
          label: key,
        },
      })
    );
  }

  /**
   * @method _show
   * @description notify parent to hide/show filter
   *
   * @param {Boolean} show should the parent hide or show filter
   */
  _show(show) {
    requestAnimationFrame(() => {
      this.dispatchEvent(
        new CustomEvent("update-visibility", {
          detail: { show },
        })
      );  
    });
  }

  /**
   * @method reset
   * @description reset range filter
   */
  reset() {
    this.minValue = this.absMinValue;
    this.maxValue = this.absMaxValue;
    this.shadowRoot.querySelector("#unknown").checked = true;

    this._onRangeNullChange();
  }

  /**
   * @method onParentFilterClicked
   * @description called from parent toggle panel when selected filter
   * is clicked.  Reset slider
   */
  onParentFilterClicked() {
    this.reset();
  }
}

customElements.define("app-range-filter", AppRangeFilter);