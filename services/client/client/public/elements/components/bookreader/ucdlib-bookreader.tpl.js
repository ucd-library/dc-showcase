import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }

    ucdlib-bookreader-slider,
    ucdlib-bookreader-navbar {
      width: 60%;
      margin: 0 auto;
    }

    :host([fullscreen]) {
      background-color: white;
      position: fixed;
      padding: 0px;
      margin: 0px;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      height: calc(100vh-3.5em);
      z-index: 3000;
    }

    #single-page {
      overflow: hidden;
      position: relative;
    }

    /* #single-page[fullscreen] {
      overflow: auto;
    } */

    #single-page-scroll {
      position: relative;
    }
    
    #single-page ucdlib-bookreader-page {
      position: absolute;
    }

    ucdlib-bookreader-navbar {
      width: 60%;
      margin: 0 auto;
    }

    ucdlib-bookreader-navbar[fullscreen] {
      position: absolute;
      z-index: 4000;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      background: var(--color-aggie-blue-30);
      padding: .5rem 0;
    }

    /* ucdlib-bookreader-navbar[fullscreen] .br-nav-bar {
      width: 97%;
      margin: 0 auto;
    } */

    @media (max-width: 767px) {
      ucdlib-bookreader-slider,
      ucdlib-bookreader-navbar {
        width: 90%;
      }
    }
    
  `;

  return [elementStyles];
}

export function render() { 
return html`

  <div id="page-container">
    <div id="single-page" 
      ?fullscreen="${this.fullscreen}" 
      >
      <div id="single-page-scroll"></div>
    </div>
    <!-- <div id="double-page" ?hidden="${this.view !== 'double'}"> 
    </div> -->
  </div>
  <ucdlib-bookreader-navbar ?fullscreen="${this.fullscreen}"></ucdlib-bookreader-navbar>
`;}