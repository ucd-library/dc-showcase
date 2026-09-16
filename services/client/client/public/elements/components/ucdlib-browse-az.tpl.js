import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }

    [hidden] {
      display: none !important;
    }

    .alphaContainer {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }

    .box {
      color: rgb(76, 76, 76);
      width: 2rem;
      height: 2rem;
      margin: 5px 5px;
      display: inline-block;
      vertical-align: middle;
      line-height: 2rem;
      text-align:center;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .box.selected, .box.selected.disabled {
      color: white;
      background-color: #13639E;
    }

    .box:hover, .box.selected.disabled:hover {
      background: #ffbf00;
      color: #022851;
    }

    .box.selected {
      cursor: auto;
    }

    .box.disabled {
      color: #A9A9A9;
      cursor: auto;
    }

    .box.disabled:hover {
      background-color: transparent;
      color: #A9A9A9;
    }

  `;

  return [
    elementStyles,
  ];
}

export function render() {
return html`
    <div class="alphaContainer">
      ${this.alpha.map((alp, i) => html`
        <span 
          @click=${() => this.onAlphaInput(alp)} 
          @keydown=${(e) => { if (e.key === 'Enter' || e.key === ' ') this.onAlphaInput(alp); }}
          tabindex="${alp.exists ? '0' : '-1'}"
          role="button"
          aria-label="${alp.display}"
          aria-pressed="${this.selectedLetter == alp.value}"
          aria-disabled="${!alp.exists}"
          aria-selected="${this.selectedLetter == alp.value}"
          class="box ${alp.value == this.selectedLetter ? 'selected' : ''} ${alp.exists ? '' : 'disabled'}">
          ${alp.display}
        </span>
      `)}
    </div>
`;}
