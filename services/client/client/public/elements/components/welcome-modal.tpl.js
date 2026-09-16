import { html } from "lit";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { sharedStyles } from '../styles/shared-styles';
import buttonsCss from "@ucd-lib/theme-sass/2_base_class/_buttons.css";

export default function render() {
  return html`
    <style>
      ${sharedStyles}
      ${buttonsCss}

      :host {
        display: block;
      }

      [hidden] {
        display: none !important;
      }

      .container .overlay h5,
      .container .overlay p,
      .container .overlay a {
        color: white;
      }

      .overlay {
        position: fixed;
        bottom: 2rem;
        left: 2rem;
        padding: 1.25rem;
        margin: auto;
        width: 375px;
        max-width: 50vw;
        border-radius: 25px;
        background-color: var(--color-aggie-blue);
        color: white;
        z-index: 1000;
        opacity: .97;
      }

      .overlay .body-section {
        font-size: .875rem;
      }

      .overlay h5 {
        padding: 0;
        margin: 0;
        font-size: 1.207rem;
      }

      .overlay .header-section {
        padding-bottom: .5rem;
      }

      .overlay .header-section h5 {
        margin: 0;
      }

      .overlay .footer-section {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding-top: 1rem;
      }

      .overlay .footer-buttons button {
        font-size: .875rem;
        margin-left: .6rem;
      }

      .footer-buttons a.btn--primary {
        padding-top: 0;
        padding-bottom: 0;
        margin-left: 0.5rem;
        font-size: .875rem;
      }

      button.ok {
        padding-left: 1rem;
      }

      @media (max-width: 600px) {
        .overlay {
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
          max-width: calc(100vw - 5rem);
        }
      }
    </style>


    <div class="container">
      <div class="overlay">
        <div class="header-section">
          <h5>${this.title}</h5>
        </div>
        <div class="body-section">
          ${unsafeHTML(this.content)}
        </div>
        <div class="footer-section">
          <div class="footer-buttons">
            <button class="btn btn--primary ok" @click="${this._onOk}">Got it!</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
