import { html } from 'lit';
import { sharedStyles } from '../../../styles/shared-styles';

export default function render() { 
  return html`


<style>
  ${sharedStyles}
  :host {
    display: block;
  }

  [hidden] { display: none !important; }
  
  .labels {
    display: flex;
    margin: 0 23px 0 13px;
    color: var(--gray-text);
    font-size: var(--fs-sm);
  }

  .inputs {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  input[type="number"] {
    border: 0;
    width: 3.3rem;
    height: 61px;
    padding: 0 1rem;
    margin: 0;
    font-size: var(--fs-sm);
    background: var(--color-aggie-blue-30);
  }

  .unknown {
    margin-left: 9px;
    display: flex;
    align-items: center;
  }

  label {
    font-size: 0.85rem;
    padding-left: 5px;
  }

  app-range-slider {
    --light-background-color: var(--medium-background-color);
  }
</style>

<div class="inputs">
  <input id="minValueInput" type="number" @change="${this._onInputChange}">
  <span> - </span>
  <input id="maxValueInput" type="number" @change="${this._onInputChange}">
</div>

<div style="margin-right: 10px">
  <app-range-slider
    id="slider"
    @range-value-change="${this._onRangeSliderChange}"
    abs-min-value="${this.absMinValue}"
    abs-max-value="${this.absMaxValue}"
    min-value="${this.minValue}"
    max-value="${this.maxValue}">
  </app-range-slider>
</div>

<div class="labels">
  <div style="flex:1">${this.absMinValue}</div>
  <div>${this.absMaxValue}</div>
</div>

<div class="unknown" ?hidden="${this.showUnknown}">
  <input type="checkbox" id="unknown" @click="${this._onRangeNullChange}" checked />
  <label for="unknown">include unknown / unspecified</label>
</div>
`;}