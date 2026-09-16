import { html } from 'lit';
import { sharedStyles } from '../styles/shared-styles';

export default function render() { 
  return html`


<style>
  ${sharedStyles}
  :host {
    display: block;
    position: relative;
    height: 50px;
    margin: 0 13px;

    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently */
  }

  #numberLine {
    position: absolute;
    left : 0;
    right : 0;
    height: 3px;
    background-color: var(--light-background-color, #888);
  }

  #fillLine {
    position: absolute;
    cursor: move;
    background-color: var(--color-aggie-blue-80) ;
    height: 3px;
  }

  .btn {
    position: absolute;
    height: 25px;
    width: 25px;
    cursor: move;
  }

  .btn > div {
    margin: 5px;
    height: 15px;
    width: 15px;
    border-radius: 15px;
    background-color: var(--color-aggie-blue-80) ;
    transition: all 150ms linear;
  }

  .btn[moving] > div {
    margin: 0px;
    height: 25px;
    width: 25px;
    border-radius: 25px;
  }

  .label {
    width : 25px;
    font-size: 12px; 
    position: absolute;
    text-align: center;
    transform: scale(0);
    transition: transform 200ms linear;
    color: var(--default-primary-color);
  }

  .label[moving] {
    transform: scale(1);
  }

</style>

<div id="numberLine"></div>

<div id="fillLine" 
  prop="range" 
  @mousedown="${this._onMoveStart}" 
  @touchstart="${this._onMoveStart}">
</div>

<div id="lowNumberLabel" class="label" ?moving="${this.isMoving}">${this.minValueLabel}</div>
<div id="highNumberLabel" class="label" ?moving="${this.isMoving}">${this.maxValueLabel}</div>

<div id="lowNumberBtn" 
  class="btn" 
  prop="min" 
  @mousedown="${this._onMoveStart}" 
  @touchstart="${this._onMoveStart}" 
  ?moving="${this.movingMin}" >
  <div></div>
</div>

<div id="highNumberBtn" 
  class="btn" 
  prop="max" 
  @mousedown="${this._onMoveStart}" 
  @touchstart="${this._onMoveStart}" 
  ?moving="${this.movingMax}">
  <div></div>
</div>

`;}