import { html } from 'lit';
import plyrCss from "plyr/dist/plyr.css"

export default function render() { 
return html`
<style>
  :host {
    display: none;
    padding: 20px 20px 0 20px;
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
    justify-content: center;
    border-bottom: 6px dotted var(--color-aggie-gold);
    width: 60%;
    margin: 0 auto;
    padding-bottom: 0.7rem;
  }

  .layout.multimedia {
    border-bottom: none;
  }

  .plyr--audio {
    max-width: 500px !important;
    width: 100%;
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
    height: 107px;
    margin: 0 auto;
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

  ${plyrCss}
</style>
<div class="container">
  <ucdlib-icon class="volume-icon" icon="ucdlib-dams:fa-volume-high"></ucdlib-icon>
  <div id="sprite-plyr" style="display: none;"></div>
  <div id="audio_poster"></div>

  <div class="layout ${this.isMultimedia ? 'multimedia' : ''}">
    <audio id="audio_player" controls>
      <source>
    </audio>
    <div ?hidden="${this.isMultimedia}" class="button tooltip" data-tooltip-text="Share">
      <app-share-btn></app-share-btn>
    </div>
  </div>

</div>
`
}