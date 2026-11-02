import { html } from 'lit';
import { repeat } from 'lit-html/directives/repeat.js';
import utils from "../../../../lib/utils";

export default function render() {
  const filteredCues = this._getFilteredCues();

  return html`
<style>
  :host {
    display: block;
    box-sizing: border-box;
  }

  .transcript-panel {
    box-sizing: border-box;
    background-color: var(--color-aggie-gold-60, #FFECB2);
    border-radius: 1.5rem;
    padding: 1.5rem;
  }

  .transcript-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: .5rem;
  }

  .transcript-heading {
    margin: 0;
    font-size: 1.25rem;
    color: var(--color-aggie-blue, #002851);
  }

  .auto-scroll-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-aggie-blue, #002851);
    white-space: nowrap;
  }

  /* toggle switch - matches the disclaimer toggle in app-collection.tpl.js */
  .toggle-switch {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-button {
    width: 35px;
    height: 13px;
    border-radius: 30px;
    cursor: pointer;
    position: relative;
    background-color: var(--color-black-20);
  }

  .toggle-button::before {
    position: absolute;
    content: '';
    background-color: white;
    width: 22px;
    height: 22px;
    border-radius: 22px;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    transition: 0.3s ease-in-out;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }

  .toggle-switch input:checked + .toggle-button {
    background-color: var(--color-aggie-blue-60);
  }
  .toggle-switch input:checked + .toggle-button::before {
    transform: translateY(-50%) translateX(.8rem);
    background-color: var(--color-aggie-blue-80);
  }
  .toggle-switch input {
    display: none;
  }

  .transcript-lines {
    max-height: 500px;
    overflow-y: auto;
  }

  /* matches the bookreader search panel's scrollbar (.search-side-panel .overflow) */
  .transcript-lines::-webkit-scrollbar {
    width: 10px;
  }
  .transcript-lines::-webkit-scrollbar-track {
    background: var(--color-aggie-gold-70);
  }
  .transcript-lines::-webkit-scrollbar-thumb {
    border-radius: 6px;
    background: var(--color-aggie-gold);
  }

  /* basic support for FF. Chrome/Safari should support -webkit styles above */
  @supports (scrollbar-color: red blue) {
    .transcript-lines {
      scrollbar-color: var(--color-aggie-gold) var(--color-aggie-gold-70);
      scrollbar-width: thin;
    }
  }

  .transcript-search-wrap {
    position: relative;
    margin-bottom: 0.75rem;
  }

  .transcript-search {
    width: 100%;
    height: 2.5rem;
    box-sizing: border-box;
    padding: 0.6rem 2.25rem 0.6rem 0.9rem;
    border: none;
    border-radius: 5px;
    background: #fff;
    font-family: inherit;
    font-size: 0.9rem;
    color: var(--color-aggie-blue-80, #13639E);
  }

  .transcript-search::placeholder {
    color: var(--color-aggie-blue-80, #13639E);
    opacity: 1;
  }

  .transcript-search:focus-visible {
    outline: none;
    background: var(--color-aggie-gold-10, #FFF9E6);
  }

  .transcript-search-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    --ucdlib-icon-width: 1.25rem;
    --ucdlib-icon-height: 1.25rem;
    fill: var(--color-aggie-gold, #FFBF00);
    pointer-events: none;
  }

  .transcript-empty {
    margin: 0;
    padding: 0.5rem 0.25rem;
    font-style: italic;
    color: var(--color-aggie-blue-70, #13639e);
  }

  .transcript-line {
    display: block;
    width: 100%;
    box-sizing: border-box;
    text-align: left;
    background: none;
    border: none;
    border-radius: 1rem;
    padding: 0.5rem;
    cursor: pointer;
    font: inherit;
    color: var(--color-aggie-blue, #002851);
  }

  .transcript-line:hover {
    background: var(--color-aggie-gold-70, #FFDF80);
  }

  .transcript-line:hover .transcript-time {
    background: var(--color-aggie-gold-70, #FFDF80);
  }

  .transcript-line:focus-visible {
    outline: 2px solid var(--color-aggie-blue, #002851);
    outline-offset: -2px;
  }

  .transcript-time {
    display: inline-block;
    margin-bottom: 0.25rem;
    padding: 0.15rem 0.6rem;
    border-radius: 9999px;
    background: var(--color-aggie-gold-70, #FFDF80);
    color: var(--color-aggie-blue-80, #13639E);
    font-size: 0.875rem;
  }

  .transcript-line.active {
    font-weight: 700;
  }

  .transcript-line.active .transcript-time {
    background: var(--color-aggie-gold, #FFBF00);
  }

  .transcript-text {
    display: block;
  }

  @media(max-width: 768px) {
    .transcript-lines {
      max-height: 300px;
    }

    /* mobile bottom sheet - fixed to the viewport instead of in-flow, height
       driven by --sheet-height (set live during drag, or to a snap point at rest) */
    .transcript-panel.mobile {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      box-sizing: border-box;
      height: var(--sheet-height, 42vh);
      max-height: 100vh;
      border-radius: 1.5rem 1.5rem 0 0;
      padding: 0 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 -4px 16px rgba(0, 0, 0, .2);
      transition: height .3s ease-out;
      z-index: 1000;
    }

    /* suppress the transition during an active drag so the sheet tracks the
       finger 1:1 instead of lagging behind it */
    .transcript-panel.mobile.dragging {
      transition: none;
    }

    .sheet-handle-row {
      display: flex;
      justify-content: center;
      padding: .75rem 0;
      touch-action: none;
      /* touch-action isn't inherited - the drag actually starts on this row
         (a bigger, easier-to-hit target than the thin bar alone), so it also
         needs its own touch-action:none or the browser's native touch-scroll
         gesture wins the race against our pointermove handler */
      cursor: grab;
    }

    .sheet-handle {
      width: 40px;
      height: 5px;
      border-radius: 9999px;
      background: var(--color-aggie-orange, #FFBF00);
      pointer-events: none;
    }

    .mobile-header {
      margin-bottom: .5rem;
    }

    .mobile-header-actions {
      display: flex;
      align-items: center;
      gap: .5rem;
    }

    .mobile-header .auto-scroll-toggle {
      background: var(--color-aggie-gold-70, #FFDF80);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
    }

    .auto-scroll-label-short {
      display: none;
    }

    @media(max-width: 380px) {
      .auto-scroll-label-full {
        display: none;
      }

      .auto-scroll-label-short {
        display: inline;
      }
    }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: none;
      cursor: pointer;
      color: var(--color-aggie-blue, #002851);
      fill: var(--color-aggie-blue, #002851);
    }

    .icon-btn ucdlib-icon {
      --ucdlib-icon-width: 1.25rem;
      --ucdlib-icon-height: 1.25rem;
    }

    .transcript-panel.mobile .transcript-lines {
      flex: 1 1 auto;
      max-height: none;
    }
  }
</style>

<section class="transcript-panel ${this.isMobile ? 'mobile' : ''}" aria-label="${this.label}">
  ${this.isMobile ? html`
    <div class="sheet-handle-row" @pointerdown="${(e) => this._onHandlePointerDown(e)}">
      <div class="sheet-handle" aria-hidden="true"></div>
    </div>
    <div class="transcript-panel-header mobile-header">
      <h5 class="transcript-heading">Transcript</h5>
      <div class="mobile-header-actions">
        <div class="auto-scroll-toggle">
          <span class="auto-scroll-label-full">Autoscroll</span>
          <span class="auto-scroll-label-short">Auto</span>
          <div class="toggle-switch">
            <input
              type="checkbox"
              id="autoScrollToggleMobile"
              ?checked="${this.autoScroll}"
              @change="${(e) => this._onAutoScrollToggle(e)}">
            <label for="autoScrollToggleMobile" class="toggle-button"></label>
          </div>
        </div>
        <button
          type="button"
          class="icon-btn"
          aria-label="Search transcript"
          aria-expanded="${this.searchOpen}"
          @click="${() => this._onSearchToggle()}">
          <ucdlib-icon icon="ucdlib-dams:fa-magnifying-glass"></ucdlib-icon>
        </button>
        <button
          type="button"
          class="icon-btn"
          aria-label="Close transcript"
          @click="${() => this._onSheetClose()}">
          <ucdlib-icon icon="ucdlib-dams:fa-xmark"></ucdlib-icon>
        </button>
      </div>
    </div>
  ` : html`
    <div class="transcript-panel-header">
      <h5 class="transcript-heading">Transcript</h5>
      <div class="auto-scroll-toggle">
        <span>Autoscroll</span>
        <div class="toggle-switch">
          <input
            type="checkbox"
            id="autoScrollToggle"
            ?checked="${this.autoScroll}"
            @change="${(e) => this._onAutoScrollToggle(e)}">
          <label for="autoScrollToggle" class="toggle-button"></label>
        </div>
      </div>
    </div>
  `}
  <div class="transcript-lines">
    ${(!this.isMobile || this.searchOpen) ? html`
      <div class="transcript-search-wrap">
        <input
          type="text"
          class="transcript-search"
          placeholder="search"
          .value="${this.search}"
          @input="${(e) => this._onSearch(e)}"
          aria-label="Search transcript">
        <ucdlib-icon icon="ucdlib-dams:fa-magnifying-glass" class="transcript-search-icon"></ucdlib-icon>
      </div>
    ` : ''}
    ${filteredCues.length ? repeat(filteredCues, (cue) => cue.id, (cue) => html`
      <button
        type="button"
        class="transcript-line ${cue.id === this.activeCueId ? 'active' : ''}"
        aria-current="${cue.id === this.activeCueId}"
        @click="${() => this._onLineClick(cue)}">
        <span class="transcript-time">${utils.formatTime(cue.start)}</span>
        <span class="transcript-text">${cue.text}</span>
      </button>
    `) : html`<p class="transcript-empty">No matching lines</p>`}
  </div>
</section>
`;
}
