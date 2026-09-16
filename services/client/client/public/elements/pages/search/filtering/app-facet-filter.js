import { LitElement} from 'lit';

import render from './app-facet-filter.tpl.js';
import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import './app-normal-checkbox.js';

import clone from "clone"

class AppFacetFilter extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      label : { type : String },
      filter : { type : String },
      ignore : { type : Array },
      valueMap : { type : Object },
      buckets : { type : Array },
      bucketsIronList : { type : Array },
      ironListActive : { type : Boolean },
      notified : { type : Object },
      includeTypeahead : { type : Boolean },
      typeaheadField : { type : String },
      noOverflow : { type : Boolean }
    };
  }

  constructor() {
    super();
    this.active = true;
    this.render = render.bind(this);

    this.updateTimer = -1;
    this.label = '';
    this.filter = '';
    this.ignore = [];
    this.valueMap = null;
    this.buckets = [];
    this.bucketsIronList = [];
    this.ironListActive = false;
    this.notified = {};
    this.includeTypeahead = false;
    this.typeaheadField = '';
    this.noOverflow = true;

    this._injectModel('FiltersModel', 'RecordModel');
  }

  resize() {
    requestAnimationFrame(() => {
      let overflowDiv = this.shadowRoot.querySelector('.overflow');

      if( overflowDiv && overflowDiv.offsetHeight >= 190 ) {
        this.noOverflow = false;
      }
    });
  }

  _onFilterBucketsUpdate(e) {
    if( e.filter !== this.filter ) return;
    
    // TODO temp remove oac isPartOf records
    e.buckets = e.buckets.filter(b => !b.key.includes('oac.cdlib.org'));

    e.buckets.forEach(item => {
      if( this.notified[item.key] && !item.active ) {
        this._notifySelected(item.active, item.key, item.doc_count);
      } else if( !this.notified[item.key] && item.active ) {
        this._notifySelected(item.active, item.key, item.doc_count);
      }
      if( APP_CONFIG.collectionLabels[item.key] ) {
        let valueMap = {};
        valueMap[item.key] = APP_CONFIG.collectionLabels[item.key];
        item.valueMap = valueMap;
      }
    });

    this.bucketsIronList = [];
    this.buckets = e.buckets;
    this.ironListActive = false;

    if( this.buckets.length >= 15 ) {
      this.includeTypeahead = true;
    }

    requestAnimationFrame(() => {
      this.dispatchEvent(
        new CustomEvent('update-visibility', {
          detail: {
            show: (e.buckets.length !== 0)
          }
        })
      );  
    });
  }

  getBuckets() {
    return this.ironListActive ? this.bucketsIronList : this.buckets;
  }

  /**
   * @method onParentFilterClicked
   * @description called from parent toggle panel when selected filter
   * is clicked
   * 
   * @param {String} key filter key 
   */
  onParentFilterClicked(key) {
    let searchDoc = this.RecordModel.getCurrentSearchDocument()
    this.RecordModel.setPaging(searchDoc, 0);
    this.RecordModel.removeKeywordFilter(searchDoc, this.filter, key);
    this.RecordModel.setSearchLocation(searchDoc);

    this._notifySelected(false, key);
  };

  /**
   * @method _notifySelected
   * @description notify parent of selected/unselected filter
   * 
   * @param {Boolean} selected is the filter selected
   * @param {String} key filter key/label
   * @param {Number} count filter count of search results
   */
  _notifySelected(selected, key, count) {
    if( !selected && this.notified[key] ) {
      delete this.notified[key];
    } else if( selected ) {
      this.notified[key] = true;
    }

    this.dispatchEvent(
      new CustomEvent(`${selected ? 'add' : 'remove'}-selected`, {
        detail: {
          label: key,
          count
        }
      })
    );
  }

  _toggleFilter(e) {
    if( !e.currentTarget.hasAttribute('checked') ) {
      this.appendFilter(e);
    } else {
      this.removeFilter(e);
    }
  }

  appendFilter(e) {
    let buckets = this.getBuckets();
    let item = buckets[parseInt(e.currentTarget.getAttribute('index'))];
    if( item.empty ) return;

    // reset typeahead incase it was active
    this.shadowRoot.querySelector('#typeahead').value = '';
    if( this.originalBuckets ) {
      this.originalBuckets = null;
    }

    let searchDoc = this.RecordModel.getCurrentSearchDocument();
    this.RecordModel.setPaging(searchDoc, 0);
    this.RecordModel.appendKeywordFilter(searchDoc, this.filter, item.key);
    this.RecordModel.setSearchLocation(searchDoc);

    this._notifySelected(true, item.key, item.doc_count);
  }

  removeFilter(e) {
    let buckets = this.getBuckets();
    let item = buckets[parseInt(e.currentTarget.getAttribute('index'))];

    let searchDoc = this.RecordModel.getCurrentSearchDocument();
    this.RecordModel.setPaging(searchDoc, 0);
    this.RecordModel.removeKeywordFilter(searchDoc, this.filter, item.key);
    this.RecordModel.setSearchLocation(searchDoc);

    this._notifySelected(false, item.key, item.doc_count);
  }

  /**
   * @method _onTypeaheadKeyup
   * @description bound to typeahead text input keyup event
   * 
   * @param {Object} e 
   */
  _onTypeaheadKeyup() {
    this._updateTypeahead();
  }

  _updateTypeahead() {
    let text = this.shadowRoot.querySelector('#typeahead').value;
    if( !text ) {
      if( this.originalBuckets ) {

        if( this.ironListActive ) {
          this.bucketsIronList = this.originalBuckets;
        } else {
          this.buckets = this.originalBuckets;
        }

        this.originalBuckets = null;
      }
      return;
    }

    if( !this.originalBuckets ) {
      this.originalBuckets = [...(this.ironListActive ? this.bucketsIronList : this.buckets)];
    }

    let re = new RegExp('.*'+text.toLowerCase()+'.*', 'i');
    let buckets = this.originalBuckets.filter(item => item.sortKey.match(re) || item.valueMap?.[item.key]?.match(re) ? true : false);

    if( this.ironListActive ) {
      this.bucketsIronList = buckets;
    } else {
      this.buckets = buckets;
    }
  }

}

window.customElements.define('app-facet-filter', AppFacetFilter);