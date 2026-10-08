// https://github.com/ucd-library/pgdm-ui/tree/master/app/elements/pages/connect

import { html } from 'lit';
import { repeat } from 'lit-html/directives/repeat.js';

export default function render() {
return html`
    <style>
        :host {
            display: block;
            box-sizing: border-box;
            width: 60%;
            margin: auto;
        }

        .container {
            padding: 10px;
        }

        video {
            max-width: 100%;
            height: auto;
            max-height: 600px;
        }

        .plyr__video-wrapper {
            text-align: center;
        }

        .plyr--full-ui input[type=range] {
            color: #daaa00 !important;
        }

        button.plyr__control.plyr__control--overlaid,
        button.plyr__control.plyr__control:hover {
            background: rgba(218,170,0,1.0) !important;
        }

        .plyr__control:focus {
            background: rgba(218,170,0,1.0) !important;
        }
        .plyr--full-ui input[type=range] {
            padding: 2px !important;
            border: 1px solid transparent !important;
        }
        .plyr--full-ui input[type=range]:focus {
            border: 1px dashed rgba(218,170,0,1.0) !important;
        }
        .plyr__tab-focus {
            outline: 0 !important;
            background: transparent !important;
        }

        :host app-share-btn {
            fill: var(--color-aggie-blue-80);
        }

        .media-wrap {
            border-bottom: 6px dotted var(--color-aggie-gold);
            padding-bottom: 0.7rem;
        }

        .media-wrap.multimedia {
            border-bottom: none;
        }

        .video-shell {
            max-height: 600px;
            /* clips the video when .video-shell shrinks on mobile fullscreen -
               inert on desktop since the video's own max-height:600px already
               keeps it within this box under normal conditions */
            overflow: hidden;
        }

        @media(max-width: 768px) {
            /* fullscreen mobile sheet mode - stays in normal document flow
               (no position:fixed - that fought the site header's own stacking
               context/sticky positioning) and instead relies on
               _onTranscriptSheetChange scrolling this element to the top of
               the viewport plus locking page scroll there, with a solid white
               background/padding so it visually covers whatever it's now
               sitting flush against. position:relative (still in-flow) plus a
               z-index above the site header's own 1000 makes sure this wins
               the stacking order if the header is sticky/fixed and would
               otherwise still render on top of it */
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

            /* video shrinks continuously in step with the sheet's height -
               --sheet-progress (0-1 across the sheet's full draggable range)
               is written by _onTranscriptSheetDrag both live during a drag
               and again once it settles, so this stays in sync at rest too,
               with no separate snap-point CSS needed */
            :host([fullscreen]) .video-shell {
                max-height: calc(600px - (var(--sheet-progress, 0) * 440px));
                transition: max-height .3s ease-out;
            }

            /* the sheet's own header (close icon) replaces this row's job
               while a mobile sheet is open */
            :host([fullscreen]) .button-row {
                display: none;
            }
        }

        .button-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            align-items: center;
            gap: 0.4rem;
            margin-top: 0.75rem;
        }

        .button {
            background-color: var(--color-aggie-blue-80);
            border-radius: 50%;
            display: inline-block;
            width: 50px;
            height: 50px;
        }

        .button:hover,
        .button:has(> app-share-btn[popup]) {
            background-color: var(--color-aggie-blue);
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

        .transcript-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
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
            display: block;
            margin-top: .5rem;
        }

        @media(max-width: 768px) {
            :host {
                width: 90%;
            }
        }
    </style>

    <div class="container">
        <div class="media-wrap ${this.isMultimedia ? 'multimedia' : ''}">
            <div class="video-shell">
                <div id="sprite-plyr" style="display: none;"></div>
                <video ?hidden="${!this.libsLoaded}" id="video" playsinline controls crossorigin>
                    ${repeat(this.tracks, (t) =>
                        html`<track kind="${t.kind}" label="${t.label}" src="${t.src}" srclang="${t.srclang}" default="${t.default}" />`)}
                </video>
            </div>

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

            ${this.tracks.length && this.showTranscript ? html`
                <app-transcript-panel
                    id="transcript-panel"
                    label="Video transcript"
                    .cues="${this.transcriptCues}"
                    .activeCueId="${this.activeCueId}"
                    @cue-click="${(e) => this._onCueClick(e)}"
                    @transcript-sheet-change="${(e) => this._onTranscriptSheetChange(e)}"
                    @transcript-sheet-drag="${(e) => this._onTranscriptSheetDrag(e)}">
                </app-transcript-panel>
            ` : ''}
        </div>
    </div>
`
}
