import { html } from 'lit';
import { sharedStyles } from '../../../styles/shared-styles';

export default function render() { 
  return html`

<style>
  ${sharedStyles}

  :host {
    display: block;
    cursor: pointer;
  }

  :host(:focus) {
    outline: var(--default-outline);
  }

  :host(:hover) #close ucdlib-icon {
      fill: var(--color-aggie-gold-80);
      border-radius: 50%;
      background-color: var(--color-aggie-blue-90);
      transition: background-color 0.3s ease-in-out;
      transition: fill 0.3s ease-in-out;
    }

  :host([disabled]) {
    cursor: default;
    outline: none !important;
  }

  [hidden] { display: none !important; }

  iron-icon {
    display: none;
    color: var(--color-aggie-blue-80);
    min-width: 24px;
    margin-right: 2px;
  }

  div {
    user-select: none;
    display: flex;
    min-height: 24px;
    align-items: top;
  }

  span {
    /* padding-top: 3px; */
    line-height: normal;
  }

  div[checked] iron-icon {
    display: inline-block;
  }

  div[checked] .value {
    font-weight: bold;
    display: flex;
    align-items: center;
    color: var(--color-aggie-blue);
  }

  div[disabled] #close,
  div #close {
    display: none;
  }

  div[disabled] .value {
    color: var(--gray-text);
  }
  div[checked] #close {
    max-width: 35px;
    height: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  ucdlib-icon {
    fill: var(--color-aggie-blue-80);
    width: 1rem;
    height: 1rem;
  }

  #close ucdlib-icon {
    padding: 3px;
    min-width: 1.2rem;
    min-height: 1.2rem;
    margin-right: 0.2rem;
  }

</style>

<div ?checked="${this.checked}" ?disabled="${this.disabled}">

  <div id="close">
    <ucdlib-icon icon="ucdlib-dams:fa-times" @click="${this._onClick}"></ucdlib-icon>
  </div>   

  <span class="value">${this._realLabel()}</span>
</div>
`;}