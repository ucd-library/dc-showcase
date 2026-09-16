import { html } from "lit";

export default function render() {
  return html`
    <style>

      .layout {
        width: 100%;
        align-items: center;
      }

      h2 {
        margin: 0;
        white-space: nowrap;
      }
      h2 a {
        color: var(--default-secondary-color);
        text-decoration: none;
      }
      /* h2 a:visited {
        color: var(--default-secondary-color);
        text-decoration: none;
      } */

      img {
        height: 50px;
      }

      .logo,
      h2 {
        padding-right: 20px;
        display: none;
      }

      .filler {
        flex: 0.25;
        display: none;
      }

      .logo-sm {
        margin-right: 10px;
      }

      iron-icon.search-icon {
        color: var(--default-primary-color);
      }

      @media (min-width: 700px) {
        .logo {
          display: block;
        }
        .logo-sm {
          display: none;
        }
      }

      @media (min-width: 815px) {
        h2 {
          display: block;
        }
      }

      @media (min-width: 1100px) {
        .filler {
          display: block;
        }
      }
      #options {
        height: 150px;
        background-color: white;
        width: 100%;
        padding: 2rem 4rem;
        vertical-align: middle;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      #option {
        display: inline-block;
      }

      .searchContainer {
        padding: 1rem 0 0;
        display: flex;
        justify-content: center;
        background-color: var(--color-aggie-blue-30);
      }
      #filter-box {
        width: 100%;
        text-align: center;
        align-items: center;
        background-color: var(--color-aggie-blue-30);
        padding-bottom: 1rem;
        min-height: 16px;
      }
      .site-name-search {
        display: none;
      }
      @media (max-width: 754px) {
        .searchContainer {
          padding-top: 1rem;
        }
        .site-name-search {
          display: block;
          text-align: center;
          margin-bottom: 1rem;
          padding-top: 2rem;
        }
        .site-name-search a {
          color: var(--color-aggie-blue) !important;
        }
        app-search-box {
          width: 80%;
          margin: 0 auto;
        }
      }
      @media (max-width: 450px) {
        app-search-box {
          width: 90%;
          margin: 0 auto;
        }
      }

      .add-filter {
        width: 8.5rem;
        height: 52px;
        background-color: var(--color-aggie-blue-80);
        color: white;
        border-radius: 35px;
        cursor: pointer;
        margin: 0 auto;
        display: flex;
      }
      .add-filter:hover {
        background-color: var(--color-aggie-blue);
      }

      .add-filter .add {
        width: 50px;
        height: 50px;
        /* display: inline-block; */
      }

      .add-filter p {
        margin: auto;
        padding-top: 1rem;
        font-size: 0.85rem;
        font-weight: bold;
      }

      .add-filter ucdlib-icon {
        fill: var(--color-aggie-gold);
        padding-top: 1rem;
        padding-left: 1rem;
      }

      .add-filter {
        display: none;
      }
      @media (max-width: 767px) {
        .add-filter {
          display: flex;
        }
      }
    </style>

    <div class="layout">
      <app-nav-bar id="foo" choices="${this.navBarChoices}"></app-nav-bar>
    </div>

    <div class="searchContainer">
      <div style="margin: 1rem auto 0; max-width: 100%;">
        <h2 class="site-name-search"><a href="/">Digital Collections</a></h2>
        <app-search-box
          id="searchBox"
          @search="${this._onSearch}"
          on-browse="${this._onBrowse}"
          placeholder="search digital collections"
        >
          <!-- <button class="search-icon" slot="button-content"></button> -->
          <!-- <iron-icon icon="fin-icons:search" class="search-icon" slot="button-content"></iron-icon> -->
        </app-search-box>
      </div>
      <br />
    </div>

    <div id="filter-box">
      <app-top-active-filters></app-top-active-filters>
      <div class="add-filter-container">
        <div class="add-filter" @click="${this._onExpandFilters}">
          <div class="add">
            <ucdlib-icon
              icon="ucdlib-dams:fa-plus"
              tabindex="0"
              icon="fa-plus"
              alt="Add filter"
            >
            </ucdlib-icon>
          </div>
          <div>
            <p>Add Filter</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
