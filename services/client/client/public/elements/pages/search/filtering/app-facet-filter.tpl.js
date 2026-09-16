import { html } from 'lit';
import { sharedStyles } from '../../../styles/shared-styles';

import utils from '../../../../lib/utils';

export default function render() { 
  return html`

<style>
  ${sharedStyles}
  :host {
    display: block;
  }

  [hidden] { display: none !important; }

  .filter {
    padding: 4px 0;
    display: flex;
    align-items: center;
  }
  .filter a {
    display: inline-block;
    cursor: pointer;
    color: black;
    transition: color 250ms ease-out, transform 250ms ease-out;
    transform: scale(1);
  }
  .filter a span {
    color: var(--default-primary-color);
  }
  .filter a:hover {
    transform: scale(1.5);
    color: var(--default-primary-color);
  }

  .typehead-panel {
    margin-right: 12px;
    margin-bottom: 1rem;
    position: relative;
  }
  #typeahead {
    width: 100%;
    box-sizing: border-box;
    padding: 0 5px;
    background: var(--color-aggie-blue-30);
    border: none;
    height: 55px;
    padding-left: 1rem;
    outline: none;
    font-size: 1rem;
  }

  .active-filter {
    cursor: pointer;
    display: flex;
    align-items: center;
    color: white;
    font-size: 14px;
    background: var(--primary-text-color);
    padding: 5px;
    border-radius: 3px;
    margin: 3px;
  }

  .active-filter:hover {
    color: var(--default-primary-color);
    background: #ccc;
  }

  .count {
    color: var(--text-disabled);
    flex: 1;
    text-align: right;
    min-width : 1.5rem;
    padding: 0 0 0 10px;
    box-sizing: border-box;
    min-width: fit-content;
  }
  .count.has-count {
    color: black;
  }

  .overflow {
    overflow-y: auto;
    overflow-x: hidden;    
    max-height: 200px;
    padding-right: 12px;
  }

  iron-list {
    height: 200px;
    display: none;
  }

  app-normal-checkbox {
    overflow: hidden;
    padding-right: 5px;
  }

  paper-checkbox[active] .key {
    color: var(--default-primary-color);
    font-weight: bold;
  }

  paper-checkbox[disabled] .key {
    color: var(--secondary-text-color);
    font-style: italic;
  }

  .overflow {
    overflow-y: scroll;
  }

  .overflow::-webkit-scrollbar {
    width: 10px;
  }
  .overflow::-webkit-scrollbar-track {
    background: var(--color-aggie-blue-60);
    border-left: 4px solid var(--color-aggie-blue-40);
    border-right: 4px solid var(--color-aggie-blue-40);
  }
  .overflow[no-overflow]::-webkit-scrollbar-track {
    background: transparent;
    border: none;
  }
  .overflow[no-overflow] {
    scrollbar-color: transparent transparent;
  }
  .overflow::-webkit-scrollbar-thumb {
    border-radius: 6px;
    background: var(--color-aggie-blue-80);
  }

  /* basic support for FF. Chrome/Safari should support -webkit styles above */
  @supports(scrollbar-color: red blue) {
    * {
      scrollbar-color: var(--color-aggie-blue-80) var(--color-aggie-blue-40);
      scrollbar-width: thin;
    }
  }

  ucdlib-icon.typeahead-search-icon {
    position: absolute;
    right: 1rem;
    top: 17px;
    fill: var(--color-aggie-blue-50);
    width: 22px;
    height: 22px;
    max-width: 22px;
    max-height: 22px;
    min-width: 22px;
  }

  #typeahead::placeholder {
    color: var(--color-aggie-blue-80);
  }
</style>

<!-- typeahead search -->
<div class="typehead-panel" ?hidden="${!this.includeTypeahead}">
  <input id="typeahead" 
    type="text" 
    placeholder="Search ${this.label}s" 
    @keyup="${this._onTypeaheadKeyup}" />
    <ucdlib-icon class="typeahead-search-icon" icon="ucdlib-dams:fa-magnifying-glass"></ucdlib-icon>
</div>

<div class="overflow" ?no-overflow="${this.noOverflow}">
  <div>  
    ${this.buckets.map((item, index) => html`
    <div class="filter">

      <app-normal-checkbox
        type="${item.label}"
        index="${index}"
        value="${item.key}"
        .labelMap="${item.valueMap}"
        ?checked="${item.active}" 
        @change="${this._toggleFilter}"
        ?disabled="${item.disabled}">
      </app-normal-checkbox>

      <div class="count ${item.doc_count > 0 ? 'has-count' : ''}">${utils.formatNumberWithCommas(item.doc_count)}</div>
    </div>
    `)}
  </div>
</div>

`;}