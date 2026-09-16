import { html } from "lit";

import SharedHtml from "../../utils/shared-html";
import { sharedStyles } from "../../styles/shared-styles";
import priorityLinksCss from "@ucd-lib/theme-sass/4_component/_priority-links.css";
import iconsCss from "@ucd-lib/theme-sass/4_component/_icons.css";
import categoryBrandCss from "@ucd-lib/theme-sass/4_component/_category-brand.css";
import verticalLinksCss from "@ucd-lib/theme-sass/4_component/_vertical-link.css";
import mobileBarCss from "@ucd-lib/theme-sass/4_component/_mobile-bar.css";
import navToggleCss from "@ucd-lib/theme-sass/4_component/_nav-toggle.css";
import headingsCss from "@ucd-lib/theme-sass/2_base_class/_headings.css";
import linksCss from "@ucd-lib/theme-sass/1_base_html/_links.css";
import buttonsCss from "@ucd-lib/theme-sass/2_base_class/_buttons.css";

export default function render() {
  return html`
<style>
  ${sharedStyles}
  ${priorityLinksCss}
  ${iconsCss}
  ${categoryBrandCss}
  ${verticalLinksCss}
  ${mobileBarCss}
  ${navToggleCss}
  ${headingsCss}
  ${linksCss}
  ${buttonsCss}

  :host {
    display: block;
    position: relative;
    background: var(--super-light-background-color);
  }
  a {
    text-decoration: none;
  }
  input {
    padding: 15px;
    display: block;
    width: 90%;
    border: 0;
  }

  .about-link-icon {
    position: absolute;
    z-index: 5;
    top: 25px;
    right: 25px;
  }

  .about-link-icon > iron-icon {
    height: 30px;
    width: 30px;
  }
  .container {
    padding: 25px 10px;
    background: white;
  }

  .search-box {
    z-index: 5;
    color: var(--inverse-text-color);
  }

  .search-box .main {
    padding: 20px;
    background-color: rgba(0, 38, 85, .8);
  }

  .search-box .main h1 {
    margin: 5px 0;
    line-height: 2.0rem;
  }

  .search-box .footer {
    padding: 10px 20px;
    color: white;
    font-size: 0.8rem;
    font-style: italic;
    font-weight: normal;
    line-height: 1.0rem;
    background-color: rgba(51, 83, 121, .8);
  }

  .search-box .footer a {
    color: var(--default-secondary-color);
  }

  .featured-collections {
    background-color: var(--color-aggie-blue-20);
    padding: var(--spacing-md) 0;
  }

  .featured-collections h1 {
    text-align: center;
    color: var(--color-aggie-blue);
  }

  .featured-collections .card-grid {
    margin: 0 auto;
    padding: 20px 0;
  }

  .card-grid {
    max-width: var(--max-width);
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-gap: var(--spacing-default);
  }


  iron-icon.search-icon {
    color: var(--default-primary-color);
  }

  iron-icon.info {
    fill: white;
  }

  #sample {
    background: linear-gradient(0deg, rgba(111,207,235,0.8), rgba(2, 40, 81, 0.8) 100%);
    background-size: cover;
    background-position: center;
    height: auto;
    padding:2rem 4rem 0 4rem;

  }

  #options {
    height: 150px;
    background-color:white;
    width: auto;
    padding: 2rem 4rem;
    vertical-align: middle;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #option{
    display: inline-block;
  }

  #top-header{
    display: inline-block;
    width: 100%;
  }
  #subtext{
    color:white;
    text-decoration: underline;
  }
  .hero-main .sub-search a:hover {
    text-decoration: none;
  }
  #watercolor{
    background-color:transparent;
    height: 8rem;
    margin-left:0px;
  }
  .about{
    text-align: center;
    background-color: var(--color-aggie-blue-40);
  }

  .featured-grid-container {
    display: grid;
    grid-template-columns: 40% 60%;
    background-color: transparent;
    padding: 10px;
  }
  .featured-grid-item {
    padding: 20px;
    font-size: 30px;
    text-align:left;

  }
  .about-grid-container {
    display: grid;
    grid-template-columns: 55% 45%;
    background-color: transparent;
    padding: 10px;
  }
  .about-grid-item {
    padding: 20px;
    font-size: 30px;

  }
  .collection-grid-container {
    display: grid;
    grid-template-columns: 33% 33% 33%;
    background-color: transparent;
    padding: 10px;
  }
  .collection-grid-item {
    padding: 20px;
    font-size: 30px;
  }
  .content {
    background-color:pink;
    margin:20px;
    width:fixed;
    padding: 0px 60px;
    text-align: left;
  }

  .vertical-link--circle .vertical-link__figure:after {
    opacity: 1 !important;
  }

  .about-collections {
    display: flex;
    /* height: 35rem; */
    background-color: var(--color-aggie-blue-80);
    background-image: url(/images/watercolors/watercolor-background-ucd-blue-20opacity.png);
    /* background-position: center;
    padding: 2rem 0 2rem; */
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: center top;
    /* background-attachment: fixed; */
  }

  /* STYLES BELOW ARE ACTUALLY USED. NEED TO AUDIT ANYTHING ABOVE */
  [hidden] {
    display: none;
  }
  .hero-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4rem;
    margin-top: 20px;
    padding: 0 5%;
  }
  .hero-top-left img {
    height: 32px;
    width: 186px;
  }

  .hero-top-right {
    display: inline-flex;
    align-items: center;
    font-weight: var(--fw-extrabold);
    font-weight: bold;
    font-size: 1rem;
    /* text-transform: uppercase; */
  }
  .hero-top-right a {
    color: var(--color-white);
  }
  .hero-top-right a:hover {
    color: var(--color-dams-secondary);
  }
  .hero-top-right .dot {
    margin: 0 1rem;
    width: 8px;
    height: 8px;
    min-width: 8px;
    min-height: 8px;
  }
  .hero-main h1 {
    margin-bottom: 1rem;
  }
  .hero-main .sub-heading {
    font-weight: var(--fw-p);
    margin-bottom: 3rem;
    margin-top: 1rem;
  }
  /* .hero-main .sub-heading a {
    color: var(--color-dams-secondary);
  }
  .hero-main .sub-heading a:hover, .hero-main .sub-heading a:focus {
    color: var(--color-a-hover);
  } */
  .hero-main app-search-box {
    max-width: 400px;
    margin-bottom: 1rem;
  }
  .hero-main .sub-search {
    color: var(--color-white);
    font-weight: bold;
    font-style: italic;
    font-size: .875rem;
    margin-bottom: 2rem;
  }
  .hero-main .sub-search a {
    color: var(--color-white);
    text-decoration: underline;
  }

  .priority-links {
    padding-top: 2rem;
  }

  .priority-links__item {
    padding-top: 0;
  }

  .browse-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: row wrap;
    /* padding-bottom: 4rem; */
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

  .recent{
    background-color: var(--color-white);
  }
  .recent h1 {
    margin-bottom: 0;
    text-align: center;
    margin-top: 0;
  }
  .fw-light {
    font-weight: 200;
    font-style: normal;
    margin: 0.75rem 0 0.25rem;
    padding: 0;
    line-height: 1.2;
  }

  .card-trio {
    display: grid;
    grid-template-columns: auto;
    grid-gap: var(--spacing-sm);
  }
  .card-trio dams-collection-card {
    margin-bottom: var(--spacing-default);
  }
  .featured {
    background-color: var(--color-aggie-blue-20);
    padding-top: 4rem;
  }
  .featured h1 {
    margin-bottom: var(--spacing-default);
    text-align: center;
    margin-top: 0;
  }
  .featured dams-watercolor-overlay {
    height: 100px;
  }
  dams-highlighted-collection {
    margin: 40px 0;
  }
  .fg-header {
    display: grid;
    grid-gap: var(--spacing-default);
    grid-template-columns: auto;
    /* margin-bottom: var(--spacing-sm); */
    /* margin-bottom: 2rem 0; */
  }
  .fg-header h3 {
    margin: 0;
  }

  .fg-header.centered {
    display: block;
    width: 66%;
    margin: auto;
    text-align: center;
  }
  .fg-header.centered h3 {
    margin-bottom: 1rem;
  }

  .fg-header.left-aligned {
    display: block;
    width: 66%;
    margin: auto;
    text-align: left;
  }
  .fg-header.left-aligned h3 {
    text-align: left;
    margin-bottom: 1rem;
  }
  .fg-header.left-aligned div {}

  .fg-header.split {}
  .fg-header.split h3 {}
  .fg-header.split div {}

  .featured-collections-public {
    padding: 0 5%;
  }

  .featured-collections-public .featured-more {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: var(--spacing-default) 0 0;
    padding-bottom: 3rem;
  }
  .splat-stars {
    width: 9rem;
  }

  .about-content .btn--alt {
    padding-top: 0;
    padding-bottom: 0;
  }

  /* .featured-group {
    padding: 1rem 0;
  } */

  .featured-collections-public > * {
    padding: 1rem 0;
  }

  .featured-collections-public .two-four,
  .featured-collections-public .three-five {
    width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: auto;
    grid-gap: var(--spacing-sm);
  }

  .featured-collections-public .three-five {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .featured-collections-public .two-four {    
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 75%;
  }

  @media (max-width: 992px) {
    .featured-collections-public .three-five {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .featured-collections-public .two-four {    
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }
  }

  @media (max-width: 767px) {
    /* mobile */
    .featured-group .card-trio {
      margin-right: var(--spacing-sm);
      margin-left: var(--spacing-sm);
    }
    .about-collections {
      display: block;
      height: auto;
    }
    .tree-illustration {
      text-align: center;
      padding-top: 2rem;
    }
    .about-collections .tree-illustration img {
      float: none;
      padding: none;
    }    
    .fg-header.centered {
      display: block;
      width: 100%;
      margin: initial;
      text-align: left
    }

    .featured-collections-public .three-five {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .featured-collections-public .two-four {    
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }
  .about-content {
    padding: 0 5% 2rem 5%;
  }

  @media (min-width: 768px) {
    /* tablet */
    .card-trio {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .card-trio.three-total dams-collection-card:nth-child(1) {
      grid-column: 1 / span 2;
    }

    .fg-header {
      grid-template-columns: 37% 55%;
      padding: 1rem 0;
    }
    .featured-group .card-trio {
      margin-right: 0;
      margin-left: 0;
    }
    .fg-header h3 {
      text-align: center;
    }
  }

  @media (min-width: 991px) {
    /* desktop */
    .card-trio {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .card-trio.three-total dams-collection-card:nth-child(1) {
      grid-column: auto;
    }
  }

  .featured-more a.btn--primary {
    color: var(--color-aggie-blue);
    padding-top: 0;
    padding-bottom: 0;
  }

  .tree-illustration {
    /* padding: 3rem; */
    margin: auto;
  }

  .tree-illustration img {
    float: right;
    padding-right: 1rem;
  }

  .about-content .header-dots {
    margin: 0;
    align-items: start;
    padding-bottom: 1rem;
  }

  .about-content h1 {
    margin-bottom: .3rem;
  }

  .about-content {
    /* padding-right: 2rem; */
    margin: auto;
  }

  .about-content h1,
  .about-content p {
    color: var(--color-white);
  }

  .about-content .btn--more-about {
    background-color: var(--color-white);
    color: var(--color-aggie-blue-80);
  }

  .about-content .btn--more-about:hover {
    color: var(--color-aggie-blue-80);
  }

  dams-hero {
    position: relative;
    z-index: 1000;
  }

  .edit-overlay {
    background: white;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: .55;
    z-index: 400;
  }

  .right-panel {
    position: absolute;
    right: 4rem;
    z-index: 500;
  }

  .icon-wrapper {
    height: 50px;
    width: 50px;
    background-color: var(--color-aggie-blue-70);
    border-radius: 50%;
    display: inline-block;
    margin-left: .3rem;
    cursor: pointer;
  }

  .icon-wrapper ucdlib-icon {
    fill: white;
    width: 50%;
    height: 50%;
    margin: auto;
    padding-top: 0.6rem;
    z-index: 500;
  }

  .icon-wrapper.edit {
    background-color: var(--color-aggie-blue);
  }

  .icon-wrapper:hover {
    background-color: var(--color-aggie-blue);
  }

  .icon-wrapper.edit:hover {
    background-color: var(--color-aggie-gold);
  }

  .icon-wrapper.edit:hover ucdlib-icon {
    fill: var(--color-aggie-blue);
  }

  admin-featured-collections {
    padding: 4rem 5%;
  }

  .hero-main.site-frame,
  .recent.site-frame {
    width: 90%;
    margin: 0 auto;
  }

  @media (min-width: 1060px) {
    .hero-top {
      margin-top: 40px;
    }
  }

  @media (min-width: 1601px) {
    .hero-top {
      margin-top: 40px;
    }
  }

  @media (min-width: 520px) {
    ucd-theme-header {
      display: none;
    }
  }

  @media (max-width: 519px) {
    .hero-top {
      display: none;
    }
    ucd-theme-header {
      position: relative;
      top: -19px;
    }
    h1 {
      font-size: 2rem;
      font-weight: 600;
    }
    .hero-main .sub-heading {
      font-size: 1.2rem;
      font-weight: 200;
    }
  }

  @media (max-width: 767px) {
    h1 {
      font-size: 2rem;
      font-weight: 600;
    }
    .hero-main .sub-heading {
      font-size: 1.2rem;
      font-weight: 200;
    }
  }

  .hero-top-right a {
    text-decoration: none;
  }

  a.browse-collections {
    height: 3rem;
    min-height: 3rem;
  }

</style>

<dams-hero .srcOptions="${this.heroImgOptions}" selected-src-url="${this.heroUrl}" @src-change="${
    this._onHeroChange
  }">
  <div class="hero-content">

    <ucd-theme-header>
      <ucd-theme-primary-nav>
        <a href="/" class="home-link" mobile-only>Home</a>
        <ul link-text="Browse" href="/browse">
          <li><a href="/browse/collections/15">Collections</a></li>
          <li><a href="/search">Items</a></li>
          <li><a href="/browse/creator/30">Creators</a></li>
          <li><a href="/browse/format/30">Formats</a></li>
          <li><a href="/browse/subject/30">Subjects</a></li>
        </ul>
        <a href="/about">About</a>
      </ucd-theme-primary-nav>
    </ucd-theme-header>

    <div class="hero-top site-frame">
      <div class="hero-top-left"><a href="https://ucdavis.edu"><img src="/images/logos/ucdavis_logo_gold.png"></a></div>
      <div class="hero-top-right">
        <a href="/browse">Browse</a>
        <span class="dot"></span>
        <a href="/search-tips">Search Tips</a>
        <span class="dot"></span>
        <a href="/about">About</a>
      </div>
    </div>

    <div class="hero-main site-frame">
      <h1 class="color-light">Digital Collections</h1>
      <h4 class="sub-heading h4 color-light">Explore digitized items from the <a href="https://library.ucdavis.edu/">UC Davis Library</a> collections.</h4>
      <app-search-box
        id="searchBox"
        @search="${this._onSearch}"
        placeholder="search">
        <iron-icon icon="fin-icons:search" class="search-icon" slot="button-content"></iron-icon>
      </app-search-box>
      <div class="sub-search">
        Featured Image: <a href="${this.heroItemUrl}">${this.heroItemLabel}</a> | <a href="${this.heroCollectionUrl}">${this.heroCollectionLabel}</a>
      </div>
    </div>
  </div>

</dams-hero>

<!-- <app-welcome-modal
  ?hidden="${!this.showWelcomeModal}"
  .title="${this.welcomeModalTitle}"
  .content="${this.welcomeModalContent}"
  @ok=${this._onWelcomeModalClose}>
</app-welcome-modal> -->

<div class="edit-overlay" ?hidden="${!this.editMode || !this.isUiAdmin}"></div>
<section class="browse-buttons site-frame">
  <div class="priority-links">
    <div class="priority-links__item">
      <a class="vertical-link vertical-link--circle category-brand--secondary" href="/browse/collections/15">
        <div class="vertical-link__figure">
          <ucdlib-icon class="vertical-link__image" icon="ucdlib-dams:fa-box-archive"></ucdlib-icon>
        </div>
        <div class="vertical-link__title">Collections</div>
      </a>
    </div>
    <div class="priority-links__item">
      <a class="vertical-link vertical-link--circle category-brand--secondary" href="/search">
        <div class="vertical-link__figure">
          <ucdlib-icon class="vertical-link__image" icon="ucdlib-dams:photo-stack"></ucdlib-icon>
        </div>
        <div class="vertical-link__title">All Items</div>
      </a>
    </div>
    <div class="priority-links__item">
      <a class="vertical-link vertical-link--circle category-brand--secondary" href="/browse/creator/30">
        <div class="vertical-link__figure">
          <ucdlib-icon class="vertical-link__image" icon="ucdlib-dams:fa-wand-magic-sparkles"></ucdlib-icon>
        </div>
        <div class="vertical-link__title">Creators</div>
      </a>
    </div>
    <div class="priority-links__item">
      <a class="vertical-link vertical-link--circle category-brand--secondary" href="/browse/format/30">
        <div class="vertical-link__figure">
          <ucdlib-icon class="vertical-link__image" icon="ucdlib-dams:fa-photo-film"></ucdlib-icon>
        </div>
        <div class="vertical-link__title">Formats</div>
      </a>
    </div>
    <div class="priority-links__item">
      <a class="vertical-link vertical-link--circle category-brand--secondary" href="/browse/subject/30">
        <div class="vertical-link__figure">
          <ucdlib-icon class="vertical-link__image" icon="ucdlib-dams:fa-star"></ucdlib-icon>
        </div>
        <div class="vertical-link__title">Subjects</div>
      </a>
    </div>
  </div>

</section>

<section class="recent site-frame" ?hidden="${
    this.recentCollections.length === 0
  }">
  <h1>Recently Added<br><span class="fw-light">Collections</span></h1>
  ${SharedHtml.headerDots()}
  <div class="card-trio ${
    this.recentCollections.length === 3 ? "three-total" : ""
  }">
  ${this.recentCollections.map(
    (graph) =>
      html`
        <dams-collection-card
          img-src="${graph.vcData.images?.[0] || ''}"
          card-title="${graph.vcData.title || ''}"
          item-ct="${graph.vcData.count ? graph.vcData.count : 0}"
          href="${graph.vcData.id}"
        ></dams-collection-card>
      `
  )}
  </div>
</section>

<section class="featured site-frame">
  <div class="right-panel">
    <div class="icon-wrapper" ?hidden="${
      this.editMode || !this.isUiAdmin
    }" @click="${this._onEditClicked}">
      <ucdlib-icon icon="ucdlib-dams:fa-pen"></ucdlib-icon>
    </div>
    <div class="icon-wrapper edit" ?hidden="${
      !this.editMode || !this.isUiAdmin
    }" @click="${this._onSaveClicked}">
      <ucdlib-icon icon="ucdlib-dams:fa-floppy-disk"></ucdlib-icon>
    </div>
    <div class="icon-wrapper edit" ?hidden="${
      !this.editMode || !this.isUiAdmin
    }" @click="${this._onCancelEditClicked}">
      <ucdlib-icon icon="ucdlib-dams:fa-xmark"></ucdlib-icon>
    </div>
  </div>
  <h1>Featured <span class="fw-light">Collections</span></h1>
  <div style="text-align:center;">
    <img class="splat-stars" src="/images/watercolors/watercolor-splat-homepage-stars.png">
  </div>

  <admin-featured-collections ?hidden="${
    !this.editMode || !this.isUiAdmin
  }"></admin-featured-collections>
  
  <div class="featured-collections-public" ?hidden="${this.editMode}">
    ${this.displayData.map(
      (data) => html`
        ${data.type === "single"
          ? html`
              <dams-highlighted-collection
                collection-id="${data.collectionId}"
                collection-desc="${data.description}"
                ?image-right="${data.placement === "right"}"
              >
              </dams-highlighted-collection>
            `
          : ""}
        ${data.type === "text"
          ? html`
              <div class="featured-group">
                <div class="fg-header ${data.placement}">
                  <h3 class="heading--primary">${data.heading}</h3>
                  <ucdlib-md id="md">
                    <ucdlib-md-content>
                      ${data.description}
                    </ucdlib-md-content>
                  </ucdlib-md>
                </div>
              </div>
            `
          : ""}
        ${data.type === "cards"
          ? html`
              <div
                class="card-trio ${data.collectionIds.length === 3 ? "three-total" : ""} ${[3, 5].includes(data.collectionIds.length) ? "three-five" : ""} ${[2, 4].includes(data.collectionIds.length) ? "two-four" : ""}">
                ${data.collectionIds.map(
                  (collection) => html`
                    <dams-collection-card
                      data-id="${collection.selected}"
                    ></dams-collection-card>
                  `
                )}
              </div>
            `
          : ""}
      `
    )}

    <div class="featured-more">
      <a href="/browse/collections" class="btn btn--primary btn--lg browse-collections">Browse all collections</a>
    </div>
  </section>

  <section class="about-collections">
    <div class="tree-illustration">
      <img src="/images/tree-bike-illustration.png" width="80%" />
    </div>
    <div class="about-content">
      <h1>About<br><span class="fw-light">Digital Collections</span></h1>
      ${SharedHtml.headerDots()}
      <p style="padding-bottom: 1rem;">
        UC Davis Digital Collections provide online access to digitized or born-digital materials 
        from the UC Davis Library, with a particular focus on the rare and unique materials in 
        its Archives and Special Collections. These documents, images, audio and video files 
        offer a rich resource for exploration by scholars and the public alike.
      </p>
      <a href="/about" class="btn--more-about btn--alt btn--round">More about this project</a>
    </div>
  </section>
`;
}
