import { html } from 'lit';

/**
 * @function render
 * @description Template for app-saving-overlay; spinner matches the image viewer.
 *
 * @returns {TemplateResult}
 */
export default function render() {
  return html`
    <style>
      :host {
        display: none;
      }
      :host([active]) {
        display: block;
      }
      .spinner {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 900;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, .6);
      }
      .spinner:after {
        content: '';
        width: 30px;
        height: 30px;
        border: 5px solid var(--color-aggie-gold-70);
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
    <div class="spinner" role="status" aria-label="Saving"></div>
  `;
}
