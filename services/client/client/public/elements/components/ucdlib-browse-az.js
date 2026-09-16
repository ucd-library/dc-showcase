import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-browse-az.tpl.js";

// sets globals Mixin and EventInterface
import {Mixin, LitCorkUtils} from "@ucd-lib/cork-app-utils";

export default class UcdlibBrowseAZ extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
        selectedLetter : { type : String, attribute : 'selected-letter' },
        results : { type : Array },
        alpha : { type : Array },
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this._injectModel('AppStateModel');
    this.render = render.bind(this);
    this.reset();
  }

  reset() {
    this.alpha = [
        {display: '#', value: '1', exists: true},
        {display: 'A', value: 'a', exists: true},
        {display: 'B', value: 'b', exists: true},
        {display: 'C', value: 'c', exists: true},
        {display: 'D', value: 'd', exists: true},
        {display: 'E', value: 'e', exists: true},
        {display: 'F', value: 'f', exists: true},
        {display: 'G', value: 'g', exists: true},
        {display: 'H', value: 'h', exists: true},
        {display: 'I', value: 'i', exists: true},
        {display: 'J', value: 'j', exists: true},
        {display: 'K', value: 'k', exists: true},
        {display: 'L', value: 'l', exists: true},
        {display: 'M', value: 'm', exists: true},
        {display: 'N', value: 'n', exists: true},
        {display: 'O', value: 'o', exists: true},
        {display: 'P', value: 'p', exists: true},
        {display: 'Q', value: 'q', exists: true},
        {display: 'R', value: 'r', exists: true},
        {display: 'S', value: 's', exists: true},
        {display: 'T', value: 't', exists: true},
        {display: 'U', value: 'u', exists: true},
        {display: 'V', value: 'v', exists: true},
        {display: 'W', value: 'w', exists: true},
        {display: 'X', value: 'x', exists: true},
        {display: 'Y', value: 'y', exists: true},
        {display: 'Z', value: 'z', exists: true}
    ];

    this.selectedLetter = '';
    this.results = [];
  }

  async firstUpdated() {
    await this._onAppStateUpdate(await this.AppStateModel.get());
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('results')) {
      this._updateSelectableLetters();
    }
  }

  async _onAppStateUpdate(e) {
    if( e.location.page !== 'browse' || e.location.path.length < 2 ) {
      this.reset();
      return;
    }
  }

  _updateSelectableLetters() {
    if (!this.results || this.results.length === 0) {
      // If there are no results, disable all letters
      this.alpha.forEach(letter => letter.exists = false);
      this.requestUpdate();
      return;
    }

    this.alpha.forEach(letter => {
      if (letter.value === '1') {
        // match numbers and special characters for the '#' element
        letter.exists = this.results.some(result => {
          const firstChar = result.key?.trim()?.[0]?.toLowerCase() || result.title?.trim()?.[0]?.toLowerCase();
          return firstChar && !/[a-z]/.test(firstChar);
        });
      } else {
        // match alphabetic characters for other letters
        letter.exists = this.results.some(result => {
          return (result.key?.toLowerCase()?.trim()?.startsWith(letter.value) || result.title?.toLowerCase()?.trim()?.startsWith(letter.value)) 
          && result.count > 0;
        });
      }
    });
  }

  onAlphaInput(v) {
    if( !v || !v.exists ) return;

    // emit event to parent
    this.dispatchEvent(new CustomEvent('letter-change', {
      detail: { letter : v.value },
      bubbles: true,
      composed: true
    }));

    if( v.value === this.selectedLetter ) this.selectedLetter = '';
    else this.selectedLetter = v.value;
  }

}

customElements.define('ucdlib-browse-az', UcdlibBrowseAZ);
