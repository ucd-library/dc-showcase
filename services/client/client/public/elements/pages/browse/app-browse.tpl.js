import { html } from "lit";

import { sharedStyles } from "../../styles/shared-styles";
import SharedHtml from '../../utils/shared-html';

import priorityLinksCss from "@ucd-lib/theme-sass/4_component/_priority-links.css";
import iconsCss from "@ucd-lib/theme-sass/4_component/_icons.css";
import categoryBrandCss from "@ucd-lib/theme-sass/4_component/_category-brand.css";
import verticalLinksCss from "@ucd-lib/theme-sass/4_component/_vertical-link.css";
import buttonsCss from "@ucd-lib/theme-sass/2_base_class/_buttons.css";

export default function render() {
  return html`
    <style>
      ${sharedStyles}
        ${priorityLinksCss}
        ${categoryBrandCss}
        ${verticalLinksCss}
        ${iconsCss}
        ${buttonsCss}
        :host {
        display: block;
        position: relative;
      }

      .vertical-link--circle .vertical-link__figure:after {
        opacity: 1 !important;
      }

      /* STYLES BELOW ARE ACTUALLY USED. NEED TO AUDIT ANYTHING ABOVE */
      [hidden] {
        display: none;
      }

      .browse-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-flow: row wrap;
        background-color: var(--color-white);
      }
      .browse-buttons > div {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        width: 75%;
      }
      .browse-buttons app-icons {
        margin: 0 10px;
      }
      .browse-buttons .vertical-link__title {
        color: var(--color-aggie-blue);
        text-transform: capitalize;
      }
      .browse-buttons .vertical-link__figure:before,
      .browse-buttons .vertical-link__figure:after {
        box-sizing: border-box;
      }
      .browse-buttons .vertical-link--circle .vertical-link__figure {
        background-color: var(--color-white);
        margin-bottom: 0.75rem;
      }

      .browse-buttons .vertical-link--circle .vertical-link__figure:hover {
        background-color: var(--color-aggie-gold);
      }

      @media (max-width: 1070px) {
        .browse-buttons > div {
          width: 100%;
        }
      }

      .priority-links {
        padding: 0 0 1rem;
      }

      .fw-light {
        font-weight: 200;
        font-style: normal;
        margin: 0.75rem 0 0.25rem;
        padding: 0;
        line-height: 1.2;
      }

      app-browse .title-section {
        text-align: center;
        border: none;
      }

      .header-icon {
        width: 6rem;
      }

      .calisphere-section {
        display: flex;
        align-items: center;
        padding: 0 2rem;
        gap: 2rem;
      }

      .calisphere-section > div {
        flex: 1;
      }

      .calisphere-section img {
        max-width: 100%;
      }

      .calisphere-extra-info {
        margin-bottom: 0;
        color: var(--black, #000);
        font-size: 1rem;
        font-style: normal;
        font-weight: 400;
        line-height: 30.74px;
      }

      .calisphere-section h2 {
        color: var(--ucd-blue-100, #022851);
        margin-bottom: 1rem;
      }

      .calisphere-section .header-dots {
        margin: 0;
      }

      .browse-selection-section p.calisphere-link {
        color: var(--ucd-black-70, #4C4C4C);
        font-size: .875rem;
        font-style: italic;
        line-height: 26px;
        padding: 2rem 0 3rem 2rem;
      }

      .browse-selection-section p.calisphere-link a {
        text-decoration: underline;
      }

      .browse-selection-section p.calisphere-link a:hover {
        color: #00b2e3;
      }

      a.explore-calisphere {
        padding: 0 1.5rem 0 .75rem;
        margin-top: 2rem;
      }

      @media (max-width: 768px) {
        .calisphere-section {
          display: block;
        }
      } 
    </style>

    <div class="browse-selection-section" ?hidden="${this.page !== "/browse"}">
      <div class="title-section">
        <h1>Browse<br /><span class="fw-light">Digital Collections</span></h1>
      </div>
      <section class="browse-buttons site-frame">
        <div class="priority-links">
          <div class="priority-links__item">
            <a
              class="vertical-link vertical-link--circle category-brand--secondary"
              href="/browse/collections/15"
            >
              <div class="vertical-link__figure">
                <!-- <ucdlib-icon class="vertical-link__image" src="http://localhost:3000/images/ucd-logo.svg"></ucdlib-icon> -->
                <!-- <ucdlib-icon class="vertical-link__image" icon="ucd-public:fa-box-archive"></ucdlib-icon>  -->
                <ucdlib-icon
                  class="vertical-link__image"
                  icon="ucdlib-dams:fa-box-archive"
                ></ucdlib-icon>
              </div>
              <div class="vertical-link__title">Collections</div>
            </a>
          </div>
          <div class="priority-links__item">
            <a
              class="vertical-link vertical-link--circle category-brand--secondary"
              href="/search"
            >
              <div class="vertical-link__figure">
                <ucdlib-icon
                  class="vertical-link__image"
                  icon="ucdlib-dams:photo-stack"
                ></ucdlib-icon>
              </div>
              <div class="vertical-link__title">All Items</div>
            </a>
          </div>
          <div class="priority-links__item">
            <a
              class="vertical-link vertical-link--circle category-brand--secondary"
              href="/browse/creator/30"
            >
              <div class="vertical-link__figure">
                <ucdlib-icon
                  class="vertical-link__image"
                  icon="ucdlib-dams:fa-wand-magic-sparkles"
                ></ucdlib-icon>
              </div>
              <div class="vertical-link__title">Creators</div>
            </a>
          </div>
          <div class="priority-links__item">
            <a
              class="vertical-link vertical-link--circle category-brand--secondary"
              href="/browse/format/30"
            >
              <div class="vertical-link__figure">
                <ucdlib-icon
                  class="vertical-link__image"
                  icon="ucdlib-dams:fa-photo-film"
                ></ucdlib-icon>
              </div>
              <div class="vertical-link__title">Formats</div>
            </a>
          </div>
          <div class="priority-links__item">
            <a
              class="vertical-link vertical-link--circle category-brand--secondary"
              href="/browse/subject/30"
            >
              <div class="vertical-link__figure">
                <ucdlib-icon
                  class="vertical-link__image"
                  icon="ucdlib-dams:fa-star"
                ></ucdlib-icon>
              </div>
              <div class="vertical-link__title">Subjects</div>
            </a>
          </div>
        </div>
      </section>
      <div class="calisphere-section">
        <div class="current-index-panel">
          <img src="/images/watercolor-schwier-87293-d31v5bn6t.jpg" alt="Calisphere Logo" />
        </div>
        <div>
          <h2>Looking for more?</h2>

          ${SharedHtml.headerDots()}

          <p class="calisphere-extra-info">
            Additional items from the library's Archives and Special Collections 
            are available through the University of California's Calisphere.
          </p>
          <a href="https://calisphere.org/UCD/collections" alt="Explore Calisphere" class="btn btn--alt btn--round explore-calisphere">Explore Calisphere</a>
        </div>
      </div>

      <p class="calisphere-link">Featured Image: <a href="/item/ark:/87293/d31v5bn6t" alt="Schwier (Hilda) Photograph Album">Schwier (Hilda) Photograph Album</a></p>
    </div>

    <app-browse-by
      id="collections"
      label="Collection"
      facet-query-name=""
      ?hidden="${this.page !== "/browse/collections"}"
    >
      <img
        class="header-icon"
        slot="header-icon"
        src="/images/watercolors/watercolor-splat-gold-collections.png"
      />
    </app-browse-by>
    <app-browse-by
      id="subject"
      label="Subject"
      facet-query-name="@graph.subjects.name"
      ?hidden="${this.page !== "/browse/subject"}">
      <img
        class="header-icon"
        slot="header-icon"
        src="/images/watercolors/watercolor-splat-green-subjects.png"
      />
    </app-browse-by>
    <app-browse-by
      id="creator"
      label="Creator"
      facet-query-name="@graph.creator.name"
      ?hidden="${this.page !== "/browse/creator"}">
      <img
        class="header-icon"
        slot="header-icon"
        src="/images/watercolors/watercolor-splat-red-creators.png"
      />
    </app-browse-by>
    <app-browse-by
      id="format"
      label="Format"
      facet-query-name="@graph.fileFormatSimple"
      ?hidden="${this.page !== "/browse/format"}">
      <img
        class="header-icon"
        slot="header-icon"
        src="/images/watercolors/watercolor-splat-blue-formats.png"
      />
    </app-browse-by>
  `;
}
