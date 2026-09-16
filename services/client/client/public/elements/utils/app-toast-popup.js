import { LitElement } from 'lit';

import render from "./app-toast-popup.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

export default class AppToastPopup extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      visible : { type : Boolean }
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.active = true;

    this.visible = false;
  }

  /**
   * @method showPopup
   * @description show the popup for 5 seconds
   * 
   */
  showPopup() {
    this.visible = true;
    setTimeout(() => {
      this.visible = false;
    }, 5000);
  }
}

customElements.define('app-toast-popup', AppToastPopup);