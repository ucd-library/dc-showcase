import { html } from "lit";
import { sharedStyles } from "../../../styles/shared-styles";

export default function render() {
  return html`
    <style>
      ${sharedStyles} :host {
        background-color: var(--color-aggie-blue-40);
        position: relative;
      }

      #filters {
        margin-left: 12px;
      }

      .title {
        color: var(--default-primary-color);
        font-weight: bold;
        padding: 15px 0;
        margin-left: 10px;
        border-bottom: 1px solid var(--medium-background-color);
        display: none;
      }

      app-filter-panel {
        border-bottom: 1px solid white;
        padding: 0.4rem 0;
      }

      .thumbnail {
        background-size: cover;
        background-position: center center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }

      .thumbnail-root {
        position: relative;
        height: 200px;
      }

      .label {
        padding: 10px 0;
        color: var(--default-primary-color);
        font-weight: var(--fw-bold);
      }

      .collection-filter {
        padding: 4px 5px;
        border-bottom: 1px solid var(--medium-background-color);
      }

      .outer-drawer-toggle {
        position: relative;
      }
      .outer-drawer-toggle[spacer] {
        height: 50px;
        border-bottom: 1px solid var(--medium-background-color);
        margin-left: 10px;
      }

      .drawer-toggle {
        font-size: var(--fs-sm);
        position: absolute;
        z-index: 15;
        top: 15px;
        right: -24px;
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

      @media (min-width: 975px) {
        h2 {
          display: block;
        }
        .outer-drawer-toggle {
          display: none;
        }
        .title {
          display: block;
        }
      }



      /* MOBILE LAYOUT */

      .heading {
        background-color: var(--color-aggie-blue-80);
        padding: 0 1rem;
        height: 61.75px;
      }
      .heading h5 {
        color: white;
        display: inline-block;
        margin: 0.8rem 0;
        font-weight: 600;
        font-size: 1.5rem;
      }
      .heading .collapse {
        display: inline-block;
        float: right;
        cursor: pointer;
        width: 60px;
        height: 60px;
      }

      .heading ucdlib-icon {
        fill: var(--color-aggie-gold);
        float: right;
        padding-top: 0.9rem;
      }

      .heading {
        display: none;
      }

      @media (max-width: 767px) {
        .heading {
          display: block;
          /* margin-top: 52px; */
        }
        :host {
          box-shadow: 0px 3px 6px #00000029;
        }
        .overflow {
          overflow-y: auto;
          height: calc(100vh - 100px);
        }
      }

    </style>

    <div class="heading">
      <h5>Filters</h5>
      <div class="collapse" @click="${this._collapseFilters}">
        <ucdlib-icon
          icon="ucdlib-dams:fa-times"
          tabindex="0"
          icon="fa-times"
          alt="Collapse filters"
        >
        </ucdlib-icon>
      </div>
    </div>

    <div class="thumbnail-root" ?hidden="${!this.collectionMode}">
      <div
        class="thumbnail"
        style="background-image: url('${
          this.selectedCollection.thumbnailUrl
        }')"
      ></div>
    </div>

    <div class="overflow">
      <div id="filters">
        ${this.facetFilters.map(
          (item, index) => html`
            <app-filter-panel .filter="${item}"></app-filter-panel>
          `
        )}
      </div>
    </div>


    </div>
  `;
}
