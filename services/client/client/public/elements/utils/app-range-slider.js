import { LitElement } from "lit";

import render from "./app-range-slider.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

export default class AppRangeSlider extends Mixin(LitElement).with(
  LitCorkUtils
) {
  static get properties() {
    return {
      // absolute min/max values for slider
      absMinValue: { type: Number, attribute: "abs-min-value" }, // observer : '_renderAsync' },
      absMaxValue: { type: Number, attribute: "abs-max-value" }, // observer : '_renderAsync' },

      // current min/max values for slider (where the btns are)
      minValue: { type: Number, attribute: "min-value" }, // observer : '_renderAsync' },
      maxValue: { type: Number, attribute: "max-value" }, // observer : '_renderAsync' },

      // labels for slide btns
      minValueLabel: { type: String },
      maxValueLabel: { type: String },

      // current widget size info
      // used so we don't have to ask the DOM on each render
      width: { type: Number },
      height: { type: Number },
      btnHeight: { type: Number },

      // string that indicate type of move
      moving: { type: String },

      // different moving flags for binding UI element classes
      movingMin: { type: Boolean },
      movingMax: { type: Boolean },
      isMoving: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.absMinValue = 0;
    this.absMaxValue = 100;
    this.minValue = 10;
    this.maxValue = 90;
    this.minValueLabel = "";
    this.maxValueLabel = "";
    this.width = 1;
    this.height = 50;
    this.btnHeight = 1;
    this.moving = "";
    this.movingMin = false;
    this.movingMax = false;
    this.isMoving = false;
    this.hasRendered = false;

    this._windowResizeListener = this._onResize.bind(this);
    this._windowMouseListener = this._onMoveStop.bind(this);

    this.addEventListener("mousemove", (e) => this._onMove(e));
    this.addEventListener("touchmove", (e) => this._onMove(e));
  }

  /**
   * @method connectedCallback
   * @description setup our window mouse listeners, fire first render
   */
  connectedCallback() {
    super.connectedCallback();

    window.addEventListener("resize", this._windowResizeListener);
    window.addEventListener("mouseup", this._windowMouseListener);
    window.addEventListener("mouseout", this._windowMouseListener);
    window.addEventListener("touchend", this._windowMouseListener);
    window.addEventListener("touchcancel", this._windowMouseListener);
  }

  /**
   * @method disconnectedCallback
   * @description remove our window mouse listeners
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("resize", this._windowResizeListener);
    window.removeEventListener("mouseup", this._windowMouseListener);
    window.removeEventListener("mouseout", this._windowMouseListener);
    window.removeEventListener("touchend", this._windowMouseListener);
    window.removeEventListener("touchcancel", this._windowMouseListener);
  }

  willUpdate(e) {
    if (!this.hasRendered) {
      requestAnimationFrame(() => {
        this._onResize();
        this._renderAsync();
      });
      this.hasRendered = true;
    }
  }

  /**
   * @method _onResize
   * @description cache the element size so we don't have to look it up
   * on each render of btn and line positions.  Then fire render to make
   * sure everything is visually correct.
   */
  _onResize() {
    this.width = this.offsetWidth || 1;
    this.height = this.offsetHeight;
    this.left = this.offsetLeft;
    let lowNumberBtn = this.shadowRoot.querySelector("#lowNumberBtn");
    if (lowNumberBtn) {
      this.height = 50;
      this.btnHeight = 25;
      this._render();
    }
  }

  /**
   * @method _valueToPx
   * @description given a number line value, return px location relative
   * to the widget
   *
   * @param {Number} value number line value
   *
   * @returns {Number} px location
   */
  _valueToPx(value) {
    value = value - this.absMinValue;
    let range = this.absMaxValue - this.absMinValue;
    let valPerPx = range / this.width;
    return Math.round(value / valPerPx);
  }

  /**
   * @method _pxToValue
   * @description given a px location, return number line value
   *
   * @param {Number} px location
   *
   * @returns {Number} value
   */
  _pxToValue(px) {
    let range = this.absMaxValue - this.absMinValue;
    let valPerPx = range / this.width;
    return Math.round(px * valPerPx) + this.absMinValue;
  }

  _renderAsync() {
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
    }

    this.renderTimer = setTimeout(() => {
      this.renderTimer = 0;
      this._render();
    }, 0);
  }

  /**
   * @method _render
   * @description set the current top/left px values for all btns,
   * labels and lines bases on current min/max values.
   */
  _render() {
    let hh = this.height * 0.6;

    // set line heights
    this.shadowRoot.querySelector("#numberLine").style.top = hh + "px";
    this.shadowRoot.querySelector("#fillLine").style.top = hh + "px";

    // set btn heights
    let hBtnHeight = this.btnHeight / 2;
    this.shadowRoot.querySelector("#lowNumberBtn").style.top =
      hh - hBtnHeight + "px";
    this.shadowRoot.querySelector("#highNumberBtn").style.top =
      hh - hBtnHeight + "px";

    this.shadowRoot.querySelector("#lowNumberLabel").style.top =
      hh - hBtnHeight - 22 + "px";
    this.shadowRoot.querySelector("#highNumberLabel").style.top =
      hh - hBtnHeight - 22 + "px";

    // set btn left
    let lv =
      this.minValue < this.absMinValue ? this.absMinValue : this.minValue;
    let uv =
      this.maxValue > this.absMaxValue ? this.absMaxValue : this.maxValue;

    let minPxValue = this._valueToPx(lv);
    let maxPxValue = this._valueToPx(uv);

    this.shadowRoot.querySelector("#lowNumberBtn").style.left =
      minPxValue - hBtnHeight + "px";
    this.shadowRoot.querySelector("#highNumberBtn").style.left =
      maxPxValue - hBtnHeight + "px";

    this.shadowRoot.querySelector("#lowNumberLabel").style.left =
      minPxValue - hBtnHeight + "px";
    this.shadowRoot.querySelector("#highNumberLabel").style.left =
      maxPxValue - hBtnHeight + "px";

    this.shadowRoot.querySelector("#fillLine").style.left = minPxValue + "px";
    this.shadowRoot.querySelector("#fillLine").style.width =
      maxPxValue - minPxValue + "px";

    this.minValueLabel = this.minValue;
    this.maxValueLabel = this.maxValue;
  }

  /**
   * @method _onMoveStart
   * @description bound to btns and center line.  Fired when the user mouses
   * down on element indicating a move is starting
   *
   * @param {MouseEvent} e
   */
  _onMoveStart(e) {
    this.moving = e.currentTarget.getAttribute("prop");

    if (this.moving === "range") {
      this.startRange = {
        min: e.currentTarget.offsetLeft,
        max: e.currentTarget.offsetLeft + e.currentTarget.offsetWidth,
        left: e.pageX - this.left,
      };
    }

    this.isMoving = true;
    this.movingMin = this.moving === "max" ? false : true;
    this.movingMax = this.moving === "min" ? false : true;
  }

  /**
   * @method _onMove
   * @description bound to mousemove event on this element.  Update min/max
   * values based on type of move that is happening ie min, max or range.  Does
   * nothing if we are not moving.
   *
   * @param {MouseEvent} e
   */
  _onMove(e) {
    if (!this.moving) return;
    e.preventDefault();

    // handle both mouse and touch event
    let left;
    if (e.type === "touchmove") {
      if (!e.changedTouches.length) return;
      left = e.changedTouches[0].pageX - this.left;
    } else {
      left = e.pageX - this.left;
    }

    if (this.moving === "min") {
      this.minValue = this._pxToValue(left);
    } else if (this.moving === "max") {
      this.maxValue = this._pxToValue(left);
    } else if (this.moving === "range") {
      let diff = this.startRange.left - left;

      this.minValue = this._pxToValue(this.startRange.min - diff);
      this.maxValue = this._pxToValue(this.startRange.max - diff);
    }

    if (this.minValue < this.absMinValue) {
      this.minValue = this.absMinValue;
    }
    if (this.maxValue > this.absMaxValue) {
      this.maxValue = this.absMaxValue;
    }

    if (this.minValue > this.maxValue) {
      if (this.moving === "min") this.minValue = this.maxValue;
      else this.maxValue = this.minValue;
    }
    this.hasRendered = false;
  }

  /**
   * @method _onMoveStop
   * @description bound to mouseup/mouseout event on window.  It's always best to bind
   * this to the window as a catch all.  Resets all moving flags
   */
  _onMoveStop() {
    if (!this.moving) return;

    this.moving = "";
    this.movingMin = false;
    this.movingMax = false;
    this.isMoving = false;

    this.dispatchEvent(
      new CustomEvent("range-value-change", {
        detail: {
          min: this.minValue,
          max: this.maxValue,
        },
      })
    );
    this.hasRendered = false;
  }
}

customElements.define("app-range-slider", AppRangeSlider);
