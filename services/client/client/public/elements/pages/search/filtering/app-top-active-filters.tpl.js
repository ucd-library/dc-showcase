import { html } from "lit";

export default function render() {
  return html`
    <style>
      :host {
        display: none;
        margin-left: 10px;
        padding-top: 10px;
        padding-bottom: 5px;
        font-size: var(--fs-sm);
      }

      #close {
        display: inline-block;
        vertical-align: middle;
        /* padding-right: 5px; */
      }

      ucdlib-icon {
        fill: var(--color-aggie-blue-80);
        margin-left: -6px;
        width: 1.2rem;
        height: 1.2rem;
        padding: 3px;
      }

      .title {
        margin-right: 10px;
        font-style: italic;
      }

      .rm-btn {
        color: var(--color-aggie-blue);
        font-weight: bold;
        display: inline-block;
        margin: 0.5rem;
        cursor: pointer;
        font-size: 0.85rem;
        padding: 0.85rem;
        border-radius: 35px;
        background-color: var(--color-aggie-blue-40);

      }

      .rm-btn:hover ucdlib-icon {
        fill: var(--color-aggie-gold-80);
        border-radius: 50%;
        background-color: var(--color-aggie-blue-90);
        transition: background-color 0.3s ease-in-out;
        transition: fill 0.3s ease-in-out;
      }
    </style>

    <div class="layout">
      ${this.activeFilters.map(
        (item, index) => html`
          <div
            @click="${this._onRemoveFilterClicked}"
            class="rm-btn"
            index="${index}"
            role="button"
            tabindex="0"
          >
          <div id="close">
            <ucdlib-icon icon="ucdlib-dams:fa-times"></ucdlib-icon>
          </div> ${item.label}
          </div>
        `
      )}
    </div>
  `;
}
