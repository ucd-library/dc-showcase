import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }

    [hidden] {
      display: none !important;
    }

    .br-nav-bar,
    .controls {
      display: flex;
      align-items: center;
    }

    .br-nav-bar.fullscreen {
      padding: 0 1.5%;
    }

    ucdlib-icon {
      height: 35px;
      width: 30px;
      max-height: 35px;
      max-width: 30px;
      cursor: pointer;
    }

    ucdlib-bookreader-slider {
      height: 60px;
      flex: 1;
      padding-right: 1.5rem;
      padding-left: 10px;
    }

    .br-currentpage-override {
      color: #022851;
      font-size: 0.9rem;
      font-weight: bold;
      text-align: center;
      min-width: calc(var(--num-pages-length, 0) * 3ch + 3ch);
    }

    #buttonWrapper div {
      background-color: var(--color-aggie-blue-80);
      border-radius: 50%;
      display: inline-block;
      width: 50px;
      height: 50px;
      margin-left: 0.4rem;
    }

    #buttonWrapper ucdlib-icon {
      fill: white;
      width: 25px;
      margin: 7px auto;
    }

    .br-search {
      position: absolute;
      bottom: 75px;
      left: 0;
      background-color: var(--color-aggie-blue-30);
      height: 75px;
      padding-right: 0.9rem;
    }

    .br-search div {
      display: inline-block;
      vertical-align: sub;
    }

    .br-search div.zoom {
      background-color: var(--color-aggie-blue-80);
      border-radius: 50%;
      display: inline-block;
      width: 50px;
      height: 50px;
      margin-left: 25px;
      margin-top: 12.5px;
      cursor: pointer;
    } 

    .br-search div.zoom.searching,
    .br-search div.zoom.searching:hover {
      background-color: var(--color-aggie-gold);
    }

    .br-search div.zoom.searching ucdlib-icon {
      fill: var(--color-aggie-blue);
    }

    .br-search div.zoom:hover,
    #buttonWrapper div:hover {
      background-color: var(--color-aggie-blue);
    }

    .br-search ucdlib-icon {
      height: 25px;
      margin: 11px auto;
      fill: white;
    }

    .br-search #search-prev ucdlib-icon,
    .br-search #search-next ucdlib-icon { 
      width: 50px;
      height: 50px;
      fill: var(--color-aggie-blue);
    }

    .br-search::after {
      position: absolute;
      right: -1rem;
      top: 0;
      width: 1.8rem;
      height: 100%;
      background-color: var(--color-aggie-blue-30);
      content: "";
      transform: skewX(196deg);
    }

    #buttonWrapper {
      white-space: nowrap; 
      padding-left: 2rem;
    }

    #buttonWrapper .single-page-book {
      width: 25px;
      height: 25px;
      margin-top: 11px;
    }

    @media (max-width: 767px) {
      #buttonWrapper .zoom-icons {
        display: none;
      }
      ucdlib-bookreader-slider {
        padding-right: .5rem;
      }
      #buttonWrapper {
        padding-left: .5rem;
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

  `;

  return [elementStyles];
}

export function render() { 
return html`
  

  <div class="br-nav-bar${this.fullscreen ? ' fullscreen' : ''}">
    <ucdlib-bookreader-slider></ucdlib-bookreader-slider>
    <div class="controls">  
      <div id="prev" @click="${this._prevPage}">
        <ucdlib-icon icon="ucdlib-dams:fa-caret-left"></ucdlib-icon>
      </div>

      <span class="br-currentpage-override">${this.selectedPageLabel} of ${this.numPages}</span>

      <div id="next" style="width: 25px;" @click="${this._nextPage}">
        <ucdlib-icon icon="ucdlib-dams:fa-caret-right"></ucdlib-icon>
      </div>
    </div>

    <div id="buttonWrapper"
      ?hidden="${!this.fullscreen}">
      <div @click="${this._onToggleBookView}" 
        class="page-toggle tooltip"
        data-tooltip-text="${this.singlePageView ? 'Two-Page View' : 'Single-Page View'}">
        <ucdlib-icon
          icon="ucdlib-dams:fa-book-open"
          ?hidden="${!this.singlePageView}"
        ></ucdlib-icon>
        <ucdlib-icon
          icon="ucdlib-dams:page-single"
          ?hidden="${this.singlePageView}"
          class="single-page-book"
        ></ucdlib-icon>
      </div>

      <div class="zoom-icons tooltip" data-tooltip-text="Zoom Out" @click="${this._onZoomOutClicked}">
        <ucdlib-icon icon="ucdlib-dams:fa-minus"></ucdlib-icon>
      </div>
      <div class="zoom-icons tooltip" data-tooltip-text="Zoom In" @click="${this._onZoomInClicked}">
        <ucdlib-icon icon="ucdlib-dams:fa-plus"></ucdlib-icon>
      </div>
      <div @click="${this._onCloseClicked}" class="tooltip left-align" data-tooltip-text="Exit Fullscreen">
        <ucdlib-icon icon="ucdlib-dams:fa-down-left-and-up-right-to-center"></ucdlib-icon>
      </div>
    </div>

  </div>

  <div class="br-search" ?hidden="${!this.fullscreen}">
    <div
      class="tooltip zoom${this.searching ? " searching" : ""} right-align"
      @click="${this._onSearchClicked}"
      data-tooltip-text="${this.searching ? "Hide Search Box" : "Search Inside"}">
      <ucdlib-icon icon="ucdlib-dams:fa-magnifying-glass" class="fullscreen-search"></ucdlib-icon>
    </div>
    <div
      class="search-pagination"
      ?hidden="${this.searchResultsCount === 0}">
      <div
        id="search-prev"
        style="padding-left: .5rem; width: 40px;"
        @click="${this._prevSearchResult}">
        <ucdlib-icon icon="ucdlib-dams:fa-caret-left"></ucdlib-icon>
      </div>

      <span
        class="search-results"
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

`;}