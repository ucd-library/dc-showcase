import { LitElement} from 'lit';

import render from "./app-normal-checkbox.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

export class AppNormalCheckbox extends Mixin(LitElement)
    .with(LitCorkUtils) {
  
  static get properties() {
    return {
      value : { type : String },
      label : { type : String },
      labelMap : { type : Object },
      labelMapType : { type : String },
      realLabel: { type: String },
      checked : { type : Boolean },
      disabled : { type : Boolean },
      ariaChecked : { type : String },
      ariaDisabled : { type : String },
      role : { type : String },
      tabindex : { type : Number }
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.active = true;

    this.value = '';
    this.label = '';
    this.labelMap = null;
    this.labelMapType = null;
    this.realLabel = '';
    this.checked = false;
    this.disabled = false;
    this.ariaChecked = '';
    this.ariaDisabled = '';
    this.role = 'checkbox';
    this.tabindex = 0;

    this.addEventListener('click', e => this._onClick(e));
    this.addEventListener('keyup', e => {
      if( e.which !== 13 ) return;
      this._onClick(e)
    });
  }

  willUpdate() {
    this.checked = this.hasAttribute('checked');
  }

  /**
   * @method _realLabel
   * @description render label
   * 
   * @param {String} value 
   * @param {String} label 
   */
  _realLabel(value, label) {
    return this._getLabel();
  }

  /**
   * @method _computeAriaChecked
   * @description Bound to 'checked' property.  set aria-checked value
   */
  _computeAriaChecked() {
    return this.checked ? 'true' : 'false';
  }

  /**
   * @method _computeAriaDisabled
   * @description Bound to 'disabled' property.  set aria-disabled value
   */
  _computeAriaDisabled() {
    return this.disabled ? 'true' : 'false';
  }

  /**
   * @method _computeTabIndex
   * @description Bound to 'disabled' property.  set tabindex value
   */
  _computeTabIndex() {
    return this.disabled ? -1 : 0;
  }

  /**
   * @method _getLabel
   * @description return label for a value
   */
  _getLabel() {
    if( this.labelMapType === null ) this._onLabelMapUpdate();
    if( !this.labelMapType ) return this.value;
    
    if( this.labelMapType === 'object' && typeof this.labelMap === 'object' && this.labelMap[this.value] ) {
      return this.labelMap[this.value];
    } else if( this.labelMapType === 'function' ) {
      return this.labelMap(this.value);
    }

    return this.value;
  }

  /**
   * @method _onLabelMapUpdate
   * @description bound to 'labelMap' property observer.  set the 
   * labelMapType property
   */
  _onLabelMapUpdate() {
    this.labelMapType = '';
    if( !this.labelMap ) return;
    this.labelMapType = typeof this.labelMap;
  }

  /**
   * @method _onClick
   * @description called when div wrapper is clicked
   * 
   * TODO: add aria checkbox role
   */
  _onClick() {
    if( this.disabled ) return;
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('change', {bubbles: true, composed: true}));
  }

}

window.customElements.define('app-normal-checkbox', AppNormalCheckbox);