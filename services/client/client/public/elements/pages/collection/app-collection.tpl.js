import { html, unsafeCSS } from 'lit';

import '@ucd-lib/theme-elements/ucdlib/ucdlib-md/ucdlib-md.js';

import utils from '../../../lib/utils/index.js';

import { sharedStyles } from "../../styles/shared-styles";
import SharedHtml from '../../utils/shared-html';
import linksCss from "@ucd-lib/theme-sass/1_base_html/_links.css";
import buttonsCss from "@ucd-lib/theme-sass/2_base_class/_buttons.css";
import headingsCss from "@ucd-lib/theme-sass/2_base_class/_headings.css";
import formsHtmlCss from "@ucd-lib/theme-sass/1_base_html/_forms.css";
import formsCss from "@ucd-lib/theme-sass/2_base_class/_forms.css";

export default function render() { 
  return html`
  <style>
    ${sharedStyles}
    ${linksCss}
    ${buttonsCss}
    ${headingsCss}
    ${formsHtmlCss}
    ${formsCss}

    :host {
      display: block;
      position: relative;
      font-size: .9rem;
      width: 100vw;
    }

    [hidden] { display: none !important; }

    :host > div {
      padding: 0 40px;
    }

    h2 {
      font-weight: 700;
      color: var(--color-aggie-blue);
    }

    h3 {
      font-weight: 700;
    }

    app-collection .title-section {
      display: flex;
      min-height: 42vw;
    }

    app-collection .title-section > div {
      flex: 1;
      padding: 2rem;
      width: 50%;
    }

    app-collection .collection-header {
      margin: auto;
    }

    app-collection .collection-header h1 {
      margin: 0.5rem 0;
    }

    .collection-header h3 {
      margin: 0;
    }

    a.btn--alt {
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 1rem;
      color: white;
    }

    .image-overlay {
      position: relative;
      z-index: 450;
    }

    .watercolor-bg {
      z-index: 1;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
    }

    .featured-image {
      z-index: 50;
      top: 17%;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      transform: rotate(356deg);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
      width: 70%;
      overflow: hidden;
      padding-top: 52.5%;
    }

    .watercolor-fg {
      z-index: 100;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
    }

    .content-warning {
      padding: 2rem;
      margin-top: 2rem;
      background-color: var(--color-aggie-gold-30);
      font-style: italic;
    }

    .disclaimer-admin-toggle {
      margin-top: 2rem;
    }

    .detail-section {
      line-height: 1.7rem;
      width: 60%;
      margin: 0 auto;
    }

    .description {
      margin: 0 0 2rem 0;
    }

    .collection-label {
      font-weight: bold;
      padding-right: 0.3rem;
    }

    .collection-highlights {
      text-align: center;
    }

    .card-2,
    .card-2-4 {
      width: 75%;
      margin: 0 auto;
    }
    .card-single,
    .card-2,
    .card-2-4,
    .card-trio,
    .card-5-plus {
      display: grid;
      grid-template-columns: auto;
      grid-gap: var(--spacing-sm);
    }
    .card-single dams-collection-card,
    .card-2 dams-collection-card,
    .card-2-4 dams-collection-card,
    .card-trio dams-collection-card,
    .card-5-plus dams-collection-card {
      margin-bottom: var(--spacing-default);
    }

    .collection-highlights a.btn--primary {
      color: var(--color-aggie-blue);
      padding-top: .3rem;
      padding-bottom: .3rem;
      margin: 3rem 0 3rem;
      height: 2.4rem;
      min-height: 2.4rem;
    }

    @media (min-width: 767px) {
      .card-2,
      .card-2-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .card-single,
      .card-trio,
      .card-5-plus {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .card-single .collection-item,
      .card-single dams-item-card {
        grid-column: 2;
      }
      
      .card-trio {
        margin-right: 0;
        margin-left: 0;
      }
    }

    @media (max-width: 600px) {
      app-collection .title-section {
        display: block;
        overflow-y: -webkit-paged-x;
        padding-top: 3rem;
      }

      app-collection .title-section > div {
        width: 80%;
        margin: auto;
      }
      
      .detail-section {
        width: 80%;
      }

      .citation {
        display: block;
      }

      .cite-graphic,
      .cite-collection {
        width: 80%;
        padding-top: 0;
      }
    }

    .file-upload-container ucdlib-icon {
      display: inline-block;

    }
    
    input[type="file"] {
        display: none;
    }

    .file-upload-label {
      cursor: pointer;
      background-color: var(--color-aggie-blue-80);
      color: white;
      height: 50px;
      border-radius: 1.5rem;
      /* padding: 0 1.5rem; */
      display: inline-block;
      /* align-items: center;
      justify-content: center; */
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      white-space: nowrap;
      min-width: 150px;
    }

    .left-panel {
      display: flex;
    }

    .left-panel .file-upload-label ucdlib-icon {
      height: 50%;
      width: 25px;
      position: relative;
      top: 5%;
      left: -5%;
      fill: var(--color-aggie-gold);
    }

    .left-panel .file-upload-label:hover {
      background-color: var(--color-aggie-blue);
    }

    .left-panel .file-upload-label span {
      position: relative;
      top: 20%;
      right: 20%;
      padding-left: .2rem;
    }

    .selected-file {
      padding: 0 2rem 2rem;
      font-weight: bold;
    }

    .admin-edit .left-panel {
      position: absolute;
      left: 3rem;
      top: calc(170px + 3rem);
      z-index: 500;
    }

    .admin-edit .right-panel {
      position: absolute;
      right: 3rem;
      top: calc(170px + 3rem);
      z-index: 500;
    }

    .admin-edit .icon-wrapper {
      height: 50px;
      width: 50px;
      background-color: var(--color-aggie-blue-70);
      border-radius: 50%;
      display: inline-block;
      margin-left: .3rem;
      cursor: pointer;
    }

    .admin-edit ucdlib-icon {
      fill: white;
      width: 50%;
      height: 50%;
      margin: auto;
      padding-top: 0.6rem;      
    }

    .admin-edit .icon-wrapper.edit {
      background-color: var(--color-aggie-blue);
    }

    .admin-edit .icon-wrapper:hover {
      background-color: var(--color-aggie-blue);
    }

    .admin-edit .icon-wrapper.edit:hover {
      background-color: var(--color-aggie-gold);
    }

    .admin-edit .icon-wrapper.edit:hover ucdlib-icon {
      fill: var(--color-aggie-blue);
    }

    .edit-overlay {
      background: white;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      opacity: .55;
      z-index: 400;
    }

    .color-pallette {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 2rem;
      padding: 0 .6rem;
      background-color: var(--color-aggie-blue-30);
      border-radius: 1.5rem;
    }

    .color-circle {
      width: 27px;
      height: 27px;
      border-radius: 50%;
      margin: 0 3px;
      cursor: pointer;
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
    }

    .color-circle:hover {
      border: 3px solid var(--color-aggie-blue-70);
    }

    .color-circle[selected] {
      border: 3px solid var(--color-aggie-blue);
    }

    .edit-collections-container {
      z-index: 500;
      position: relative;
    }

    .edit-collections-container .collection-item {
      position: relative;
    }

    .edit-collections-container .collection-item {
      height: 135px;
      /* width: 401px; */
      background-color: var(--color-aggie-blue-30);
      position: relative;
      margin: 1rem;
    }

    .edit-collections-container .collection-item span {
      display: block;
      text-align: start;
      padding: 1rem 1rem .5rem 1rem;
      font-size: 1rem;
      font-weight: bold;
    }

    .edit-collections-container .collection-item input {
      position: absolute;
      left: 1rem;
      right: 1rem;
      border: none;
      height: 2rem;
      /* padding: 0 .5rem; */
      box-sizing: border-box;
      outline: none;
      font-size: .8rem;

      width: auto;
    }

    .collection-highlights h2, 
    .collection-highlights .header-dots {
      position: relative;
      z-index: 500;
    }

    .collection-highlights h2 {
      margin-bottom: 0;
      margin-top: 4rem;
    }

    .edit-collections-container > fieldset {
      border-top: none;
      padding-top: 0;
      margin-top: 0;
    }

    .edit-collections-container > fieldset span {
      font-weight: bold;
    }

    .list--reset {
      margin: 0;
      padding: 0 0 0 1.25rem;
      padding-left: 0;
      list-style: none;
    }

    .list--reset > li {
      display: inline-block;
      padding-right: .5rem;
    }

    .radio label {
      padding-top: .2rem;
    }

    .radio label:before {
     top: 5px;
     left: -1px;
    }
    
    .default-display {
      background-color: var(--color-aggie-gold-30);
      margin: 1rem;
      padding: 2rem;
    }

    .default-display h3 {
      font-style: italic;
      color: var(--color-aggie-blue);
      text-align: left;
      padding: 0;
      margin-bottom: 1rem;
      margin-top: 0;
    }

    .default-display span.label {
      font-weight: bold;
    }

    .default-item-display {
      text-align: left;
    }

    .exceptions {
      text-align: left;
      padding-left: 1rem;
    }

    .default-item-display .default-item-display-fs {
      border: none; 
      padding-left: 0; 
      padding-top: 0; 
      margin-top: 0;
      padding-bottom: 0;
      margin-bottom: 0; 
      position: relative; 
      left: -0.5rem;
      top: -0.5rem;
    }    

    .exceptions fieldset li,
    .default-item-display fieldset li {
      padding-top: .5rem;
    }

    .exceptions fieldset label,
    .default-item-display fieldset label {
      display: inline-block;
    }

    .exceptions fieldset label {
      font-weight: normal;
      color: inherit;
    }



    .disclaimer-admin-toggle {
      background-color: var(--color-aggie-gold-30);
      /* margin: 1rem; */
      padding: 2rem;
      text-align: left;
      position: relative;
      z-index: 500;
    }

    .disclaimer-admin-toggle .disclaimer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .disclaimer-admin-toggle .disclaimer-header span {
      font-weight: bold;
    }

    .disclaimer-admin-toggle .disclaimer-content {
      font-style: italic;
      line-height: 1.7rem;
    }

    .toggle-switch {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-button {
      width: 35px;
      height: 13px;
      border-radius: 30px;
      cursor: pointer;
      position: relative;
      background-color: var(--color-black-20);
    }

    .toggle-button::before {
      position: absolute;
      content: '';
      background-color: white;
      width: 22px;
      height: 22px;
      border-radius: 22px;
      margin-top: -2px;
      transition: 0.3s ease-in-out;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    .toggle-switch input:checked + .toggle-button {
      background-color: var(--color-aggie-blue-60);
    }
    .toggle-switch input:checked + .toggle-button::before {
      transform: translateX(.8rem);
      background-color: var(--color-aggie-blue-80);
    }
    .toggle-switch input {
      display: none;
    }

    .highlight-display-select {
      display: inline-block;
      margin-left: 1rem;
      min-width: 3.5rem;
    }
  </style>
    <app-modal-overlay
      ?hidden="${!this.showModal}"
      .title="${this.modalTitle}"
      .content="${this.modalContent}"
      @ok=${this._onModalClose}>
    </app-modal-overlay>
    <div class="edit-overlay" ?hidden="${!this.editMode || !this.isUiAdmin}">
    </div>
    <div class="admin-edit" ?hidden="${!this.isUiAdmin}">
      <div class="left-panel">
        <div class="file-upload-container" ?hidden="${!this.editMode || !this.isUiAdmin}">            
          <label for="file-upload" class="file-upload-label">
            <ucdlib-icon icon="ucdlib-dams:fa-plus"></ucdlib-icon>
            <span>New Image</span> 
          </label>
          <input id="file-upload" type="file" accept="image/jpeg" @change="${this._onFileChange}" />
        </div>  

        <div class="color-pallette" ?hidden="${!this.editMode || !this.isUiAdmin}">
          <div class="rose color-circle" ?selected="${this.watercolor === 'rose'}" style="background-color: var(--color-rose)" @click="${this._onWatercolorChanged}"></div>
          <div class="gold color-circle" ?selected="${this.watercolor === 'gold'}" style="background-color: var(--color-aggie-gold)" @click="${this._onWatercolorChanged}"></div>
          <div class="sage color-circle" ?selected="${this.watercolor === 'sage'}" style="background-color: var(--color-farmers-market)" @click="${this._onWatercolorChanged}"></div>
          <div class="arboretum color-circle" ?selected="${this.watercolor === 'arboretum'}" style="background-color: var(--color-arboretum)" @click="${this._onWatercolorChanged}"></div>
          <div class="tahoe color-circle" ?selected="${this.watercolor === 'tahoe'}" style="background-color: var(--color-tahoe)" @click="${this._onWatercolorChanged}"></div>
          <div class="thiebaud-icing color-circle" ?selected="${this.watercolor === 'thiebaud-icing'}" style="background-color: var(--color-thiebaud-icing)" @click="${this._onWatercolorChanged}"></div>
        </div>
      </div>

      <div class="right-panel">
        <div class="icon-wrapper" ?hidden="${this.editMode || !this.isUiAdmin}" @click="${this._onEditClicked}">
          <ucdlib-icon icon="ucdlib-dams:fa-pen"></ucdlib-icon>
        </div>
        <div class="icon-wrapper edit" ?hidden="${!this.editMode || !this.isUiAdmin}" @click="${this._onSaveClicked}">
          <ucdlib-icon icon="ucdlib-dams:fa-floppy-disk"></ucdlib-icon>
        </div>
        <div class="icon-wrapper edit" ?hidden="${!this.editMode || !this.isUiAdmin}" @click="${this._onCancelEditClicked}">
          <ucdlib-icon icon="ucdlib-dams:fa-xmark"></ucdlib-icon>
        </div>
      </div>
    </div>

    <div class="title-section">
      <div class="image-overlay">
        <img ?hidden="${!this.watercolorBgUrl}" class="watercolor-bg" src="${this.watercolorBgUrl}" width="100%" />

        <div class="featured-image"></div>
        <img ?hidden="${!this.watercolorFgUrl}" class="watercolor-fg" src="${this.watercolorFgUrl}" width="100%" />
      </div>
      <div class="collection-header">
        
        <h1>${this.title}</h1>
        <h3 ?hidden="${!this.callNumber}">Collection ${this.callNumber}</h3>
        <a href="${this.collectionSearchHref}" class="btn--alt btn--round">View ${this.items} item${this.items == 1 ? '' : 's'}</a>
      </div>
    </div>

    <div class="detail-section">

      <p class="description">
      <ucdlib-md id="md">
        <ucdlib-md-content>
          ${this.description}
        </ucdlib-md-content>
      </ucdlib-md>
      </p>

      <div style="margin-bottom: .4rem;" ?hidden="${!this.publishedDateRange}">
        <span class="collection-label">Coverage: </span> ${this.publishedDateRange}
      </div>
      <div style="margin-bottom: .4rem;" ?hidden="${!this.subjects?.length}">
        <span class="collection-label">Subjects: </span> 
          ${this.subjects.map(
            (about, index) =>
              html`${index > 0 ? ", " : ""}<a href="${utils.getSubjectUrl(this.RecordModel, about["name"] || about["@id"])}">${about["name"] || about["@id"]}</a>`
          )}
      </div>
      <div style="margin-bottom: .4rem;" ?hidden="${!this.material}">
        <span class="collection-label">Format: </span> ${this.material}
      </div>
      <div style="margin-bottom: .4rem;" ?hidden="${!this.languages?.length}">
        <span class="collection-label">Language: </span> 
        ${this.languages?.map(
          (language, index) => html`<span>${language.name}</span>${index < (this.languages?.length - 1) ? ', ' : ''} `
        )}
      </div>
      <div style="margin-bottom: .4rem;" ?hidden="${!this.location}">
        <span class="collection-label">Location: </span> ${this.location}
      </div>

      <div class="disclaimer-admin-toggle" ?hidden="${!this.editMode || !this.isUiAdmin}">
        <div class="disclaimer-header">
          <span>Disclaimer</span>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="toggle"
              ?checked="${this.showDisclaimer}" 
              @change="${this._onDisclaimerToggle}">
            <label for="toggle" class="toggle-button"></label>
          </div>
        </div>
        <div class="disclaimer-content">
          <p>
            Due to the nature of the historical items in this collection, some materials may be considered harmful, offensive or misrepresentative.
            There may be occurences of language, positions and values that do not align with our current values and practices at UC Davis.
          </p>
        </div>
      </div>

      <div class="content-warning" ?hidden="${this.editMode || !this.showDisclaimer}">
        Due to the nature of the historical items in this collection, some materials may be considered harmful, offensive or misrepresentative.
        There may be occurences of language, positions and values that do not align with our current values and practices at UC Davis.
      </div>


    </div>

    <div class="collection-highlights">
      <h2 ?hidden="${(this.highlightedItems.length === 0  || this.itemCount <= 0) && !this.editMode}">Highlights From This Collection</h2>
      ${ this.highlightedItems.length !== 0  && this.itemCount > 0 ? SharedHtml.headerDots() : '' }
      
      <div class="edit-collections-container" ?hidden="${!this.editMode || !this.isUiAdmin}">

      <fieldset class="radio" style="border: none; margin: 0; padding: 0;">      
        <div>
          <span class="form-label">Highlight Display:</span>
          <ucd-theme-slim-select
            class="highlight-display-select"
            @change="${this._onItemDisplayChange}"
            @focusin="${this._ssSelectFocus}"
            @click="${this._ssSelectFocus}"
            @blur="${this._ssSelectBlur}">
            <select>
                <option value="6" ?selected="${this.itemCount === 6}">6</option>
                <option value="3" ?selected="${this.itemCount === 3}">3</option>
                <option value="2" ?selected="${this.itemCount === 2}">2</option>
                <option value="1" ?selected="${this.itemCount === 1}">1</option>
                <option value="0" ?selected="${this.itemCount === 0}">0</option>
            </select>
          </ucd-theme-slim-select>
        </div>
      </fieldset>

        <div class="card-single" ?hidden="${this.itemCount !== 1}">      
          <div class="collection-item">
            <span>Item ARK ID</span>
            <input class="item-1 item-ark-input" 
              type="text" 
              .value="${this.savedItems[0] ? this.savedItems[0]['@id'].split('/item')[1] : ''}" 
              placeholder="/ark:/..." />
          </div>
        </div>
        <div class="card-2" ?hidden="${this.itemCount !== 2}">      
          <div class="collection-item">
            <span>Item ARK ID</span>
            <input class="item-1 item-ark-input" 
              type="text" 
              .value="${this.savedItems[0] ? this.savedItems[0]['@id'].split('/item')[1] : ''}" 
              placeholder="/ark:/..." />
          </div>
          <div class="collection-item">
            <span>Item ARK ID</span>
            <input class="item-2 item-ark-input" 
              type="text" 
              .value="${this.savedItems[1] ? this.savedItems[1]['@id'].split('/item')[1] : ''}" 
              placeholder="/ark:/..." />
          </div>
        </div>

        <div class="card-trio" ?hidden="${this.itemCount < 3}">      
          <div class="collection-item">
            <span>Item ARK ID</span>
            <input class="item-1 item-ark-input" 
              type="text" 
              .value="${this.savedItems[0] ? this.savedItems[0]['@id'].split('/item')[1] : ''}" 
              placeholder="/ark:/..." />
          </div>

          <div class="collection-item">
            <span>Item ARK ID</span>
            <input class="item-2 item-ark-input" 
              type="text" 
              .value="${this.savedItems[1] ? this.savedItems[1]['@id'].split('/item')[1] : ''}" 
              placeholder="/ark:/..." />
          </div>

          <div class="collection-item">
            <span>Item ARK ID</span>
            <input class="item-3 item-ark-input" 
              type="text" 
              .value="${this.savedItems[2] ? this.savedItems[2]['@id'].split('/item')[1] : ''}" 
              placeholder="/ark:/..." />
          </div>
        </div>
      
        <div class="card-trio" ?hidden="${this.itemCount !== 6}">      
          <div class="collection-item">
            <span>Item ARK ID</span>
            <input class="item-4 item-ark-input" 
              type="text" 
              .value="${this.savedItems[3] ? this.savedItems[3]['@id'].split('/item')[1] : ''}" 
              placeholder="/ark:/..." />
          </div>

          <div class="collection-item">
            <span>Item ARK ID</span>
            <input class="item-5 item-ark-input" 
              type="text" 
              .value="${this.savedItems[4] ? this.savedItems[4]['@id'].split('/item')[1] : ''}" 
              placeholder="/ark:/..." />
          </div>

          <div class="collection-item">
            <span>Item ARK ID</span>
            <input class="item-6 item-ark-input" 
              type="text" 
              .value="${this.savedItems[5] ? this.savedItems[5]['@id'].split('/item')[1] : ''}" 
              placeholder="/ark:/..." />
          </div>
        </div>

        <div class="default-display">
          <h3>Display Settings for Collection Item Pages</h3>

          <div class="default-item-display">
            <span class="label" style="display: block;">Default Display for Multipage Items</span>
            <span style="font-style: italic; margin-bottom: 0.5rem; display: inline-block;">Single page items and multimedia are not affected by these settings.</span>
            
            <fieldset class="radio default-item-display-fs">
              <div>
                <ul class="list--reset" style="padding-inline-start: 0;">
                  <li>
                    <input id="two" 
                      name="radio-default-display" 
                      type="radio" 
                      class="radio" 
                      value="${utils.itemDisplayType.brTwoPage}" 
                      ?checked="${this.itemDefaultDisplay === utils.itemDisplayType.brTwoPage}" 
                      @change="${(e) => (this.itemDefaultDisplay = utils.itemDisplayType.brTwoPage)}">
                    <label for="two">${utils.itemDisplayType.brTwoPage}</label>
                  </li>
                  <li>
                    <input id="one" 
                      name="radio-default-display" 
                      type="radio" 
                      class="radio" 
                      value="${utils.itemDisplayType.brOnePage}" 
                      ?checked="${this.itemDefaultDisplay === utils.itemDisplayType.brOnePage}" 
                      @change="${(e) => (this.itemDefaultDisplay = utils.itemDisplayType.brOnePage)}">
                    <label for="one">${utils.itemDisplayType.brOnePage}</label>
                  </li>
                  <li>
                    <input id="list" 
                      name="radio-default-display" 
                      type="radio" 
                      class="radio" 
                      value="${utils.itemDisplayType.imageList}" 
                      ?checked="${this.itemDefaultDisplay === utils.itemDisplayType.imageList}" 
                      @change="${(e) => (this.itemDefaultDisplay = utils.itemDisplayType.imageList)}">
                    <label for="list">${utils.itemDisplayType.imageList}</label>
                  </li>
                </ul>
              </div>
            </fieldset>
          </div>
          <div class="exceptions" ?hidden="${this.itemEdits.length < 1}">
            <span class="label">Exceptions</span>
            <p style="margin-top: 0.3rem; padding-bottom: 0; margin-bottom: 0;">
              Checked items in this list will be reset to the default item display when saved. 
              Display overrides can also be managed directly on an item page.
            </p>
            <fieldset style="border: none; padding-left: 0; padding-top: 0; margin-top: 0;">
              <ul class="list--reset" style="padding-inline-start: 0; width: 100%;">
                <li style="width: 33%; padding-right: 0;">
                  <input id="checkbox-all" 
                    name="checkbox-all" 
                    type="checkbox" 
                    @change="${this._onSelectAllExceptionsChange}">
                  <label for="checkbox-all">Select all exceptions</label>
                </li>

                <!-- items with exceptions set -->
                ${this.itemEdits.map((item, index) => html`
                  <li style="width: 33%; padding-right: 0;">
                    
                    <input id="checkbox${index}" 
                      name="checkbox" 
                      type="checkbox"
                      data-item-id="${item.id}">
                    <label for="checkbox${index}">
                      <a href="${item.id}">${item.linkLabel}</a>
                      <span style="font-style: italic;">
                        (${item.defaultDisplay})
                      </span>
                    </label>
                  </li>
                `)}
          
              </ul>
            </fieldset>
          </div>
        </div>
      
      </div>
      <div ?hidden="${this.editMode}" style="padding: 0 2rem;">
        <div class="card-single" ?hidden="${this.itemCount !== 1}">
          ${this.highlightedItems.map((item, index) => html`
            ${index < 3 ? html`<dams-item-card data-itemid="${'/item'+item['@id'].split('/item')[1]}"></dams-item-card>` : ''}
          `)}
        </div>
        <div class="card-2" ?hidden="${this.itemCount !== 2}">
          ${this.highlightedItems.map((item, index) => html`
            ${index < 3 ? html`<dams-item-card data-itemid="${'/item'+item['@id'].split('/item')[1]}"></dams-item-card>` : ''}
          `)}
        </div>
        <div class="card-trio" ?hidden="${this.itemCount < 3}">
          ${this.highlightedItems.map((item, index) => html`
            ${index < 3 ? html`<dams-item-card data-itemid="${'/item'+item['@id'].split('/item')[1]}"></dams-item-card>` : ''}
          `)}
        </div>
        <div class="card-trio" ?hidden="${this.itemCount < 6}">
          ${this.highlightedItems.map((item, index) => html`
            ${index >= 3 ? html`<dams-item-card data-itemid="${'/item'+item['@id'].split('/item')[1]}"></dams-item-card>` : ''}
          `)}
        </div>
      </div>

      <a href="${this.collectionSearchHref}" class="btn btn--primary btn--lg view-all-collections">View all collection items</a>

    </div>

    <app-citation .record="${this.citationRoot}"></app-citation>

  `;}