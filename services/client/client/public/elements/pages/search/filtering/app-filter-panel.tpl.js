import { html } from 'lit';
import { sharedStyles } from '../../../styles/shared-styles';

export default function render() { 
  return html`

  <style>
    ${sharedStyles}
    :host {
      display: block;
    }

    .active-filter:hover #close ucdlib-icon {
      fill: var(--color-aggie-gold-80);
      border-radius: 50%;
      background-color: var(--color-aggie-blue-90);
      transition: background-color 0.3s ease-in-out;
      transition: fill 0.3s ease-in-out;
    }

    [hidden] { display: none !important; }

    .label {
      cursor: pointer;
      display: flex;
      color: var(--default-primary-color);
      padding: 10px 0;
      font-weight: bold;
      position: relative;
      outline: none !important;
    }

    .highlight {
      position: absolute;
      left: -10px;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color:  var(--default-secondary-color);
      display: none;
    }

    .label:focus > .highlight {
      display: block;
    }

    .filter {
      display: flex;
      cursor: pointer;
      align-items: center;
      font-weight: bold;
      /* font-style: italic; */
    }

    iron-icon[closed] {
      transform: rotate(-90deg);
    }

    iron-icon[clear] {
      color: var(--color-aggie-blue-80);
      margin-right: 2px;
    }

    ucdlib-icon {
      fill: var(--color-aggie-blue-80);
      width: 18px;
      height: 18px;
    }

    .active-filter {
      color: var(--color-aggie-blue);
    }

    #close {
      width: 50px;
      height: 50px;
      display: inline-flex;
      align-items: center;
      margin-right: 0.5rem;
    }

    #close ucdlib-icon {
      padding: 3px;
      min-width: 1.2rem;
      min-height: 1.2rem;
    }

    .value {
      display: flex;
      align-items: center;
      line-height: normal;
    }

    .count {
      color: var(--text-disabled);
      flex: 1;
      text-align: right;
      min-width: 40px;
      padding: 0 10px;
      font-weight: 400;
    }

    .active-filter {
      flex: 2;
    }

    /* JM - think this is redundant, scroll inforced by app-*-filter element */
    /* #filters {
      overflow-y: auto;
      max-height: 200px;
    } */
  </style>

  <div class="label" @click="${this._onToggleClicked}" @keyup="${this._onToggleClicked}" role="button" tabindex="0">
    <div style="flex: 1; font-size: 1.15rem">${this.filter.label}</div>
    
    <!-- <iron-icon icon="arrow-drop-down" ?closed="${!this.opened}"></iron-icon> -->
    <div style="padding-right: 1rem; padding-top: .5rem;">
      <ucdlib-icon icon="ucdlib-dams:fa-caret-right" ?hidden=${this.opened}></ucdlib-icon>
      <ucdlib-icon icon="ucdlib-dams:fa-caret-down" ?hidden=${!this.opened}></ucdlib-icon>
    </div>
    
    <div class="highlight"></div>
  </div>

  <div id="filters"></div>
  <!-- <div id="filters" ?hidden="${!this.opened}"></div> -->
  

`;}