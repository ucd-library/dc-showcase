import { LitElement } from "lit";
import render from "./admin-content-panel.tpl.js";

import "@ucd-lib/theme-elements/ucdlib/ucdlib-icon/ucdlib-icon";
import "@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js";

/**
 * @class AdminContentPanel
 * @description admin UI for customizing featured collections on the homepage
 */
export class AdminContentPanel extends LitElement {
  static get properties() {
    return {
      type: { type: String },
      position: { type: Number },
      placement: { type: String },
      collectionId: { type: String },
      heading: { type: String },
      description: { type: String },
      collectionIds: { type: Array },
      controlIcon: { type: Object },
      sortedCollectionsList: { type: Array },
      isDirty: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.active = true;

    this.isDirty = false;
    this.type = "";
    this.position = 0;
    this.placement = "";
    this.collectionId = "";
    this.heading = "";
    this.description = "";

    this.controlIcons = {
      single: "dams-admin-collection-single",
      text: "dams-admin-text",
      cards: "dams-admin-collection-cards",
    };
    this.collectionIds = [];
    this.sortedCollectionsList = Object.entries(
      APP_CONFIG.collectionLabels
    ).sort((a, b) => (a[1] < b[1] ? -1 : 1));
  }

  /**
   * @method firstUpdated
   * @description Lit lifecycle method
   */
  firstUpdated() {
    requestAnimationFrame(() => {
      this.dispatchEvent(new CustomEvent("panel-loaded"));
    });
  }

  /**
   * @method updated
   * @description Lit lifecycle method
   */
  updated() {
    if (this.isDirty) {
      this.isDirty = false;

      // hack annoying but the slimselect doesn't update consistently based on property values
      //  set selected manually just in case
      if (this.type === "single") {
        let collectionDropdown = this.shadowRoot.querySelector(
          "ucd-theme-slim-select.single-collection"
        );
        if (collectionDropdown) {
          collectionDropdown.slimSelect.setSelected(this.collectionId);
        }
      }

      if (this.type === "cards") {
        let collectionsDropdowns = this.shadowRoot.querySelectorAll(
          "ucd-theme-slim-select.list"
        );
        if (collectionsDropdowns) {
          collectionsDropdowns.forEach((dropdown, index) => {
            if (this.collectionIds[index]) {
              dropdown.slimSelect.setSelected(
                this.collectionIds[index].selected
              );
            }
          });
        }
      }
    }
    requestAnimationFrame(() => {
      this.dispatchEvent(new CustomEvent("panel-loaded"));
    });

    if (this.type === "single" || this.type === "text") {
      this.shadowRoot.querySelector(
        "#placement-" + this.placement
      ).checked = true;
    }
  }

  /**
   * @method _removeCollection
   * @description Remove Collection button press event, remove collection dropdown from ui
   */
  _removeCollection(e) {
    let position = e.currentTarget.dataset.index;
    this.collectionIds = this.collectionIds.filter(c => c.position != position); // remove collection from collectionIds
    this.collectionIds = this.collectionIds.map((c,index) => { return { position: index, selected: c.selected }}); // reindex positions
    this.isDirty = true;
    this.requestUpdate();
  }

  /**
   * @method _addCollection
   * @description Add Collection button press event, add collection dropdown to ui
   */
  _addCollection() {
    this.collectionIds.push({
      position: this.collectionIds.length,
      selected: "",
    });
    this.isDirty = true;
    this.requestUpdate();
  }

  /**
   * @method _onCollectionListChange
   * @description collection dropdown value change, save to collectionIds data array
   */
  _onCollectionListChange(e) {
    let position = e.currentTarget.dataset.position;
    let selected = e.detail.value;
    let match = this.collectionIds.filter(
      (c) => c.position === parseInt(position)
    )[0];
    if (match) {
      match.selected = selected;
      //   this.isDirty = true;
      this.requestUpdate();
    }
  }

  /**
   * @method _onTrashClicked
   * @description trash clicked, remove panel from admin view
   */
  _onTrashClicked(e) {
    this.dispatchEvent(
      new CustomEvent("trash-clicked", {
        detail: {
          position: this.position,
        },
      })
    );
    // this.isDirty = true;
    requestAnimationFrame(() => {
      this.dispatchEvent(new CustomEvent("panel-loaded"));
    });
  }

  /**
   * @method _onUpArrowClicked
   * @description move panel up in admin view
   */
  _onUpArrowClicked(e) {
    this.dispatchEvent(
      new CustomEvent("up-arrow-clicked", {
        detail: {
          position: this.position,
        },
      })
    );
    this.isDirty = true;
    this.sortedCollectionsList = [
      ...Object.entries(APP_CONFIG.collectionLabels).sort((a, b) =>
        a[1] < b[1] ? -1 : 1
      ),
    ];
    // this.requestUpdate();
    requestAnimationFrame(() => {
      this.dispatchEvent(new CustomEvent("panel-loaded"));
    });
  }

  /**
   * @method _onDownArrowClicked
   * @description move panel down in admin view
   */
  _onDownArrowClicked(e) {
    this.dispatchEvent(
      new CustomEvent("down-arrow-clicked", {
        detail: {
          position: this.position,
        },
      })
    );
    this.isDirty = true;
    this.sortedCollectionsList = [
      ...Object.entries(APP_CONFIG.collectionLabels).sort((a, b) =>
        a[1] < b[1] ? -1 : 1
      ),
    ];
    // this.requestUpdate();
    requestAnimationFrame(() => {
      this.dispatchEvent(new CustomEvent("panel-loaded"));
    });
  }

  /**
   * @method _ssSelectFocusIn
   * @description slim select focus change, color should be gold if active, blue if not
   * @param {Object} e
   */
  _ssSelectFocusIn(e) {
    let ssMain = e.currentTarget.shadowRoot.querySelector('.ss-main');
    let ssSingleSelected = e.currentTarget.shadowRoot.querySelector('.ss-single-selected');

    if( ssSingleSelected?.classList.value === 'ss-single-selected ss-open-below' ) {
      ssSingleSelected.style.backgroundColor = '#FFF4D2'; // gold-30
      ssMain.style.borderColor = '#FFBF00'; // gold
    }
  }

  /**
   * @method _ssSelectBlur
   * @description slim select focus change, color should be gold if active, blue if not
   * @param {Object} e
   */
  _ssSelectBlur(e) {
    let ssMain = e.currentTarget.shadowRoot.querySelector('.ss-main');
    let ssSingleSelected = e.currentTarget.shadowRoot.querySelector('.ss-single-selected');

    ssSingleSelected.style.backgroundColor = '#B0D0ED'; // blue-50
    ssMain.style.borderColor = '#B0D0ED'; // blue-50
  }
}

customElements.define("admin-content-panel", AdminContentPanel);
