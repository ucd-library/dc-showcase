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

        @media(max-width: 768px) {
            :host {
                width: 90%;
            }
        }
    </style>
    
    <div class="container">
        <div id="sprite-plyr" style="display: none;"></div> 
        <video ?hidden="${!this.libsLoaded}" id="video" playsinline controls crossorigin>
            ${repeat(this.tracks, (t) => 
                html`<track kind="${t.kind}" label="${t.label}" src="${t.src}" srclang="${t.srclang}" default="${t.default}" />`)}
        </video>
    </div>
`
}
