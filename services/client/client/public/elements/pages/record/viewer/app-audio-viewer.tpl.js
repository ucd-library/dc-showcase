import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit-html/directives/repeat.js';
import plyrCss from "plyr/dist/plyr.css"

export default function render() {
return html`
<style>
  :host {
    display: none;
    width: 60%;
    margin: auto;
    padding: 20px 0 0 0;
    box-sizing: border-box;
  }

  :host app-share-btn {
    fill: var(--color-aggie-blue-80);
  }

  [hidden] {
    display: none !important;
  }

  .button {
    background-color: var(--color-aggie-blue-80);
    border-radius: 50%;
    display: inline-block;
    width: 50px;
    height: 50px;
    margin-left: 0.4rem;
  }

  .container {
    display: block;
    width: 100%;
  }

  #audio_poster {
    display: none;
    margin: 0 auto;
    margin-bottom: 10px;
    max-width: 400px;
    height: 400px;
    border: 1px solid black;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .layout {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .layout.multimedia {
    border-bottom: none;
  }

  .plyr--audio {
    flex: 1 1 auto;
    min-width: 0;
    border-radius: 5px;
  }

  .plyr--full-ui input[type=range] {
    color: #daaa00 !important;
  }

  button.plyr__control.plyr__control--overlaid,
  button.plyr__control.plyr__control:hover {
    background: var(--color-dams-secondary, #FFBF00);
  }
  .plyr--full-ui input[type=range] {
    color: var(--color-dams-secondary, #FFBF00) !important;
  }

  .volume-icon {
    fill: var(--color-aggie-blue-50, #B0D0ED);
    height: 96px;
    margin: 2rem auto;
  }

  .tooltip {
    cursor: pointer;
    position: relative;
  }

  .tooltip:hover:before {
    content: attr(data-tooltip-text);
    position: absolute;
    bottom: 60px;
    right: 50%;
    transform: translateX(50%);
    padding: 5px 10px;
    border-radius: 5px;
    background: var(--color-aggie-blue);
    color: #fff;
    font-family: inherit;
    font-size: 1rem;
    font-weight: bold;
    white-space: nowrap;
    opacity: 0;
    transition: .2s opacity ease-out;
    z-index: 10;
  }

  .tooltip:hover:after {
    content: "";
    position: absolute;
    bottom: 50px;
    right: 20px;
    border: 5px solid var(--color-aggie-blue);
    border-color: var(--color-aggie-blue) transparent transparent transparent;
    opacity: 0;
    transition: .2s opacity ease-out;
  }

  .tooltip:hover:before,
  .tooltip:hover:after {
    opacity: 1;
  }

  .tooltip:has(> app-share-btn[popup]):hover:before,
  .tooltip:has(> app-share-btn[popup]):hover:after {
    display: none;
  }

  .button:hover,
  .button:has(> app-share-btn[popup]) {
    background-color: var(--color-aggie-blue);
  }

  .transcript-link {
    display: flex;
    justify-content: center;
    margin: 0.75rem 0;
  }

  .transcript-link .transcript-label {
    text-wrap: nowrap;
  }

  .transcript-link-inner {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: #13639e;
    font-size: 1rem;
    text-decoration: underline;
  }

  .transcript-link-inner ucdlib-icon {
    flex: none;
    --ucdlib-icon-width: 1.1rem;
    --ucdlib-icon-height: 1.1rem;
    fill: #13639e;
  }

  .media-wrap {
    border-bottom: 6px dotted var(--color-aggie-gold);
    padding-bottom: 0.7rem;
  }

  .media-wrap.multimedia {
    border-bottom: none;
  }

  .button-row {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  .transcript-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.4rem;
    height: 50px;
    box-sizing: border-box;
    padding: 0 1.25rem;
    border: none;
    border-radius: 9999px;
    background: var(--color-aggie-blue-80, #13639e);
    color: #fff;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
  }

  .transcript-toggle:hover {
    background: var(--color-aggie-blue, #002851);
  }

  .transcript-toggle:focus-visible {
    outline: 2px solid var(--color-dams-secondary, #FFBF00);
    outline-offset: 2px;
  }

  app-transcript-panel {
    margin-top: .5rem;
  }

  @media(max-width: 768px) {
    :host {
      width: 90%;
    }

    /* fullscreen mobile sheet mode - stays in normal document flow (no
       position:fixed - that fought the site header's own stacking
       context/sticky positioning) and instead relies on
       _onTranscriptSheetChange scrolling this element to the top of the
       viewport plus locking page scroll there, with a solid white
       background/padding so it visually covers whatever it's now sitting
       flush against. Unlike video, the audio player area itself doesn't
       shrink - only the button row is hidden, since the sheet's own close
       icon takes over that job. position:relative (still in-flow) plus a
       z-index above the site header's own 1000 makes sure this wins the
       stacking order if the header is sticky/fixed and would otherwise still
       render on top of it */
    :host([fullscreen]) {
      position: relative;
      z-index: 1001;
      width: 100%;
      margin: 0;
      padding: .25rem;
      background: #fff;
    }

    :host([fullscreen]) .media-wrap {
      border-bottom: none;
      padding-bottom: 0;
    }

    :host([fullscreen]) .button-row {
      display: none;
    }
  }

  ${plyrCss}
</style>
<div class="container">
  <div id="sprite-plyr" style="display: none;"></div>
  <div id="audio_poster"></div>

  <div class="media-wrap ${this.isMultimedia ? 'multimedia' : ''}">
    <ucdlib-icon class="volume-icon" icon="ucdlib-dams:fa-volume-high"></ucdlib-icon>
    <div class="layout">
      <audio id="audio_player" controls
        aria-label="${ifDefined(this.rootRecord?.name)}"
        aria-details="${ifDefined(this.transcript ? 'transcript-link' : undefined)}">
        <source>
        ${repeat(this.tracks, (t) =>
            html`<track kind="${t.kind}" label="${t.label}" src="${t.src}" srclang="${t.srclang}" default="${t.default}" />`)}
      </audio>
      <div class="button-row">
        ${this.tracks.length ? html`
          <button
            type="button"
            class="transcript-toggle"
            aria-expanded="${this.showTranscript}"
            aria-controls="transcript-panel"
            @click="${() => this._onTranscriptToggle()}">
            ${this.showTranscript ? 'Hide Transcript' : 'Show Transcript'}
          </button>
        ` : ''}

        <div ?hidden="${this.isMultimedia}" class="button tooltip" data-tooltip-text="Share">
          <app-share-btn></app-share-btn>
        </div>
      </div>
    </div>

    <a class="transcript-link"
      id="transcript-link"
      ?hidden="${!this.transcript}"
      href="${this.transcript?.url}"
      download
      target="_blank"
      rel="noopener">
      <span class="transcript-link-inner">
        <ucdlib-icon icon="ucdlib-dams:fa-file-lines"></ucdlib-icon>
        <span class="transcript-label">${this._transcriptLabel()}</span>
      </span>
    </a>

    ${this.tracks.length && this.showTranscript ? html`
      <app-transcript-panel
        id="transcript-panel"
        label="Audio transcript"
        .cues="${this.transcriptCues}"
        .activeCueId="${this.activeCueId}"
        @cue-click="${(e) => this._onCueClick(e)}"
        @transcript-sheet-change="${(e) => this._onTranscriptSheetChange(e)}">
      </app-transcript-panel>
    ` : ''}
  </div>

</div>
`
}
