import { LitElement, html } from "lit";
import render from "./fin-app.tpl.js";
import {MainDomElement} from '@ucd-lib/theme-elements/utils/mixins';
import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js'

// styles
import "./styles/shared-styles";

// main library
import "../lib";

// app elements
import "./pages/search/app-search-header";
import "./pages/search/app-search-breadcrumb";
import './pages/404/app-404';
import './pages/search-tips/app-search-tips';

import "./app-footer";
import "./auth/app-auth-footer";
import "./components/site/ucdlib-site-footer";
import "./components/site/ucdlib-site-footer-column";
import "./components/graphics/dams-watercolor-overlay";

export class FinApp extends Mixin(LitElement)
  .with(MainDomElement, LitCorkUtils) {
  
  static get properties() {
    return {
      page: { type: String },
      appRoutes: { type: Array },
      showSearchHeader: { type: Boolean },
      showBreadcrumb: { type: Boolean },
      localBuildTime: { type: String },
      appVersion: { type: String },
      clientTag: { type: String },
      clientHash: { type: String },
      coreTag: { type: String },
      coreHash: { type: String },
      showVersion: { type: Boolean },
      isAdmin: { type: Boolean },
      pathInfo: { type: String },
      buildInfo: { type: Array }
    };
  }

  constructor() {
    super();
    this.active = true;
    this.render = render.bind(this);
    this.SEARCH_HEADER_PAGES = [
      "about",
      "item",
      "search",
      "collections",
      "collection",
      "components",
      "browse",
      "search-tips"
    ];
    this.BREADCRUMB_PAGES = ["item", "search", "collections"];

    this.loadedPages = {};

    this.page = "loading";
    this.appRoutes = APP_CONFIG.appRoutes;
    this.showSearchHeader = false;
    this.showBreadcrumb = false;

    this.buildInfo = [];
    if( APP_CONFIG.user && APP_CONFIG.user.admin ) {
      this.renderBuildInfo();
    }

    if (APP_CONFIG.env.BUILD_TIME) {
      this.localBuildTime = new Date(APP_CONFIG.env.BUILD_TIME)
        .toISOString()
        .replace("T", " ");
    } else {
      this.localBuildTime = "Not set";
    }

    this.isAdmin = APP_CONFIG.user?.roles?.includes("admin");
    this.pathInfo = '';
    this._injectModel(
      "AppStateModel",
      "AuthModel",
      "CollectionModel",
      "RecordModel"
    );

    // app header event to pass to app-search, to toggle filters in mobile view
    window.addEventListener('expand-search-filters', this._expandSearchFilters.bind(this));
    window.addEventListener('resize', this._resize.bind(this));
  }
  
  ready() {
    let loadingEle = document.querySelector("#loading");
    if (loadingEle) document.body.removeChild(loadingEle);

    super.ready();

    // set initial user state
    this.AuthModel.store.setUser(APP_CONFIG.user);
  }

  /**
   * @method _onAppStateUpdate
   */
  async _onAppStateUpdate(e) {
    if( e.location.page === 'browse' ) {
      this._updateViewHeight(e.location.page);
      this._updateScrollPosition(e);
    }
    if (e.location.page === this.currentPage) return;

    if( e.location.page !== 'browse' ) this._updateScrollPosition(e);
    this.currentPage = e.location.page;

    this.showBreadcrumb = this.BREADCRUMB_PAGES.includes(e.location.page);
    this.showSearchHeader = this.SEARCH_HEADER_PAGES.includes(e.location.page);

    this.appState = e;

    let page = e.location.page;
    if (!this.loadedPages[page]) {
      this.page = "loading";
      this.loadedPages[page] = this.loadPage(page);
    }
    await this.loadedPages[page];

    this.page = page;
    this._updateViewHeight();

    this.pathInfo = e.location.pathname.split('/media')[0];

    if( this.page === 'collection' ) {
      let collectionId = e.location.fullpath;
      this._onCollectionUpdate(await this.CollectionModel.get(collectionId));
    } else if( this.page === 'item' ) {
      let itemId = e.location.fullpath;
      this._onRecordUpdate(await this.RecordModel.get(itemId));     
    }

    if( !['item', 'collection'].includes(this.page) ) this._updatePageMetadata();
  }

  renderBuildInfo() {
    for( let buildName in APP_CONFIG.buildInfo ) {
      let data = APP_CONFIG.buildInfo[buildName];
      let info = [
        {label: 'Repository', value: html`<a href="${data.remote}" target="_blank">${data.name}</a>`},
        {label: 'Last Commit Time', value: new Date(data.date).toLocaleString()},
      ];
      if( data.branch && data.branch != 'HEAD' ) {
        info.push({label: 'Branch', value: html`<a href="${data.remote}/tree/${data.branch}" target="_blank">${data.branch}</a>`});
      }
      if( data.tag ) {
        info.push({label: 'Tag', value: html`<a href="${data.remote}/tree/${data.tag}" target="_blank">${data.tag}</a>`});
      }
      info.push({label: 'Commit', value: html`<a href="${data.remote}/commit/${data.commit}" target="_blank">${data.commit}</a>`});
      info.push({label: 'Image', value: data.imageTag});      

      this.buildInfo.push(info);
    }
  }

  /**
   * @method _updateScrollPosition
   * @description update the scroll position based on the current page
   * @param {Object} e
   */
  _updateScrollPosition(e) {
    let scrollPositionY = 0;

    // every page change should scroll to top, except on search page we want to store the scroll position if nav to an item and then back, 
    // so when nav back, we can scroll to the same position we started at
    if( e.location.page === 'item' && e.lastLocation.page === 'search' && !this.searchScrollPositionY ) {
      this.searchScrollPositionY = window.scrollY;
    } else if( e.location.page === 'search' && e.lastLocation.page === 'item' && !e.resetScroll ) {
      scrollPositionY = this.searchScrollPositionY;
      this.searchScrollPositionY = 0;
    } else if( e.location.page === 'search' && e.lastLocation.page === 'search' ) {
      scrollPositionY = 0;
      this.searchScrollPositionY = 0;
    }

    if( !['item', 'search'].includes(e.location.page) && !['item', 'search'].includes(e.lastLocation.page) ) {
      this.searchScrollPositionY = 0;
    }

    requestAnimationFrame(() => {      
      window.scrollTo(0, scrollPositionY);
    });

    if( e.resetScroll ) this.AppStateModel.set({ resetScroll: false });
  }

  _resize() {
    this._updateViewHeight();
  }

  async _updateViewHeight(page=this.page) {
    // main-content should be height of the selected page, or 100vh during page load (so footer is at bottom during latent load)
    let mainContent = this.querySelector(".main-content");
    if( !mainContent ) return;

    let selectedPage = this.querySelector('ucdlib-pages').querySelector('#'+page);

    // wait for content and child components to render
    await selectedPage.updateComplete;
    let childComponents = selectedPage.querySelectorAll('*');
    await Promise.all(Array.from(childComponents).map(async (child) => {
      if( child.updateComplete ) {
        await child.updateComplete;
      }
    }));

    let isBrowseLandingPage = false;
    if( page === 'browse' ) {
      let browseByType = this.AppStateModel.location.path[1];
      if( browseByType ) {
        selectedPage = selectedPage.querySelector('#'+browseByType);
      } else {
        // browse landing page
        let browseSection = selectedPage.querySelector('.browse-selection-section');
        if( browseSection ) browseSection.removeAttribute('hidden');
        isBrowseLandingPage = true;
      }
      if( selectedPage ) {
        selectedPage.removeAttribute('hidden');
        selectedPage.style.display = '';
      }
    }

    if( page === 'browse' && selectedPage?.offsetHeight ) {
      let height = selectedPage.offsetHeight;
      mainContent.style.minHeight = height+'px';
    } else if( isBrowseLandingPage ) {
      mainContent.style.minHeight = '100px';    
    } else {
      mainContent.style.minHeight = '100vh';
    }
  }

  /**
   * @method loadPage
   * @description code splitting done here.  dynamic import a page based on route
   *
   * @param {String} page page to load
   * @returns {String} import()
   */
  loadPage(page) {
    if (page === "home") {
      return import(
        /* webpackChunkName: "page-home" */ "./pages/home/app-home"
      );
    } else if (page === "search") {
      return import(
        /* webpackChunkName: "page-search" */ "./pages/search/app-search"
      );
    } else if (page === "item") {
      return import(
        /* webpackChunkName: "page-record" */ "./pages/record/app-record"
      );
    } else if (page === "browse") {
      return import(
        /* webpackChunkName: "page-browse" */ "./pages/browse/app-browse"
      );
    } else if (page === "about") {
      return import(
        /* webpackChunkName: "page-about" */ "./pages/about/app-about"
      );
    } else if (page === "collection") {
      return import(
        /* webpackChunkName: "page-collections" */ "./pages/collection/app-collection"
      );
    } else if (page === "search-tips") {
      return import(
        /* webpackChunkName: "page-search-tips" */ "./pages/search-tips/app-search-tips"
      );
    }
    return page;
  }

  /**
   * @method _updatePageMetadata
   * @description update the title/description of the page based on the current page
   * @param {String} title override the title
   * @param {String} description override the description
   */
  _updatePageMetadata(title='', description='', brand=APP_CONFIG.title) {
    // 'UC Davis Library Digital Collections' (36 chars, + 3 for ' - '), ideally 60 chars total
    if( title.length > 21 ) {
      title = title.slice(0, 18) + '...';
    }

    if( title.length > 0 ) title = title + ' - ' + brand;

    document.title = title || brand;
    document.head.querySelector('[name="description"]').content = description;
  }
  
  /**
   * @method onCollectionUpdate
   * @description fired when collection updates
   *
   * @param {Object} e
   */
  async _onCollectionUpdate(e) {
    if( e.state !== 'loaded' ) return;
    if( this.AppStateModel.location.page !== 'collection' ) return;

    // parse title/description for meta updates
    let title = APP_CONFIG.title;
    let collectionName = e.vcData?.title || APP_CONFIG.collectionLabels[e.id] || '';
    if( collectionName ) title = collectionName + ' - ' + title;
    let description = e.vcData?.description || '';

    this._updatePageMetadata(title, description);
  }

  /**
   * @method _onRecordUpdate
   * @description fired when record updates
   *
   * @param {Object} e state event
   */
  async _onRecordUpdate(e) {
    if (e.state !== "loaded") return;
    if (this.AppStateModel.location.page !== "item") return;
  
    // parse title/description for meta updates
    let title = APP_CONFIG.title;
    let itemName = e.vcData?.name || '';
    if (itemName) title = itemName + ' - ' + title;
    let description = e.vcData?.description || '';

    this._updatePageMetadata(title, description);
  }

  /**
   * @method _expandSearchFilters
   * @description expands the search filters.  Listens to
   * expand-filters event from app-search-results-panel
   * @param {Object} e event object
   */
  _expandSearchFilters(e) {
    let appSearch = document.querySelector("app-search");
    if (appSearch) {
      appSearch.expandFilters();
    }
  }
}

customElements.define("fin-app", FinApp);
