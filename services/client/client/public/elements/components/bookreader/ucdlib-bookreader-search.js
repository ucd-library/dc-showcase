import { LitElement } from 'lit';
import {render, styles} from "./ucdlib-bookreader-search.tpl.js";

export default class UcdlibBookreaderSearch extends LitElement {

  static get properties() {
    return {
      
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

}

customElements.define('ucdlib-bookreader-search', UcdlibBookreaderSearch);