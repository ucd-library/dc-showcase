import { html } from "lit";
import { sharedStyles } from "../../styles/shared-styles";

export default function render() {
  return html`
    <style>
      ${sharedStyles} :host {
        display: block;
        position: relative;
        z-index: 500;
        /* background-color: var(--color-aggie-blue-40) */
      }

      h2 {
        font-style: italic;
        font-weight: 700;
        text-align: center;
        color: var(--color-aggie-blue);
        font-size: 2rem;
      }

      .img-box {
        cursor: pointer;
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        border: 3px solid var(--color-aggie-blue-60);
        height: 125px;
        width: 240px;
        margin: 0.5rem;
      }

      .img-box:hover {
        border: 3px solid var(--color-aggie-gold);
        background-color: var(--color-aggie-gold);
      }

      .img-box ucdlib-icon {
        fill: var(--color-aggie-blue-80);
        width: 100%;
        height: 100%;
      }

      .img-box .content-type-label {
        color: var(--color-aggie-blue-80);
        text-align: center;
        display: block;
        padding: 0.5rem;
        font-weight: bold;
      }

      .add-content-container {
        display: flex;
        width: 50%;
        margin: 0 auto;
        justify-content: space-between;
      }

      @media (max-width: 991px) {
        /* tablet and mobile, just style full width */
        .add-content-container {
          width: 90%;
        }
      }
    </style>

    ${this.panels.map(
      (panel) => html`
        <admin-content-panel
          @panel-loaded="${this._updateUiStyles}"
          @trash-clicked="${this._trashPanel}"
          @up-arrow-clicked="${this._movePanelUp}"
          @down-arrow-clicked="${this._movePanelDown}"
          type="${panel.type}"
          position="${panel.position}"
          placement="${panel.placement}"
          collectionId="${panel.collectionId}"
          heading="${panel.heading}"
          description="${panel.description}"
          .collectionIds="${panel.collectionIds}"
        >
        </admin-content-panel>
      `
    )}

    <h2>Add Content:</h2>
    <div class="add-content-container">
      <div class="single img-box" @click="${this._newPanel}">
        <ucdlib-icon
          icon="ucdlib-dams:dams-admin-collection-single"
        ></ucdlib-icon>
        <span class="content-type-label">Collection Single</span>
      </div>
      <div class="cards img-box" @click="${this._newPanel}">
        <ucdlib-icon
          icon="ucdlib-dams:dams-admin-collection-cards"
        ></ucdlib-icon>
        <span class="content-type-label">Collection Cards</span>
      </div>
      <div class="text img-box" @click="${this._newPanel}">
        <ucdlib-icon icon="ucdlib-dams:dams-admin-text"></ucdlib-icon>
        <span class="content-type-label">Text</span>
      </div>
    </div>
  `;
}
