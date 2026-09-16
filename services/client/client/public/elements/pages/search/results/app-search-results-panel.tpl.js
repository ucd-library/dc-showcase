import { html } from "lit";

import "@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js";
import utils from "../../../../lib/utils";

export default function render() {
  return html`
    <style include="shared-styles">
      :host {
        display: block;
        position: relative;
        margin: 0 5px;
      }

      [hidden] {
        display: none !important;
      }

      .header {
        font-size: var(--fs-sm);
        display: flex;
        align-items: center;
        margin-bottom: 11px;
        margin-top: 5px;
        padding: 1.5rem;
      }

      .header > * {
        flex: 1;
      }

      select {
        margin-left: 10px;
        border: 1px solid var(--light-background-color);
        border-radius: 0;
        -webkit-appearance: none;
        -moz-appearance: none;
        -ms-appearance: none;
        -o-appearance: none;
        appearance: none;
        -webkit-border-radius: 0px;
        padding: 5px 25px 5px 10px;
        background-position: right 10px center;
        background-size: 10px 10px;
        background-repeat: no-repeat;
        background-color: transparent;
        background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCA2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzAwMjg1NTt9PC9zdHlsZT48L2RlZnM+PGc+PHBvbHlnb24gY2xhc3M9ImNscy0xIiBwb2ludHM9IjAgMCAxMCAwIDUgNiAwIDAiLz48L2c+PC9zdmc+");
        background-position-y: 13px;
      }
      /* for IE */
      select::-ms-expand {
        display: none;
      }

      ucd-theme-pagination {
        display: flex;
        justify-content: center;
        box-sizing: border-box;
        padding-top: 1rem;
      }

      h3 {
        /* border-top: 1px solid var(--light-background-color); */
        margin: 15px 0 0 0;
        padding: 15px 0 0 0;
        color: var(--default-primary-color);
      }

      .grid {
        margin: 10px;
        position: relative;
        display: grid;
        flex-direction: row;
        flex-wrap: wrap;
        width: 95%;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .grid dams-item-card {
        padding: 1.5rem;
      }

      .masonry {
        margin: 10px;
        position: relative;
        /* display: flex;
        flex-direction: row;
        flex-wrap: wrap; */
        width: 95%;
      }

      .list {
        margin: 10px;
      }

      .list .item {
        padding: 10px;
        margin-bottom: 15px;
        background-color: #daaa00;
        height: 250px;
      }

      .spacer {
        height: 20px;
        border-right: 1px solid var(--light-background-color);
      }

      .total {
        font-size: 0.9rem;
        padding-left: 10px;
        flex: 2;
      }

      .mobile-total {
        font-style: italic;
      }

      .error {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 250px;
        color: red;
      }

      #numPerPage {
        font-size: 0.9rem;
      }

      .drawer-toggle {
        font-size: var(--fs-sm);
        cursor: pointer;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        font-weight: var(--fw-bold);
        color: var(--default-primary-color);
        background-color: var(--light-background-color);
        border-radius: 0;
        border: 0;
        padding: 0;
      }
      .drawer-toggle > span {
        padding: 0 10px;
      }
      .drawer-toggle iron-icon {
        background-color: var(--default-secondary-color);
      }

      .drawer-toggle[disabled] {
        color: var(--light-background-color);
      }

      .collections {
        text-align: center;
      }

      .collections-content {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 100%;
      }

      .collections-content dams-collection-card {
        flex: 33.33%;
      }

      ucdlib-icon {
        height: 40px;

        display: inline-block;
        position: relative;
        padding: 8px 0;

        outline: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: pointer;
        z-index: 0;
        line-height: 1;
        width: 40px;
        height: 40px;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        -webkit-tap-highlight-color: transparent;
        box-sizing: border-box !important;
        justify-content: flex-end;
        fill: var(--color-aggie-blue-80);
      }

      .masonry {
        margin: 10px;
        position: relative;
      }

      .masonry .item {
        display: block;
        position: absolute;
        width: 27%;
        padding: 1.5rem;
        /* visibility: hidden; */
        top: 25px;
        left: 25px;
        /* will-change: top, left;
        transition: top 500ms ease-out, left 500ms ease-out; */
      }

      .selected-layout {
        box-shadow: inset -2px 0 0 var(--color-aggie-gold),
          inset 0 -2px 0 var(--color-aggie-gold),
          inset 2px 0 0 var(--color-aggie-gold),
          inset 0 2px 0 var(--color-aggie-gold);
      }

      .header a {
        color: var(--color-aggie-blue-70);
        cursor: pointer;
      }

      .header .photo-stack {
        display: inline-block;
      }

      .header .photo-stack ucdlib-icon {
        fill: var(--color-aggie-blue-60);
      }

      .header ucdlib-icon {
        padding: 5px;
      }

      @media (max-width: 545px) {
        .grid dams-item-card {
          flex: 100%;
          padding: 1.5rem;
          max-width: 85vw;
        }
        .header {
          padding-left: 0.5rem;
        }
      }

      @media (max-width: 1023px) {
        .masonry .item {
          width: 38% !important;
        }
      }

      @media (max-width: 768px) {
        .truncated-text-mobile {
          display: none;
        }
        
        .masonry .item {
          width: 80vw !important;
          /* position: initial; */
          /* margin: auto; */
          /* padding-bottom: .5rem; */
        }
      }

      @media (min-width: 975px) {
        .header {
          display: flex;
        }
        /* .mobile-header {
          display: none;
        } */
      }

      @media (max-width: 1023px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 767px) {
       .grid {
            grid-template-columns: repeat(1, minmax(0, 1fr));
        }
      }

      @media (max-width: 1182px) {
        .truncated-text {
          display: none;
        }
      }

      @media (max-width: 1130px) {
        /* TODO stack pagination ABOVE result count/link */
        .header {
          flex-direction: column-reverse;
          align-items: inherit;
        }

        .header-results {
          /* padding-top: 1rem; */
        }

        .header-pagination {
          padding-bottom: 1rem;
        }
        .header-pagination .filler {
          flex: 3;
        }
      }

      .teaser {
        padding: 1.5rem; 
      }
      .teaser__image {
        background-color: #dcdcdc;
        width: 100%;
        padding-top: 75%;
      }
      .teaser__title {
        background-color: #dcdcdc;
        height: 1.5rem;
        width: 80%;
        margin: .8rem auto 0;
      }

      .masonry {
        /* display: flex;
        flex-wrap: wrap; */
        gap: 16px;
      }

      .masonry .col-1,
      .masonry .col-2,
      .masonry .col-3 {
        flex: 1 1 calc(33.333% - 16px);
        box-sizing: border-box;
        overflow: hidden;
        position: relative;
        margin-bottom: 16px;
      }

      .masonry .teaser .teaser__image {
        width: 100%;
        height: auto;
        background-color: #dcdcdc;
        padding-top: 0;
      }

      .masonry .teaser .teaser__title {
        padding: 8px;
        font-size: 1rem;
        text-align: center;
        background-color: #dcdcdc;
      }

      .list .teaser {
        display: flex;
      }
      .list .teaser__image {
        height: 250px;
        width: 33%;
        padding-top: 0;
      }
      .list .teaser__content {
        width: 75%;
        margin-left: 3rem;
      }
      .list .teaser__title {
        margin: .8rem auto 0 0;
      }
      .list .teaser__content .teaser__details {
        padding-top: 1rem;
        width: 80%;
        margin: .8rem auto 0 0;
      }
      .list .teaser__content .teaser__details > * {
        margin: 0.5rem 0;
        height: 1rem;
        background-color: #dcdcdc; 
      }

      .masonry-titles .collection-name {
        padding: 15px calc(1.5rem + 15px);
        box-sizing: border-box;
        line-height: 1.3;
        font-size: 0.95rem;
      }
    </style>

    <div class="header">
      <div class="header-results" style="flex: 2.25; display: flex;">
        <div style="flex: 2.25; margin: auto; min-height: 2.1rem;" ?hidden="${!this.total && this.total !== 0}">
          <div class="photo-stack">
            <ucdlib-icon
              style="cursor: auto;"
              class="vertical-link__image"
              icon="ucdlib-dams:photo-stack"
            ></ucdlib-icon>
          </div>
          
          <span style="font-weight: bold">${utils.formatNumberWithCommas(this.total)}${this.total === 10000 ? '+' : ''} item<span class="truncated-text"> result</span>${this.total === 1 ? '' : 's'}</span><span ?hidden="${this.totalCollections === 0}">
            from
            <a href="" @click="${this._scrollToCollections}">${this.totalCollections} collection${this.totalCollections > 1 ? 's' : ''}</a></span>
        </div>
      </div>

      <div class="header-pagination"
        style="flex: 3; display: flex; justify-content: end">
        <span style="text-align: right; margin: auto 0; padding-right: .5rem; padding-left: 5px;">Display:</span>
        <div>
          <ucdlib-icon
            icon="ucdlib-dams:result-display-grid"
            @click="${this._onLayoutToggle}"
            type="grid"
            class="grid-layout-icon selected-layout">
          </ucdlib-icon>
        </div>
        <div>
          <ucdlib-icon
            icon="ucdlib-dams:result-display-mosaic"
            @click="${this._onLayoutToggle}"
            type="mosaic"
            class="mosaic-layout-icon">
          </ucdlib-icon>
        </div>
        <div>
          <ucdlib-icon
            icon="ucdlib-dams:result-display-list"
            @click="${this._onLayoutToggle}"
            type="list"
            class="list-layout-icon">
          </ucdlib-icon>
        </div>

        <div class="filler"></div>

        <select id="numPerPage" @change="${this._onPageSizeChange}">
          <option value="50">50</option>
          <option value="20" selected>20</option>
          <option value="10">10</option>
        </select>
        <div style="margin: 0 10px; font-size: .875rem; margin: auto 0 auto 0.5rem">
          <span class="truncated-text-mobile">items</span> per page
        </div>
      </div>
    </div>

    <div ?hidden="${this.showError}">
      <div ?hidden="${this.showLoading}">
        <div class="grid" ?hidden="${!this.loading || !this.isGridLayout}">
          ${[1,2,3,4,5,6,7,8.9,10].map(
            () => html`
              <div class="teaser">
                <div class="teaser__image"></div>
                <div class="teaser__title"></div>
              </div>  
            `
          )}
        </div>

        <div class="grid" id="gridLayout" ?hidden="${!this.isGridLayout}">
          ${this.results.map(
            (res) => html`
              <dams-item-card
                .data="${res}"
                data-url="${res.id}"
                @click=${this._onRecordClicked}
              ></dams-item-card>
            `
          )}
        </div>

        <div class="masonry" ?hidden="${!this.loading || !this.isMosaicLayout}" style="display: flex;">
          <div class="col-1">
            <div class="teaser">
              <div class="teaser__image" style="height: 350px;"></div>
              <div class="teaser__title"></div>
            </div>  
            <div class="teaser">
              <div class="teaser__image" style="height: 150px;"></div>
              <div class="teaser__title"></div>
            </div>  
            <div class="teaser">
              <div class="teaser__image" style="height: 300px;"></div>
              <div class="teaser__title"></div>
            </div>  
          </div>
          <div class="col-2">
            <div class="teaser">
              <div class="teaser__image" style="height: 200px;"></div>
              <div class="teaser__title"></div>
            </div>  
            <div class="teaser">
              <div class="teaser__image" style="height: 275px;"></div>
              <div class="teaser__title"></div>
            </div>  
            <div class="teaser">
              <div class="teaser__image" style="height: 200px;"></div>
              <div class="teaser__title"></div>
            </div>  
          </div>
          <div class="col-3">
            <div class="teaser">
              <div class="teaser__image" style="height: 250px;"></div>
              <div class="teaser__title"></div>
            </div>  
            <div class="teaser">
              <div class="teaser__image" style="height: 150px;"></div>
              <div class="teaser__title"></div>
            </div>  
            <div class="teaser">
              <div class="teaser__image" style="height: 250px;"></div>
              <div class="teaser__title"></div>
            </div>  
          </div>
        </div>
        
        <div class="masonry" id="layout" ?hidden="${!this.isMosaicLayout}">
          ${this.results.map(
            (res) => html`
              <app-search-grid-result
                .data="${res}"
                class="item"
                data-url="${res.id}"
                @click=${this._onRecordClicked}
                @rendered=${this._onGridItemRendered}
              ></app-search-grid-result>
            `
          )}
        </div>

        <div class="list" ?hidden="${!this.isListLayout}">
          <div ?hidden="${!this.loading}">
            ${[1,2,3,4,5,6,7,8.9,10].map(
              () => html`
                <div class="teaser">
                  <div class="teaser__image"></div>
                  <div class="teaser__content">
                    <div class="teaser__title"></div>
                    <div class="teaser__details">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </div>  
              `
            )}
          </div>
          ${this.results.map(
            (res) => html`
              <app-search-list-result
                .data="${res}"
                data-url="${res.id}"
                @click=${this._onRecordClicked}
              ></app-search-list-result>
            `
          )}
        </div>
      </div>
    </div>

    <div class="error" ?hidden="${!this.showError}">
      <div>${this.errorMsg}</div>
    </div>

    <ucd-theme-pagination
      ?hidden="${this.paginationTotal < 2}"
      current-page=${this.currentPage}
      max-pages=${this.paginationTotal}
      @page-change=${this._onPaginationChange}
      xs-screen
      ellipses>
    </ucd-theme-pagination>

    <div
      ?hidden="${!this.totalOverMaxWindow && this.total !== 10000}"
      style="text-align: center"
      class="limit-results"
    >
      Digital Collections limits results to 10,000. Use keywords and/or filters
      to refine search.
    </div>

    <div class="masonry-titles" style="visibility: hidden; position: absolute; bottom: 0;">
    </div>
  `;
}
