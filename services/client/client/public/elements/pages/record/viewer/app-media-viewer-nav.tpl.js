import { html } from "lit";

import { sharedStyles } from "../../../styles/shared-styles";

export default function render() {
  return html`
    <style include="shared-styles">
      ${sharedStyles} :host {
        display: block;
      }

      :host([single-image]) {
        background-color: transparent;
        padding: 0 8px 8px 8px;
      }

      :host([single-image]) paper-icon-button,
      :host([single-image]) app-share-btn,
      :host app-share-btn,
      :host paper-icon-button {
        fill: var(--color-aggie-blue-80);
      }

      [hidden] {
        display: none !important;
      }
      
      input {
        padding: 15px;
        display: block;
        width: 90%;
        border: 0;
        width: 100%;
        box-sizing: border-box;
        padding: 1rem;
        background: white;
        border: none;
        height: 61px;
        outline: none;
        font-size: 0.8rem;
        font-family: proxima-nova, "Helvetica Neue", Helvetica, Arial,
          sans-serif;
        font-weight: 500;
      }

      .layout {
        display: flex;
        align-items: center;
        /* flex-wrap: wrap; */
        width: 60%;
        margin: auto;
        padding-bottom: 0.7rem;
        border-bottom: 6px dotted var(--color-aggie-gold);
      }

      .layout.lightbox {
        border-bottom: none;
        background-color: var(--color-aggie-blue-30);
        width: 100%;
        padding-bottom: 0;
        height: 5rem;
      }

      .layout.fullscreen {
        border-bottom: none;
        padding-top: 0.5rem;
        margin: 0;
        width: auto;
      }

      #thumbnailInnerContainer {
        padding-top: 7px;
      }

      #thumbnails {
        overflow: hidden;
      }

      #thumbnails > div {
        white-space: nowrap;
        margin-left: 0;
        will-change: margin-left;
        transition: margin-left 250ms ease-out;
      }

      .thumbnail {
        margin: 0 5px 5px 6px;
        display: inline-block;
        width: 48px;
        height: 48px;
        cursor: pointer;
        color: white;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
        border: 3px solid transparent;
      }

      .thumbnail:active {
        border: 1px solid var(--default-secondary-color);
      }

      .thumbnail:focus {
        outline: var(--default-outline);
      }

      .thumbnail[selected] {
        border: 3px solid var(--default-secondary-color);
      }
      
      .thumbnail-wrapper { position: relative; }
      
      .thumbnail-wrapper.audio::after,
      .thumbnail-wrapper.pdf::after { 
        content: ''; 
        position: absolute; 
        inset: 0; 
        background: rgba(2, 40, 81, 0.5); 
        pointer-events: none; 
        z-index: 2;
        margin: 3px 8px 8px 9px;
      }
      .thumbnail-wrapper a.thumbnail { position: relative; z-index: 1; }

      .thumbnail-wrapper ucdlib-icon {
        position: absolute; 
        top: 3px; 
        right: 18px; 
        z-index: 5; 
        pointer-events: none; 
        fill: white;
      }

      ucdlib-icon {
        height: 50px;
        margin: auto;
        fill: var(--color-aggie-blue-80);
        cursor: pointer;
      }

      #navLeft,
      #navRight {
        width: 36px;
        margin: auto;
      }

      #navLeft {
        margin-right: 2rem;
      }

      iron-icon {
        shape-rendering: geometricPrecision !important;
        width: 28px !important;
        height: 28px !important;
      }

      paper-icon-button {
        color: var(--default-secondary-color);
        min-width: 40px;
      }

      paper-icon-button:focus {
        border-radius: 0 !important;
      }

      paper-icon-button[disabled] {
        color: var(--gray-text);
        min-width: 40px;
      }

      paper-icon-button[invisible] {
        visibility: hidden;
      }

      .zoom-btns[pad] {
        margin-right: 30px;
      }

      #buttonWrapper {
        z-index: 500;
      }

      .lightbox #buttonWrapper {
        margin-right: 2rem;
      }

      #buttonWrapper div {
        background-color: var(--color-aggie-blue-80);
        border-radius: 50%;
        display: inline-block;
        width: 50px;
        height: 50px;
        margin-left: 0.4rem;
      }

      #buttonWrapper div:hover,
      #buttonWrapper div:has(> app-share-btn[popup]) {
        background-color: var(--color-aggie-blue);
      }

      #buttonWrapper ucdlib-icon {
        fill: white;
        width: 25px;
      }

      .search-container {
        margin-top: 0.7rem;
        margin-left: 1.2rem;
      }

      .search-container input {
        position: relative;
        z-index: 10;
        left: -0.8rem;
        width: 17rem;
      }

      .search-pagination {
        display: flex;
        margin: auto;
      }

      #buttonWrapper div.text-search {
        background-color: var(--color-aggie-gold);
      }

      #buttonWrapper div.text-search ucdlib-icon {
        fill: var(--color-aggie-blue-80);
      }

      .page-n-n {
        font-size: 0.9rem;
        font-weight: bold;
        color: var(--color-aggie-blue-80);
      }

      ucdlib-icon.single-page-book {
        width: 6% !important;
        height: 50%;
        position: relative;
        top: 25%;
        left: 1%;
      }

      .br-search-non-fs div {
        display: inline-block;
      }

      .br-search-non-fs div.zoom {
        background-color: var(--color-aggie-blue-80);
        border-radius: 50%;
        display: inline-block;
        width: 50px;
        height: 50px;
        /* margin-left: 25px; */
        margin-top: 5px;
      }

      .br-search-non-fs div.zoom {
        cursor: pointer;
      }

      .br-search-non-fs div.zoom:hover {
        background-color: var(--color-aggie-blue);
      }

      .br-search-non-fs ucdlib-icon {
        height: 50px;
        margin: auto;
        fill: white;
      }

      .br-search-non-fs #search-prev ucdlib-icon,
      .br-search-non-fs #search-next ucdlib-icon {
        fill: var(--ucdlib-icon-fill-color);
      }

      .br-search-non-fs div.zoom.searching {
        background-color: var(--color-aggie-gold);
      }

      .br-search-non-fs div.zoom.searching ucdlib-icon {
        fill: var(--color-aggie-blue);
      }

      @media (max-width: 767px) {
        /* mobile */
        #buttonWrapper div.zoom-controls {
          /* pinch to zoom */
          display: none;
        }



        /* this breaks something with bookreader, need to test again if below is uncommented */
        .layout {
          width: 90%;
          flex-wrap: wrap;
          justify-content: end;
        }
        .layout.lightbox {
          height: 150px;
        }

        #thumbnails {
          width: 80% !important;
        }
      }

      .tooltip {
        cursor: pointer;
        position: relative;
      }

      .tooltip:hover:before {
        content: attr(data-tooltip-text);
        position: absolute;
        bottom: 60px;
        right: 50%;
        transform: translateX(50%);
        padding: 5px 10px;
        border-radius: 5px;
        background: var(--color-aggie-blue);
        color: #fff;
        font-size: 1rem;
        font-weight: bold;
        white-space: nowrap;
        opacity: 0;
        transition: .2s opacity ease-out;
        z-index: 10;
      }

      .tooltip.right-align:hover:before {
        transform: translateX(80%);
      }

      .tooltip.left-align:hover:before {
        transform: translateX(20%);
      }

      .tooltip:hover:after {
        content: "";
        position: absolute;
        bottom: 50px;
        right: 20px;
        border: 5px solid var(--color-aggie-blue);
        border-color: var(--color-aggie-blue) transparent transparent transparent;
        opacity: 0;
        transition: .2s opacity ease-out;
      }

      .tooltip:hover:before,
      .tooltip:hover:after {
        opacity: 1;
      }

      .tooltip:has(> app-share-btn[popup]):hover:before,
      .tooltip:has(> app-share-btn[popup]):hover:after {
        display: none;
      }

    </style>

    <div
      class="layout ${this.isLightbox ? "lightbox" : ""} ${this.brFullscreen
        ? "fullscreen"
        : ""}">
      <div class="icon-nav" style="display: flex; max-width: 80vw;">
        <div id="navLeft">
          <ucdlib-icon
            icon="ucdlib-dams:fa-chevron-left"
            tabindex="0"
            icon="chevron-left"
            alt="Page thumbnails left"
            ?disabled="${!this.showNavLeft}"
            ?hidden="${!this.showNavLeft || this.singleImage || this.isBookReader}"
            @click="${this._pageLeft}">
          </ucdlib-icon>
          <div
            class="br-search-non-fs"
            style="min-width: 300px;"
            ?hidden="${this.brFullscreen || !this.isBookReader}">
            <div
              class="zoom ${this.searching ? "searching" : ""} tooltip"
              @click="${this._onSearchToggled}"
              data-tooltip-text="${this.searching ? "Hide Search Box" : "Search Inside"}">
              <ucdlib-icon icon="ucdlib-dams:fa-magnifying-glass"></ucdlib-icon>
            </div>
            <div
              class="search-pagination"
              ?hidden="${this.searchResultsCount === 0}">

              <div id="search-prev"
                style="padding-left: .5rem; width: 40px;"
                @click="${this._prevSearchResult}">
                <ucdlib-icon icon="ucdlib-dams:fa-caret-left"></ucdlib-icon>
              </div>

              <span class="search-results"
                style="position: relative;
                  bottom: 1rem;
                  font-size: .9rem;
                  font-weight: bold;">
                ${this.selectedResult} / ${this.searchResultsCount}
              </span>

              <div
                id="search-next"
                style="padding-right: .5rem; width: 40px;"
                @click="${this._nextSearchResult}">
                <ucdlib-icon icon="ucdlib-dams:fa-caret-right"></ucdlib-icon>
              </div>
            </div>
          </div>
        </div>

        <div id="thumbnails" ?hidden="${this.singleImage || (this.isBookReader && !this.isMultimedia) || this.thumbnails.length < 2}">
          <div id="thumbnailInnerContainer">
            ${this.thumbnails.map((item, index) => html`
              <div class="thumbnail-wrapper ${item.mediaType || ''}" style="position: relative; display: inline-block;">
                <a
                  class="thumbnail ${item.mediaType || ''}"
                  href="${item.id}"
                  alt="Page #${index+1}"
                  ?selected="${item.selected}"
                  title="${item.id}"
                  media-id="${item.id}"
                  ?disabled="${item.disabled}"
                  style="background-image:url(${item.src})">
                  <iron-icon icon="fin-icons:${item.icon}" ?hidden="${!item.icon}"></iron-icon>
                </a>
                ${item.mediaType === 'audio' ? html`
                  <ucdlib-icon 
                    class="fa-volume-high" 
                    icon="ucdlib-dams:fa-volume-high">
                  </ucdlib-icon>` : html``}
                ${item.mediaType === 'pdf' ? html`<ucdlib-icon
                    class="item-stack-blank"
                    icon="ucdlib-dams:item-stack-blank">
                  </ucdlib-icon>` : html``}
              </div>
            `)}
          </div>
        </div>

        <div id="navRight" ?hidden="${this.singleImage || this.isBookReader}">
          <ucdlib-icon
            icon="ucdlib-dams:fa-chevron-right"
            tabindex="0"
            icon="chevron-right"
            alt="Page thumbnails right"
            ?disabled="${!this.showNavRight}"
            ?hidden="${!this.showNavRight}"
            @click="${this._pageRight}"
          >
          </ucdlib-icon>
        </div>
      </div>

      <div style="flex:1"></div>
      <div class="break"></div>
      <div
        id="buttonWrapper"
        class="wrap"
        style="white-space: nowrap"
        ?hidden="${this.isLightbox}"
      >
        <div @click="${this._onToggleBookView}" 
          class="page-toggle tooltip ${this.brSinglePage ? 'two-page' : 'single-page'}" 
          ?hidden="${!this.isBookReader || this.hidePageToggle}"
          data-tooltip-text="${this.brSinglePage ? 'Two-Page View' : 'Single-Page View'}">
          <ucdlib-icon
            icon="ucdlib-dams:fa-book-open"
            ?hidden="${!this.brSinglePage}"
          ></ucdlib-icon>
          <ucdlib-icon
            icon="ucdlib-dams:page-single"
            ?hidden="${this.brSinglePage}"
            class="single-page-book"
          ></ucdlib-icon>
        </div>

        <div
          class="zoom-controls tooltip"
          @click="${this._onBRZoomOutClicked}"
          ?hidden="${!this.brFullscreen}"
          data-tooltip-text="Zoom Out">
          <ucdlib-icon icon="ucdlib-dams:fa-minus"></ucdlib-icon>
        </div>
        <div
          class="zoom-controls tooltip"
          @click="${this._onBRZoomInClicked}"
          ?hidden="${!this.brFullscreen}"
          data-tooltip-text="Zoom In" >
          <ucdlib-icon icon="ucdlib-dams:fa-plus"></ucdlib-icon>
        </div>

        <div
          @click="${this._onExpandBookView}"
          ?hidden="${!this.isBookReader || this.brFullscreen || this.hideZoom}"
          class="tooltip"
          data-tooltip-text="Fullscreen"
        >
          <ucdlib-icon
            icon="ucdlib-dams:fa-up-right-and-down-left-from-center"
          ></ucdlib-icon>
        </div>
        <div
          @click="${this._onCollapseBookView}"
          ?hidden="${!this.isBookReader || !this.brFullscreen}"
          class="tooltip" data-tooltip-text="Exit Fullscreen">
          <ucdlib-icon
            icon="ucdlib-dams:fa-down-left-and-up-right-to-center"
          ></ucdlib-icon>
        </div>

        <div
          @click="${this._onZoomInClicked}"
          ?hidden="${this.isBookReader || this.hideZoom}"
          class="tooltip"
          data-tooltip-text="Fullscreen"
        >
          <ucdlib-icon
            icon="ucdlib-dams:fa-up-right-and-down-left-from-center"
          ></ucdlib-icon>
        </div>
        <div ?hidden="${this.brFullscreen}" class="tooltip" data-tooltip-text="Share">
          <app-share-btn></app-share-btn>
        </div>

        <!-- this is moved next to the bookreader slider in app-media-viewer in full screen -->
        <!-- <div class="br-search" style="display: none;">
          <div
            class="zoom ${this.searching ? "searching" : ""}"
            @click="${this._onSearchToggled}"
          >
            <ucdlib-icon icon="ucdlib-dams:fa-magnifying-glass" class="fullscreen-search"></ucdlib-icon>
          </div>
          <div
            class="search-pagination"
            ?hidden="${this.searchResultsCount === 0}"
          >
            <div
              id="search-prev"
              style="padding-left: .5rem; width: 40px;"
              @click="${this._prevSearchResult}"
            >
              <ucdlib-icon icon="ucdlib-dams:fa-caret-left"></ucdlib-icon>
            </div>

            <span
              class="search-results"
              style="position: relative;
                bottom: 1rem;
                font-size: .9rem;
                font-weight: bold;"
              >${this.selectedResult} / ${this.searchResultsCount}</span
            >

            <div
              id="search-next"
              style="padding-right: .5rem; width: 40px;"
              @click="${this._nextSearchResult}"
            >
              <ucdlib-icon icon="ucdlib-dams:fa-caret-right"></ucdlib-icon>
            </div>
          </div>
        </div> -->
      </div>

      <div
        id="buttonWrapper"
        style="white-space: nowrap"
        ?hidden="${!this.isLightbox}"
      >
        <div
          class="${this.searchingText ? "text-search" : ""}"
          style="display: none;"
          @click="${this._onSearchClicked}"
        >
          <ucdlib-icon icon="ucdlib-dams:fa-magnifying-glass"></ucdlib-icon>
        </div>

        <div @click="${this._onZoomOutClicked}" class="tooltip" data-tooltip-text="Zoom Out">
          <ucdlib-icon icon="ucdlib-dams:fa-minus"></ucdlib-icon>
        </div>
        <div @click="${this._onZoomInClicked}" class="tooltip" data-tooltip-text="Zoom In">
          <ucdlib-icon icon="ucdlib-dams:fa-plus"></ucdlib-icon>
        </div>

        <div @click="${this._onCloseClicked}" class="tooltip left-align" data-tooltip-text="Exit Fullscreen">
          <ucdlib-icon icon="ucdlib-dams:fa-down-left-and-up-right-to-center"></ucdlib-icon>
        </div>

      </div>
    </div>
  `;
}
