import { LitElement } from 'lit';

import render from './saving-overlay.tpl.js';

/**
 * @class SavingOverlay
 * @description Full screen spinner shown while admin edits save.
 * Blocks clicks until the save finishes.
 *
 * @property {Boolean} active show the spinner
 */
export class SavingOverlay extends LitElement {

  static get properties() {
    return {
      active : { type : Boolean, reflect : true }
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.active = false;
  }
}

customElements.define('app-saving-overlay', SavingOverlay);
