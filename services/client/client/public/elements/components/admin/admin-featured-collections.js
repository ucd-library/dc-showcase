import { LitElement } from "lit";
import render from "./admin-featured-collections.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import "./admin-content-panel";

import "@ucd-lib/theme-elements/ucdlib/ucdlib-icon/ucdlib-icon";

/**
 * @class AdminFeaturedCollections
 * @description admin UI for customizing featured collections on the homepage
 */
export class AdminFeaturedCollections extends Mixin(LitElement).with(
  LitCorkUtils
) {
  static get properties() {
    return {
      panels : { type : Array },
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.active = true;

    this.panels = [];
    // this.isDirty = false;
    this._injectModel("FcAppConfigModel");
  }

  /**
   * @method updated
   * @description Lit lifecycle method
   */
  updated() {
    this._updateUiStyles(null, true);
  }

  /**
   * @method loadAdminData
   * @description load admin panel data
   * 
   * @param {Array} data
   */
  loadAdminData(data) {
    this.panels = data;
  }

  /**
   * @method _newPanel
   * @description Add Content panel click handler, creates new panel and adds to panels array
   * @param {CustomEvent} e
   */
  _newPanel(e) {
    let type = e.currentTarget.classList[0];
    this.panels.push({
      position: this.panels.length,
      type,
      placement: type === "single" ? "left" : "centered",
      collectionId: "",
      heading: "",
      description: "",
      collectionIds: type === "cards" ? [{ position: 0, selected: "" }] : [],
    });
    this.requestUpdate();
    requestAnimationFrame(() => {
      this._updateUiStyles(null, true);
    });
  }

  /**
   * @method _updateUiStyles
   * @description Listener attached to <admin-content-panel> updated events
   * @param {CustomEvent} e
   * @param {Boolean} allPanels set to true to refresh all admin panels
   */
  _updateUiStyles(e, allPanels = false) {
    let panel = e ? e.currentTarget : null;
    if (!panel && !allPanels) return;

    // TODO hack overriding styles of slim select, should we update the brand component to allow custom styles instead?
    let selects = [];
    let panels = [];
    if (allPanels) {
      panels = this.shadowRoot.querySelectorAll("admin-content-panel");
      if (panels.length) {
        panels.forEach((p) => {
          selects.push(
            ...p.shadowRoot.querySelectorAll("ucd-theme-slim-select")
          );
        });
      }
    } else {
      selects.push(
        ...panel.shadowRoot.querySelectorAll("ucd-theme-slim-select")
      );
    }
    if (!selects.length) return;

    selects.forEach((select) => {
      let ssMain = select.shadowRoot.querySelector(".ss-main");
      if (ssMain) {
        ssMain.style.border = 'none';
        ssMain.style.backgroundColor = 'transparent';
      }

      let ssSingle = select.shadowRoot.querySelector(".ss-single-selected");
      if (ssSingle) {
        ssSingle.style.border = "none";
        ssSingle.style.height = "49px";
        ssSingle.style.paddingLeft = "1rem";
        ssSingle.style.backgroundColor = "var(--color-aggie-blue-50)";
        ssSingle.style.borderRadius = '0';
        ssSingle.style.fontWeight = "bold";
        ssSingle.style.color = "var(--color-aggie-blue)";
      }

      // make description text area same width (-padding etc) as select input
      let selectWidth = select.offsetWidth - 30;
      // let description = panel.shadowRoot.querySelector('.description');
      // description.style.width = selectWidth+'px';
    });
  }

  /**
   * @method _trashPanel
   * @description Listener attached to <admin-content-panel> trash events, remove panel
   * @param {CustomEvent} e
   */
  _trashPanel(e) {
    let position = e.detail.position;
    this.panels.splice(position, 1);

    // update position of remaining panels
    this.panels.forEach((panel, i) => {
      panel.position = i;
    });
    this.requestUpdate();
    requestAnimationFrame(() => {
      this._updateUiStyles(null, true);
    });
  }

  /**
   * @method _movePanelUp
   * @description Listener attached to <admin-content-panel> arrow events, reposition panel
   * @param {CustomEvent} e
   */
  _movePanelUp(e) {
    let position = e.detail.position;
    if (position === 0) return;

    this._updatePanelsData();

    let panel = this.panels.splice(position, 1)[0];

    this.panels.splice(position - 1, 0, panel);

    // update position of remaining panels
    this.panels.forEach((panel, i) => {
      panel.position = i;
    });
    // this.isDirty = true;
    this.requestUpdate();
    requestAnimationFrame(() => {
      this._updateUiStyles(null, true);
    });
  }

  /**
   * @method _movePanelUp
   * @description Listener attached to <admin-content-panel> arrow events, reposition panel
   * @param {CustomEvent} e
   */
  _movePanelDown(e) {
    let position = e.detail.position;
    if (position === this.panels.length - 1) return;

    this._updatePanelsData();

    let panel = this.panels.splice(position, 1)[0];

    this.panels.splice(position + 1, 0, panel);

    // update position of remaining panels
    this.panels.forEach((panel, i) => {
      panel.position = i;
    });
    // this.isDirty = true;
    this.requestUpdate();
    requestAnimationFrame(() => {
      this._updateUiStyles(null, true);
    });
  }

  /**
   * @method _updatePanelsData
   * @description loop through panel ui elements and set panels array with currently set data
   */
  _updatePanelsData() {
    let panels = this.shadowRoot.querySelectorAll("admin-content-panel");
    panels.forEach((panel, i) => {
      let match = this.panels.filter((p) => p.position === panel.position)[0];
      if (match) {
        match.placement = panel.type !== "cards" ? panel.placement : "";
        match.collectionId = panel.type === "single" ? panel.collectionId : "";
        match.heading = panel.type === "text" ? panel.heading : "";
        match.description = panel.type !== "cards" ? panel.description : "";
        match.collectionIds = panel.type === "cards" ? panel.collectionIds : [];

        panel.isDirty = true;
      }
    });
    this.panels = [...this.panels];
    requestAnimationFrame(() => {
      this._updateUiStyles(null, true);
    });
  }
}

customElements.define("admin-featured-collections", AdminFeaturedCollections);
