import { html } from "lit";

import linksCss from "@ucd-lib/theme-sass/1_base_html/_links.css";
import buttonsCss from "@ucd-lib/theme-sass/2_base_class/_buttons.css";
import headingsCss from "@ucd-lib/theme-sass/2_base_class/_headings.css";

import utils from '../../../lib/utils/index.js';

export default function render() {
  return html`
    <style include="shared-styles">
      ${linksCss} ${buttonsCss} ${headingsCss} :host {
        display: block;
        background-color: var(--super-light-background-color);
      }

      [hidden] {
        display: none !important;
      }

      .container {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: normal;

        width: 60%;
        margin: auto;
      }

      .container h1 {
        font-weight: 800;
        text-align: center;
        color: var(--color-black-60);
        margin-bottom: 0.5rem;
        font-size: 1.7425rem;
      }

      .copyright {
        text-align: center;
        color: var(--color-aggie-blue-80);
      }

      .copyright span {
        font-size: 1.25rem;
        vertical-align: middle;
        font-weight: bold;
      }

      .copyright-text {
        font-size: 0.875rem;
        text-decoration: underline;
        display: inline;
      }

      .label {
        font-weight: var(--fw-bold);
        color: var(--default-primary-color);
      }

      .section {
        margin-bottom: 15px;
      }
      .section.bordered {
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px dashed var(--medium-background-color);
      }

      .metadata-row,
      .download-section {
        display: flex;
        margin: 0.85rem 0;
      }
      .metadata-row .attr,
      .download-section .label {
        flex: 0.25;
        color: var(--default-primary-color);
        font-weight: var(--fw-bold);
      }
      .metadata-row .value,
      .download-section .download-options {
        flex: 0.75;
        word-break: break-word;
      }

      .part-of {
        background-image: url(/images/watercolors/blue--1.webp);
        background-size: cover;
        display: flex;
        min-height: 12rem;
        margin: 3rem 0;
        background-color: var(--color-aggie-blue-30);
      }

      /* .part-of img {
        max-width: 100%;
        max-height: 100%;
        height: auto;
        width: auto;
      } */

      .part-of-img-container {
        overflow: hidden;
        width: 100%;
        aspect-ratio: 4 / 3;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .part-of img {
        position: relative;
        /* top: calc(-65%); */
      }

      .part-of div {
        margin: 2rem;
        flex: 1;
      }

      .part-of div:nth-child(1) {
        text-align: center;
      }

      .part-of .collection-info {
        flex: 2;
        margin: auto 0;
      }

      .part-of .collection-info h4 {
        margin: 0.3rem 0 0;
        font-weight: 600;
      }

      .part-of .collection-info h4 a {
        color: var(--color-aggie-blue);
        text-decoration: none;
      }
      .part-of .collection-info h4 a:hover {
        text-decoration: underline;
      }

      .part-of .collection-info p {
        margin: 0;
      }

      .part-of .collection-info span {
        font-weight: 800;
        text-decoration: none;
        color: var(--color-aggie-blue-80);
      }

      #identifierValue a,
      #fedoraValue a {
        display: block;
      }

      #identifierValue a:nth-child(1),
      #fedoraValue a:nth-child(1) {
        padding-bottom: 1rem;
      }

      @media (max-width: 756px) {
        .container {
          width: 85%;
        }
      }

      @media (max-width: 600px) {
        .container {
          width: 95%;
        }

        .metadata-row,
        .download-section {
          display: block;
        }

        .part-of .collection-info {
          margin: 1rem 1rem 1rem 0;
        }

        .part-of {
          min-height: 0;
        }

        .part-of div {
          margin: 2rem 1.5rem 2rem 1rem;
        }

        .part-of .collection-info h4 {
          font-weight: 800;
          font-size: 1.2rem;
          margin: 0;
        }

        .part-of .collection-info > * {
          padding: .25rem 0;
        }

        .collection-info {
          font-size: 1.1rem;
        }
      }

    app-record .admin-edit .left-panel {
      position: absolute;
      left: 20%;
      width: 60%;
      top: calc(170px + 3rem);
      z-index: 500;
      border-bottom: 6px dotted var(--color-aggie-gold);
      padding-bottom: 1.5rem;
    }

    app-record .admin-edit .right-panel {
      position: absolute;
      right: 3rem;
      top: calc(170px + 3rem);
      z-index: 500;
    }

    app-record .admin-edit .icon-wrapper {
      height: 50px;
      width: 50px;
      background-color: var(--color-aggie-blue-70);
      border-radius: 50%;
      display: inline-block;
      margin-left: .3rem;
      cursor: pointer;
    }

    app-record .admin-edit ucdlib-icon {
      fill: white;
      width: 50%;
      height: 50%;
      margin: auto;
      padding-top: 0.6rem;      
    }

    app-record .admin-edit .icon-wrapper.edit {
      background-color: var(--color-aggie-blue);
    }

    app-record .admin-edit .icon-wrapper:hover {
      background-color: var(--color-aggie-blue);
    }

    app-record .admin-edit .icon-wrapper.edit:hover {
      background-color: var(--color-aggie-gold);
    }

    app-record .admin-edit .icon-wrapper.edit:hover ucdlib-icon {
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

    a.create-issue {
      height: 1.4rem;
      min-height: 1.4rem;
    }

    ucdlib-md p {
      margin-top: 0;
    }

    .admin-edit h3 {
      color: var(--color-aggie-blue);
      font-style: italic;
      margin-bottom: 1rem;
    }

    .admin-edit .dropdown-label {
      font-weight: bold;
      margin-bottom: .5rem;
    }

    .admin-edit .dropdown-label.image-skew {
      margin-top: 1.5rem;
    }

    .admin-edit .deskew-status {
      margin-top: 0.6rem;
    }

    .admin-edit .deskew-status ucdlib-icon { 
      padding: 0;
      width: 24px;
      height: 24px;
      min-width: 24px;
      min-height: 24px;
    }

    .admin-edit .deskew-status .deskew-running {
      fill: var(--color-aggie-gold);
    }

    .admin-edit .deskew-status .deskew-finished {
      fill: var(--color-quad);
    }

    .admin-edit .deskew-status .deskew-error {
      fill: var(--color-double-decker);
    }

    .admin-edit .deskew-wrapper,
    .admin-edit .deskew-action-wrapper {
      display: flex;
      gap: 1rem;
    }

    .admin-edit .deskew-wrapper ucd-theme-slim-select {
      flex: 1;
      min-height: 2.5em;
    }

    .admin-edit .deskew-action-wrapper {
      flex: 0;
      white-space: nowrap;
    }

    .admin-edit .image-skew-description,
    .admin-edit .image-skew-status,
    .admin-edit .image-skew-error {
      color: var(--color-black-70);
      font-size: .9rem;
      margin: .25rem 0 .5rem 0;
    }

    .admin-edit .image-skew-status {
      font-style: italic;
      margin-top: .5rem;
    }

    .admin-edit .image-skew-error {
      color: var(--color-double-decker);
    }

    .admin-edit .apply-button {
      font-size: 1rem;
    }

    [icon="ucdlib-dams:fa-rotate"] {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 768px) {
      app-record .admin-edit .left-panel {
        left: 5%;
        width: 90%;
      }
    }

    @media (max-width: 500px) {
      .admin-edit .deskew-wrapper {
        display: block;
      }

      .admin-edit .deskew-action-wrapper {
        padding-top: 1rem;
        display: flex;
      }
    }

    </style>

    <div class="edit-overlay" ?hidden="${!this.editMode || !this.isUiAdmin}">
    </div>
    <div class="admin-edit" ?hidden="${!this.isUiAdmin}">
      <div class="left-panel" ?hidden="${!this.editMode || !this.isUiAdmin}">
        <h3 class="form-label">Item Display</h3>
        <p class="form-label dropdown-label">Viewer</p>
        <ucd-theme-slim-select
          class="item-display-select"
          @change="${this._ssSelectBlur}"
          @focusin="${this._ssSelectFocus}"
          @click="${this._ssSelectFocus}"
          @blur="${this._ssSelectBlur}">
          <select>
              <option .value=${this.itemDefaultDisplay} ?selected=${this.itemDisplay === this.itemDefaultDisplay}>
                Collection Default (${this.itemDefaultDisplay})
              </option>
              <option .value=${utils.itemDisplayType.brTwoPage} ?selected=${this.itemDisplay !== this.itemDefaultDisplay && this.itemDisplay === utils.itemDisplayType.brTwoPage}>
                ${utils.itemDisplayType.brTwoPage}
              </option>
              <option .value=${utils.itemDisplayType.brOnePage} ?selected=${this.itemDisplay !== this.itemDefaultDisplay && this.itemDisplay === utils.itemDisplayType.brOnePage}>
                ${utils.itemDisplayType.brOnePage}
              </option>
              <option .value=${utils.itemDisplayType.imageList} ?selected=${this.itemDisplay !== this.itemDefaultDisplay && this.itemDisplay === utils.itemDisplayType.imageList}>
                ${utils.itemDisplayType.imageList}
              </option>
          </select>
        </ucd-theme-slim-select>

        <!-- 
        see issue #359, this was a stop gap that we fixed in the image processing workflow
        will likely be removed in the future, for now just disabling the ui controls
        
        <p class="form-label dropdown-label image-skew">Image Tilt Correction</p>
        <p class="image-skew-description">Run this process to fix tilted images. This is a realtime process, there may be some delay.</p>
        <div class="deskew-wrapper">
          <div class="deskew-action-wrapper">
            <button class="btn apply-button" ?disabled="${this.workflowRunning || this.workflowStatusLoading}" @click="${this._runWorkflow}">Run process</button>
            <div class="deskew-status">
              <ucdlib-icon ?hidden="${this.workflowError || !this.workflowRunning || !this.firstStatusLoaded}" class="deskew-running" icon="ucdlib-dams:fa-rotate"></ucdlib-icon>
            </div>
          </div>
        </div>
        <p class="image-skew-status">${this.workflowStatus}</p> 
        -->
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


    <app-media-viewer></app-media-viewer>

    <div class="container" style="padding-bottom: 50px;">
      ${this.name
        ? html`<h1>${this.name}</h1>`
        : html``
      }
      
      <div class="copyright" ?hidden="${!this.copyright || !this.copyright.label || !this.copyright.url}">
        <span>&copy;</span>
        <a href="${this.copyright.url}"
          class="copyright-text">${this.copyright.label}</a>
      </div>

      <div class="part-of">
        <div class="part-of-img-container"><img src="${this.collectionImg}" alt="" /></div>
        <div class="collection-info">
          <p style="font-style: italic;">part of digital collection</p>
          ${this.collectionId && this.collectionName
            ? html`<h4><a href="${this.collectionId}">${this.collectionName}</a></h4>`
            : html``
          }
          <span>${this.collectionItemCount} items</span>
        </div>
      </div>

      <div class="download-section" ?hidden="${this.disableDownload}">
        <div class="label">Download</div>
        <div class="download-options">
          <app-media-download
            id="download"
            ?hidden="${this.isBagOfFiles}"></app-media-download>
          <app-fs-media-download
            id="download"
            ?hidden="${!this.isBagOfFiles}"></app-fs-media-download>
        </div>
      </div>

      <div ?hidden="${!this.date}" class="metadata-row">
        <div class="attr">Date</div>
        <div class="value" id="dateValue">${this.date}</div>
      </div>

      <div ?hidden="${!this.description || !this.description.length}" class="metadata-row">
        <div class="attr">Description</div>
        <div class="value" id="descriptionValue">
          <ucdlib-md id="md">
            <ucdlib-md-content>
              ${this.description}
            </ucdlib-md-content>
          </ucdlib-md>
        </div>
      </div>

      <div ?hidden="${!this.publisher}" class="metadata-row" id="publisher">
        <div class="attr">Publisher</div>
        <div class="value" id="publisherValue">${this.publisher}</div>
      </div>

      <div
        ?hidden="${!this.subjects || !this.subjects.length}"
        class="metadata-row"
        id="subject">
        <div class="attr">Subjects</div>
        <div class="value" id="subjectValue">
          ${this.subjects.map(
            (about, index) =>
              html`${index > 0 ? ", " : ""}<a href="${utils.getSubjectUrl(this.RecordModel, about["name"] || about["@id"])}" @click="${this._onSubjectClick}">${about["name"] || about["@id"]}</a>`
          )}
        </div>
      </div>

      <div ?hidden="${!this.creator || !this.creator.length}" class="metadata-row" id="creator">
        <div class="attr">Creator</div>
        <div class="value" id="creatorValue">
          ${this.creator.map(
            (c, index) =>
              html`${index > 0 ? ", " : ""}<a href="${utils.getCreatorUrl(this.RecordModel, c)}" @click="${this._onCreatorClick}">${c}</a>`
          )}
        </div>
      </div>

      <div ?hidden="${!this.callNumber}" class="metadata-row" id="callNumber">
        <div class="attr">Call Number</div>
        <div class="value" id="callNumberValue">${this.callNumber}</div>
      </div>

      <div ?hidden="${!this.material}" class="metadata-row" id="material">
        <div class="attr">Format</div>
        <div class="value" id="materialValue">${this.material}</div>
      </div>

      <div class="metadata-row" id="identifier">
        <div class="attr">ARK / DOI</div>
        <div class="value" id="identifierValue">
          ${this.arkDoi.map((link) => html`<a @click="${this._arkDoiClick}" href="${link}">${link.replace('/item', '')}</a>`)}
        </div>
      </div>

      <div class="metadata-row">
        <div class="attr">Fedora Link</div>
        <div class="value" id="fedoraValue">
          ${this.fedoraLinks.map((link) => html`<a href="${link}">${link.replace('/fcr:metadata', '')}</a>`)}
        </div>
      </div>

      <div class="metadata-row" ?hidden="${!this.showReportButton}">
        <div class="attr">Modify</div>
        <div class="value">
          <a class="create-issue btn btn--primary" target="_blank" href="${this.githubIssueUrl}">Request Metadata Change (via GitHub)</a>
        </div>
      </div>
    </div>

    <app-citation .record="${this.citationRoot}" citation-type-label="Item"></app-citation>
  `;
}
