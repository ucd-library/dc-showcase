import { html } from "lit";
export default function render() {
  return html`
    <style include="shared-styles">
      :host {
        display: block;
        /* background: var(--default-primary-color); */
        overflow: hidden;
      }

      [hidden] {
        display: none !important;
      }

      #loading {
        width: 100%;
        min-height: 700px;
        height: 75vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: white;
      }

      #loading img {
        animation: showLoading 400ms ease-in;
      }

      @keyframes showLoading {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      .footer {
        background-color: var(--color-dams-primary);
        position: absolute;
        left: 0;
        right: 0;
        z-index: -1;
      }

      .main-content {
        flex: 1;
        width: 100%;
      }

      app-search-header {
        position: relative;
      }

      .loading-dots {
        text-align: center;
        z-index: 5;
        color: var(--default-primary-color);
      }

      .dot {
        display: inline;
        margin-left: 0.2em;
        margin-right: 0.2em;
        position: relative;
        font-size: 3.5em;
        opacity: 1;
      }

      .dot.one {
        animation-delay: 0.2s;
      }
      .dot.two {
        animation-delay: 0.4s;
      }
      .dot.three {
        animation-delay: 0.6s;
      }

      @keyframes showHideDot {
        0% {
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
        60% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
      @media (max-width: 768px) {
        .footer.site-frame {
          padding: 0.5rem;
        }
      }
    </style>

    <app-search-header
      ?hidden="${!this.showSearchHeader}"
      @expand-search-filters=${this._expandSearchFilters}
    ></app-search-header>

      <div class="main-content" style="min-height: 100vh">
        <ucdlib-pages
          selected="${this.page}"
          selectedAttribute="visible"
        >
        <div id="loading" ?hidden="${this.page}">
          <img src="/images/logos/logo-icon.svg" style="max-width: 128px" />
          <div class="loading-dots">
            <h1 class="dot one">.</h1>
            <h1 class="dot two">.</h1>
            <h1 class="dot three">.</h1>
          </div>
        </div>
        <app-home id="home"></app-home>
        <app-search id="search"></app-search>
        <app-record id="item" @show-404="${(e) => this.page = '404'}"></app-record>
        <app-browse id="browse"></app-browse>
        <app-search-tips id="search-tips"></app-search-tips>
        <app-about id="about"></app-about>
        <app-collection id="collection" @show-404="${(e) => this.page = '404'}"></app-collection>        
      </ucdlib-pages>

      <app-404 id="404" ?hidden="${this.page !== '404'}"></app-404>
    </div>

    <div class="footer site-frame">
      <ucdlib-site-footer>
        <ucdlib-site-footer-column header="Digital Collections">
          <ul>
            <li><a href="/browse/collections">Collections</a></li>
            <li><a href="/search">Items</a></li>
            <li><a href="/search-tips">Search Tips</a></li>
            <li><a href="https://calisphere.org/UCD/collections">Additional Items on Calisphere</a></li>
            <li><a href="/about">About Digital Collections</a></li>
            <!-- <li><a href="">FAQ</a></li> -->
          </ul>
        </ucdlib-site-footer-column>
        <ucdlib-site-footer-column header="Library Info">
          <ul>
            <li>
              <a
                href="https://library.ucdavis.edu/special-collections/"
                target="_blank"
                rel="noopener"
                >Archives and Special Collections</a
              >
            </li>
            <li>
              <a
                href="https://library.ucdavis.edu/library/"
                target="_blank"
                rel="noopener"
                >Visit the Library</a
              >
            </li>
            <li>
              <a
                href="https://library.ucdavis.edu/news/"
                target="_blank"
                rel="noopener"
                >Library News</a
              >
            </li>
            <li>
              <a
                href="http://give.ucdavis.edu/ULIB"
                target="_blank"
                rel="noopener"
                >Give to the Library</a
              >
            </li>
          </ul>
        </ucdlib-site-footer-column>
        <ucdlib-site-footer-column header="Account">
          <ul>
            <li><app-auth-footer></app-auth-footer></li>
            <li class="fin-admin" ?hidden="${!this.isAdmin}">
              <a href="/fin/admin/${this.pathInfo.length > 1 ? '#path-info' + this.pathInfo : ''}">Fin Admin</a>
            </li>
          </ul>
        </ucdlib-site-footer-column>
        <div insert-into="build-info" >
          <div class="build-info">
            ${this.buildInfo.map(
              info => html`
                <div>
                  ${info.map(
                    item => html`
                      <div>
                        <b>${item.label}</b>: ${item.value}
                      </div>
                    `
                  )}
                </div>
              `
            )}
          </div>
        </div>
      </ucdlib-site-footer>
    </div>
  `;
}
