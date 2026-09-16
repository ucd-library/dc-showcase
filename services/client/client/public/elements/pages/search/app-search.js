import { LitElement, html } from "lit";
import render from "./app-search.tpl.js";
import { MainDomElement } from '@ucd-lib/theme-elements/utils/mixins';
import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import "./results/app-search-results-panel";
import "./filtering/app-filters-panel";
import "./results/app-search-results-collections";

export class AppSearch extends Mixin(LitElement)
  .with(MainDomElement, LitCorkUtils) {
  
  static get properties() {
    return {
      visible: { type: Boolean },
      results: { type: Array },
      drawerOpen: { type: Boolean },
      firstLoad: { type: Boolean },
      appState: { type: Object },
      wideFiltersPanel: { type: Boolean },
      filtersCollapsed: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.active = true;
    this.render = render.bind(this);

    this.visible = false;
    this.results = [];
    this.drawerOpen = false;
    this.firstLoad = true;
    this.appState = {};
    this.wideFiltersPanel = false;
    this.filtersCollapsed = true;

    this._injectModel(
      "AppStateModel",
      "CollectionModel",
      "RecordModel",
      "SearchVcModel",
      "SeoModel"
    );
  }

  async firstUpdated() {
    if( this.AppStateModel.location.page !== 'search' ) return;

    this._onAppStateUpdate(await this.AppStateModel.get());

    // if( this.appState.location.path[0] === 'search' ) {
    //   let state = this.SearchVcModel.getSearch();
    //   if( state ) this._onSearchVcUpdate(state);
    // }
    window.addEventListener('collapse-filters', this._onCollapseFilters.bind(this));
    window.addEventListener("page-change", this._onPaginationChange.bind(this));
  }

  /**
   * @description AppStateInterface, fired when state updates
   * @param {*} e
   */
  _onAppStateUpdate(e) {
    if( e.location.page !== 'search' ) return;

    this.drawerOpen = e.filtersDrawerOpen ? true : false;
    this.appState = e;
  }

  /**
   * @description _onSearchVcUpdate, fired when record search viewController updates
   * @param {*} e
   */
  _onSearchVcUpdate(e) {
    if (e.state === "error") {
      return document.querySelector("#resultsPanel").onError(e);
    } else if (e.state === "loading") {
      return document.querySelector("#resultsPanel").onLoading();
    }

    if (e.state !== "loaded") return;

    let currentIndex = e.searchDocument.offset;
    let payload = e.payload;
    let total = payload.total.value;
    this.results = payload.results;

    document
      .querySelector("#resultsPanel")
      .renderResults(this.results, total, e.searchDocument.limit, currentIndex);
  }

  /**
   * @method _onPaginationChange
   * @description fired when pagination button is clicked
   *
   * @param {Object} e
   */
  _onPaginationChange(e) {
    let searchDoc = this.RecordModel.getCurrentSearchDocument();
    this.RecordModel.setPaging(searchDoc, e.detail.startIndex, e.detail.itemsPerPage || searchDoc.limit);
    this.RecordModel.setSearchLocation(searchDoc);
  }

  /**
   * @method _toggleDrawer
   * @description toggles the drawer state.  Listens to
   * toggle-drawer event from app-search-results-panel
   */
  _toggleDrawer() {
    this.AppStateModel.set({ filtersDrawerOpen: !this.drawerOpen });
  }

  _onFiltersTabUpdate(e) {
    this.wideFiltersPanel = e.detail.value === "info" ? true : false;
    setTimeout(() => {
      requestAnimationFrame(() => {
        this.querySelector('#resultsPanel')._resizeAsync();
      });
    }, 300);
  }

  _onCollapseFilters(e) {
    this.filtersCollapsed = true;
    this.drawerOpen = false;
    this.AppStateModel.set({ filtersDrawerOpen: this.drawerOpen });
  }

  expandFilters() {
    this.filtersCollapsed = false;
    this.drawerOpen = true;
    this.AppStateModel.set({ filtersDrawerOpen: this.drawerOpen });    
  }
}

customElements.define("app-search", AppSearch);
