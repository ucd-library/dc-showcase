import { LitElement} from 'lit';

import render from './modal-overlay.tpl.js';

import "@ucd-lib/theme-elements/ucdlib/ucdlib-icon/ucdlib-icon";
import '../utils/app-icons.js';

/**
 * @class ModalOverlay
 * @description modal overlay component
 */
export class ModalOverlay extends LitElement {

  static get properties() {
    return {
      title : { type : String },
      content : { type : String },
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.title = '';
    this.content = '';

    window.addEventListener('keydown', (e) => {
      if( !this.visible ) return;

      if( e.key === 'Escape' || e.key === 'Esc') {
        e.stopPropagation();
        this._onOk();
      }
    });
  }

  /**
   * @method _onOk
   * @description dismiss modal
   *
   */
  _onOk(e) {
    this.dispatchEvent(
      new CustomEvent('ok', {})
    );
  }
}

customElements.define('app-modal-overlay', ModalOverlay);
