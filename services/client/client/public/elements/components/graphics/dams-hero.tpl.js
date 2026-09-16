import { html } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';

export default function render() { 
return html`

<style>
  :host {
    display: block;
  }
  .container {
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
    z-index: 1;
  }
  .image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: fadein 1.5s ease-in-out;
    z-index: -1;
  }
  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  ::slotted(*) {
    color: var(--color-white) !important;
  }
  dams-watercolor {
    display: block;
    height: 8rem;
    margin-bottom: -1px; /* hack to ensure we don't get line at bottom */
  }
  
</style>

<div class="container" style="${styleMap(this.getContainerStyles())}">  
  <div class="image"></div>
  <slot></slot>
  ${this.watercolor ? html`
    <dams-watercolor 
      element="div"
      src-file-prefix="${this.watercolor.split("-")[0]}"
      color="${this.watercolor.split("-")[1]}">
    </dams-watercolor>
  `: html``}
</div>

`;}