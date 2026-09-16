import { html } from "lit";

export default function render() {
  return html`
    <style include="shared-styles">
      :host {
        display: block;
        overflow: hidden;
      }
      .search-container {
        background-color: var(--super-light-background-color);
        /* min-height: 60vh; */
        display: block;
      }
      .search-content {
        flex: 1;
        padding-bottom: 35px;
        background-color: white;
      }

      /* app-filters-panel {
        width: 350px;
      }
      app-filters-panel[data-wide] {
        width: 475px;
      } */

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 0.7;
        }
      }

      /* #desktop-filter-panel {
        display: none;
      } */

      .filters-container {
        /* width: 350px; */
        background-color: var(--color-aggie-blue-40);
        transition: width 300ms linear;
      }

      @media (max-width: 1025px) {
        /* app-filters-panel {
          width: 275px;
        }
        app-filters-panel[data-wide] {
          width: 415px;
        }
        .filters-container {
          width: 275px;
        } */
      }

      /* @media (min-width: 975px) { */
      #desktop-filter-panel {
        display: block;
      }
      .search-container {
        /* display: flex; */
        display: grid;
        grid-template-areas: "first first first second second second second second second second second second";
        --l-gap: 1.5rem;
        grid-column-gap: var(--l-gap-override, var(--l-gap));
        grid-template-columns: repeat(12, 1fr);
        grid-template-rows: max-content 1fr;
      }

      .filters-container {
        grid-area: first;
        min-width: 0;
        --l-gap: 1.5rem;
      }

      .search-content {
        grid-area: second;
        min-width: 0;
        --l-gap: 1.5rem;
      }

      @media (max-width: 1023px) {
        .search-container {
          grid-template-areas: "first first first first second second second second second second second second";
        }
      }

      /* } */

      @media (max-width: 767px) {
        .search-container {
          display: block;
        }
     
        /* mobile */
        app-filters-panel {
          z-index: 2000;
          width: 90vw;
          transition: all 0.3s;

          /* prevent scrolling? */
          position: fixed;
          overflow-y: scroll;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
        }

        app-filters-panel.off-canvas--left {
          transform: translateX(-100%);
        }
        .filters-container {
          width: 0;
        }
      }

      @media (min-width: 768px) {
        /* tablet */
      }

      @media (min-width: 991px) {
        /* desktop */
      }
    </style>

    <div class="search-container">
      <div class="filters-container">
        <app-filters-panel
          id="desktop-filter-panel"
          class="filters-panel ${this.filtersCollapsed
            ? "off-canvas--left"
            : ""}"
          data-${this.wideFiltersPanel ? "wide" : "normal"}
          @selected-tab-changed="${this._onFiltersTabUpdate}"
          @collapse-filters="${this._onCollapseFilters}"
        ></app-filters-panel>
      </div>
      <div class="search-content">
        <app-search-results-panel
          id="resultsPanel"
          @toggle-drawer="${this._toggleDrawer}"
          @page-change="${this._onPaginationChange}"
        >
        </app-search-results-panel>
      </div>
    </div>

    <app-search-results-collections
      id="collectionsPanel"
    ></app-search-results-collections>
  `;
}
