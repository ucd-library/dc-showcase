import { html } from 'lit';

import { sharedStyles } from '../../../styles/shared-styles';
import leafletCss from "leaflet/dist/leaflet.css";

export default function render() { 
  return html`

<style include="shared-styles">
  ${sharedStyles}
  ${leafletCss}

  [hidden] {
    display: none;
  }
  
  :host {
    display: none;
    position: absolute;
    z-index: 1000;
    right: 0;
    bottom: 0;
    top: 0;
    left: 0;
    background-color: white;    
    animation: show 350ms ease-out;
  }

  :host #nav.single {
    padding: 10px;
    background-color: transparent;
  }

  @keyframes show {
    from {
      /* top: -100vh; */
      opacity: 0.5;
      transform: scale(1.3);
    }
    to {
      /* top: 0; */
      opacity: 1;
      transform: scale(1);
    }
  }

  #viewer { 
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: white;
  }

  #nav {
    z-index: 2000;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
  }

  #close {
    z-index: 2000;
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 50px;
    height: 50px;
    background-color: white;
    border-radius: 50%;
  }

  #close ucdlib-icon {
    fill: var(--color-aggie-blue-80);
    margin: auto;
    height: 36px;
    padding-top: 7px;
  }

  #close:hover {
    background-color: var(--color-aggie-blue-80);
    cursor: pointer;
  }

  #close:hover ucdlib-icon {
    fill: var(--color-aggie-gold);
  }

  .leaflet-control-zoom {
    display: none;
  }

  .spinner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color:  transparent;
    transition: opacity 0.75s, visibility 0.75s;
  }

  .spinner:after {
    content: '';
    width: 30px;
    height: 30px;
    border: 5px solid  var(--color-aggie-gold-70);
    border-top-color: var(--color-aggie-gold);
    border-radius: 50%;
    animation: loading 0.75s ease infinite;
  }

  @keyframes loading {
    from {
      transform: rotate(0turn); 
    }
    to {
      transform: rotate(1turn);
    }
  }

</style>

<!-- make sure background is blacked out... iOS hack -->
<div id="safeCover" style="display:none;position:absolute;z-index:999;top:0;left:0;width:100vw;height:100vh;background-color:white;"></div>

<div id="viewer" ?hidden="${this.loading}"></div>

<div class="spinner"></div>


<app-media-viewer-nav 
  id="nav"
  is-lightbox
  @zoom-in="${this._onZoomInClicked}"
  @zoom-out="${this._onZoomOutClicked}"
  @close="${this._onCloseClicked}">
</app-media-viewer-nav>

`;}