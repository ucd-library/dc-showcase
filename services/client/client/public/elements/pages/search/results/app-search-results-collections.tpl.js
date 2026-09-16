import { html } from 'lit';

import { sharedStyles } from '../../../styles/shared-styles';
import '@ucd-lib/theme-elements/brand/ucd-theme-pagination/ucd-theme-pagination.js'

export default function render() {
return html`
  <style>
    ${sharedStyles}

    :host {
      display: block;
      position: relative;
      background-color: var(--color-aggie-blue-80);
      background-image: url(/images/watercolors/watercolor-background-ucd-blue-20opacity.png);
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
    }

    [hidden] { display: none !important; }

    h3 {
      color: var(--color-aggie-gold);
      font-weight: 700;
      margin: 0;
      padding: 3rem 3rem 0.5rem 4.5%;
    }

    .card-grid {
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-gap: 3rem;
      max-width: 91%;
    }

    ucd-theme-pagination {
      display: flex;
      justify-content: center;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      .card-grid {
        grid-template-columns: repeat(1, minmax(0, 1fr));
        max-width: 90%;
      }
    }

    .collections-in-search {
      padding-bottom: 35px;
    }

  </style>

  <div class="collections collections-in-search" ?hidden="${!this.showResults}">
    <div>
      <h3>Collections Relevant to Your Search (${this.results.length})</h3>
      <div style="text-align:center" class="collections-content">
        <div class="card-grid">
          ${this.resultsDisplayed.map(res => html`
            <dams-collection-card data-dark-bg data-id="${res['@id']}" @click=${this._onCollectionClicked}></dams-collection-card>
          `)}
        </div>  
      </div>
    </div>
    <ucd-theme-pagination
      ?hidden="${this.paginationTotal < 2}"
      current-page=${this.currentPage}
      max-pages=${this.paginationTotal}
      @page-change=${this._onPageClicked}
      xs-screen
      darkmode
      ellipses>
    </ucd-theme-pagination>
  </div>

  
`;}