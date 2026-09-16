import { html } from "lit";

export default function render() {
  return html`
    <style>
      :host {
        display: block;
        padding: 20px 0;
        box-sizing: border-box;
      }

      .layout {
        text-align: center;
        height: 600px;
      }

      #img {
        max-width: 100vw;
        object-fit: contain;
      }

      [hidden] {
        display: none !important;
      }

      .spinner {
        position: relative;
        left: 0;
        width: 100vw;
        /* height: 100vh; */
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

    <div class="spinner" ?hidden="${!this.loading}" style="top: ${this.spinnerTop}px"></div>

    <div class="layout" style="line-height: 0; height: ${this.height}">
      <img ?hidden="${this.loading}" id="img" style="height: ${this.height}" alt="${this.title}" />
    </div>
  `;
}
