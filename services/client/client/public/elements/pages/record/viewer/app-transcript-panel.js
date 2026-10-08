import { LitElement } from "lit";
import render from "./app-transcript-panel.tpl.js";
import "../../../utils/app-icons";
import utils from "../../../../lib/utils";

// mobile bottom sheet's draggable height range and starting height, as a
// percentage of viewport height - shared between the drag math and the CSS
// custom property it drives
const SHEET_MIN_VH = 15;
const SHEET_MAX_VH = 92;
const SHEET_DEFAULT_VH = 42;
// a release velocity (vh per ms) past this threshold, downward, closes the
// sheet regardless of how far it was actually dragged (swipe-to-dismiss)
const FLICK_VELOCITY_VH_PER_MS = 0.4;

/**
 * @class AppTranscriptPanel
 * @description shared, self-contained transcript panel used by both
 * app-audio-viewer and app-video-viewer. Takes a parsed cue list and the
 * currently active cue id as inputs (both require direct access to the
 * parent's own media element/track to compute, so they stay owned by the
 * parent); owns its own auto-scroll and search UI state internally.
 * Dispatches a 'cue-click' event (detail: the clicked cue) when a line is
 * clicked, so the parent - which owns the actual player instance - can seek
 * playback.
 *
 * On mobile (<= utils.mobileBreakpoint), also renders as a draggable bottom
 * sheet instead of the desktop always-in-flow panel - freely resizable
 * between SHEET_MIN_VH/SHEET_MAX_VH and resting wherever it's released
 * (no fixed snap points), except that dragging/flicking down past
 * SHEET_MIN_VH closes it entirely. Dragging/closing the sheet is entirely
 * owned here; since this component can't reach into its sibling media
 * element's shadow DOM, it notifies the parent viewer via two bubbling,
 * composed CustomEvents - 'transcript-sheet-change' (detail: {state: 'open'|
 * 'closed'}) when the sheet opens/closes, and 'transcript-sheet-drag'
 * (detail: {progress: 0-1}) continuously as the height changes, so the
 * parent can resize/reposition its own player and lock page scroll.
 */
export default class AppTranscriptPanel extends LitElement {

  static get properties() {
    return {
      cues: {type: Array},
      activeCueId: {type: String},
      label: {type: String},
      autoScroll: {type: Boolean},
      search: {type: String},
      isMobile: {type: Boolean},
      sheetState: {type: String},
      searchOpen: {type: Boolean}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.cues = [];
    this.activeCueId = null;
    this.label = 'Transcript';
    this.autoScroll = true;
    this.search = '';
    this.isMobile = false;
    this.sheetState = 'open';
    this.searchOpen = false;

    // the sheet's resting height in vh, independent of sheetState - not a
    // reactive property since it's applied imperatively as a CSS custom
    // property rather than through a re-render
    this._heightVh = SHEET_DEFAULT_VH;
    this._dragActive = false;

    this._onHandlePointerMoveBound = this._onHandlePointerMove.bind(this);
    this._onHandlePointerUpBound = this._onHandlePointerUp.bind(this);
    this._onHandlePointerCancelBound = this._onHandlePointerCancel.bind(this);
  }

  /**
   * @method connectedCallback
   * @description start watching the viewport for crossing the mobile breakpoint
   */
  connectedCallback() {
    super.connectedCallback();
    this._unwatchMobile = utils.watchMobileViewport(isMobile => this._onMobileChange(isMobile));
  }

  /**
   * @method disconnectedCallback
   * @description stop watching the viewport
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    if( this._unwatchMobile ) this._unwatchMobile();
  }

  /**
   * @method firstUpdated
   * @description this component only ever exists in the DOM while the parent
   * viewer has showTranscript=true, so its initial mount IS the sheet opening -
   * announce the starting state right away rather than waiting for the first
   * drag/search-toggle event, so the parent syncs its fullscreen shell
   * immediately instead of lagging a gesture behind
   */
  firstUpdated() {
    if( !this.isMobile || this.sheetState === 'closed' ) return;
    this._applySheetHeight();
    this._dispatchSheetChange(this.sheetState);
    this._dispatchDragProgress(this._progressFor(this._heightVh));
  }

  /**
   * @method updated
   * @description scroll the active line into view whenever the active cue
   * changes
   *
   * @param {Map} changedProperties
   */
  updated(changedProperties) {
    if( changedProperties.has('activeCueId') ) this._scrollActiveLineIntoView();
    if( changedProperties.has('searchOpen') && this.searchOpen ) {
      requestAnimationFrame(() => this.shadowRoot.querySelector('.transcript-search')?.focus());
    }
  }

  /**
   * @method reset
   * @description clear the search filter and mobile search-reveal state -
   * called by the parent when a new media/track is attached, so stale state
   * doesn't carry over to a different transcript. Auto-scroll is left alone
   * since that's more of a standing user preference than something tied to a
   * specific transcript.
   */
  reset() {
    this.search = '';
    this.searchOpen = false;
  }

  /**
   * @method _onMobileChange
   * @description called whenever the viewport crosses the mobile breakpoint
   *
   * @param {Boolean} isMobile
   */
  _onMobileChange(isMobile) {
    const wasMobile = this.isMobile;
    this.isMobile = isMobile;
    // leaving mobile while a sheet is open - close it the same way a swipe-to-
    // close would, so the parent tears down its fullscreen shell/scroll lock
    if( wasMobile && !isMobile && this.sheetState !== 'closed' ) {
      this._onSheetClose();
    }
  }

  /**
   * @method _applySheetHeight
   * @description apply this._heightVh as the mobile sheet's resting height
   */
  _applySheetHeight() {
    const sheet = this.shadowRoot.querySelector('.transcript-panel');
    if( sheet ) sheet.style.setProperty('--sheet-height', `${this._heightVh}vh`);
  }

  /**
   * @method _progressFor
   * @description convert a sheet height in vh to a 0-1 progress value across
   * the full draggable range, for the parent's video-shrink CSS
   *
   * @param {Number} heightVh
   *
   * @returns {Number}
   */
  _progressFor(heightVh) {
    return Math.max(0, Math.min(1, (heightVh - SHEET_MIN_VH) / (SHEET_MAX_VH - SHEET_MIN_VH)));
  }

  /**
   * @method _getFilteredCues
   * @description filter cues by the current search text - a plain substring
   * match against the whole search string (not tokenized by word), so a
   * multi-word phrase including spaces is matched literally
   *
   * @returns {Array}
   */
  _getFilteredCues() {
    if( !this.search ) return this.cues;
    const term = this.search.toLowerCase();
    return this.cues.filter(cue => cue.text.toLowerCase().includes(term));
  }

  /**
   * @method _scrollActiveLineIntoView
   * @description keep the currently active transcript line pinned to the top
   * of the panel's own scroll container as playback advances. Scrolls the
   * .transcript-lines container directly (rather than using
   * element.scrollIntoView, which also drags the surrounding page scroll
   * along with it) so only the transcript entries shift.
   */
  _scrollActiveLineIntoView() {
    if( !this.autoScroll ) return;
    // avoid yanking the view around while the reader is actively filtering -
    // also means we never try to scroll to a line that a search filtered out
    if( this.search ) return;
    if( !this.activeCueId ) return;

    const panel = this.shadowRoot.querySelector('.transcript-lines');
    const activeLine = this.shadowRoot.querySelector('.transcript-line.active');
    if( !panel || !activeLine ) return;

    const panelRect = panel.getBoundingClientRect();
    const lineRect = activeLine.getBoundingClientRect();
    const delta = lineRect.top - panelRect.top;

    panel.scrollTo({top: panel.scrollTop + delta, behavior: 'smooth'});
  }

  /**
   * @method _onLineClick
   * @description bubble a cue-click event up to the parent, which owns the
   * actual player instance and can seek playback
   *
   * @param {Object} cue {id, start, end, text}
   */
  _onLineClick(cue) {
    this.dispatchEvent(new CustomEvent('cue-click', {detail: cue}));
  }

  /**
   * @method _onAutoScrollToggle
   * @description toggle whether the panel auto-scrolls to keep the active
   * cue in view during playback
   *
   * @param {Object} e HTML change event
   */
  _onAutoScrollToggle(e) {
    this.autoScroll = e.currentTarget.checked;
  }

  /**
   * @method _onSearch
   * @description update the transcript search filter text
   *
   * @param {Object} e HTML input event
   */
  _onSearch(e) {
    this.search = e.currentTarget.value;
  }

  /**
   * @method _onSearchToggle
   * @description reveal/hide the mobile search input. Revealing it bumps the
   * sheet up to at least the default resting height if it's currently
   * smaller, so the input isn't clipped by a too-short sheet - it doesn't
   * force any particular height beyond that minimum, since the sheet no
   * longer has fixed snap points to jump to
   */
  _onSearchToggle() {
    this.searchOpen = !this.searchOpen;
    if( this.searchOpen && this._heightVh < SHEET_DEFAULT_VH ) {
      this._heightVh = SHEET_DEFAULT_VH;
      this._applySheetHeight();
      this._dispatchDragProgress(this._progressFor(this._heightVh));
    }
  }

  /**
   * @method _dispatchSheetChange
   * @description notify the parent viewer that the sheet has opened or closed
   *
   * @param {String} state 'closed' | 'open'
   */
  _dispatchSheetChange(state) {
    this.dispatchEvent(new CustomEvent('transcript-sheet-change', {
      bubbles: true,
      composed: true,
      detail: {state}
    }));
  }

  /**
   * @method _dispatchDragProgress
   * @description notify the parent viewer of the sheet's current progress
   * across its full draggable height range (eg for the video-shrink CSS),
   * throttled to one dispatch per animation frame so a 60fps drag doesn't
   * flood the parent with events
   *
   * @param {Number} progress 0-1
   */
  _dispatchDragProgress(progress) {
    this._pendingDragProgress = progress;
    if( this._dragRafPending ) return;
    this._dragRafPending = true;
    requestAnimationFrame(() => {
      this._dragRafPending = false;
      this.dispatchEvent(new CustomEvent('transcript-sheet-drag', {
        bubbles: true,
        composed: true,
        detail: {progress: this._pendingDragProgress}
      }));
    });
  }

  /**
   * @method _onSheetClose
   * @description fully close the mobile sheet - the parent's
   * transcript-sheet-change handler is what actually flips showTranscript to
   * false and unmounts this component, so the "Show/Hide Transcript" button
   * and the sheet's own swipe-to-dismiss never disagree about state
   */
  _onSheetClose() {
    this.sheetState = 'closed';
    this._dispatchSheetChange('closed');
  }

  /**
   * @method _onHandlePointerDown
   * @description begin tracking a drag on the mobile sheet's handle
   *
   * @param {PointerEvent} e
   */
  _onHandlePointerDown(e) {
    this._dragActive = true;
    this._dragStartY = e.clientY;
    this._dragStartHeightVh = this._heightVh;
    this._dragSamples = [{y: e.clientY, t: e.timeStamp}];

    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    handle.addEventListener('pointermove', this._onHandlePointerMoveBound);
    handle.addEventListener('pointerup', this._onHandlePointerUpBound);
    handle.addEventListener('pointercancel', this._onHandlePointerCancelBound);

    const sheet = this.shadowRoot.querySelector('.transcript-panel');
    if( sheet ) sheet.classList.add('dragging');
  }

  /**
   * @method _onHandlePointerMove
   * @description live-track the sheet height 1:1 with the drag - freely,
   * anywhere between fully collapsed (0) and SHEET_MAX_VH, not toward any
   * fixed snap point - and report live progress so the video viewer can
   * shrink in step. Allowed to visually shrink all the way to 0 (below
   * SHEET_MIN_VH, the release threshold used by _settleSheet to decide
   * whether to close) so dragging toward the bottom reads as one continuous
   * collapse instead of stopping short and only closing once the pointer is
   * released
   *
   * @param {PointerEvent} e
   */
  _onHandlePointerMove(e) {
    if( this._dragStartY == null ) return;

    const deltaVh = ((this._dragStartY - e.clientY) / window.innerHeight) * 100;
    const liveVh = Math.max(0, Math.min(SHEET_MAX_VH, this._dragStartHeightVh + deltaVh));
    this._liveHeightVh = liveVh;

    const sheet = this.shadowRoot.querySelector('.transcript-panel');
    if( sheet ) sheet.style.setProperty('--sheet-height', `${liveVh}vh`);

    this._dragSamples.push({y: e.clientY, t: e.timeStamp});
    if( this._dragSamples.length > 5 ) this._dragSamples.shift();

    this._dispatchDragProgress(this._progressFor(liveVh));
  }

  /**
   * @method _onHandlePointerUp
   * @description end the drag and settle to the nearest/flicked-toward snap point
   *
   * @param {PointerEvent} e
   */
  _onHandlePointerUp(e) {
    this._endDrag(e.currentTarget, e.pointerId);
    this._settleSheet();
  }

  /**
   * @method _onHandlePointerCancel
   * @description defensive handling if the OS interrupts the gesture (eg an
   * incoming call) - settle the same as a normal pointer up rather than
   * leaving the sheet in a half-dragged state with listeners still attached
   *
   * @param {PointerEvent} e
   */
  _onHandlePointerCancel(e) {
    this._endDrag(e.currentTarget, e.pointerId);
    this._settleSheet();
  }

  /**
   * @method _endDrag
   * @description remove the temporary drag listeners/pointer capture
   *
   * @param {HTMLElement} handle
   * @param {Number} pointerId
   */
  _endDrag(handle, pointerId) {
    handle.removeEventListener('pointermove', this._onHandlePointerMoveBound);
    handle.removeEventListener('pointerup', this._onHandlePointerUpBound);
    handle.removeEventListener('pointercancel', this._onHandlePointerCancelBound);
    try { handle.releasePointerCapture(pointerId); } catch(e) {}
  }

  /**
   * @method _settleSheet
   * @description end a drag by either closing the sheet (a fast downward
   * flick, or releasing at/below SHEET_MIN_VH) or simply staying at whatever
   * height it was released at - there are no fixed snap points to jump to,
   * so the sheet rests exactly where the reader left it
   */
  _settleSheet() {
    this._dragActive = false;
    const sheet = this.shadowRoot.querySelector('.transcript-panel');
    if( sheet ) sheet.classList.remove('dragging');

    const liveVh = this._liveHeightVh;
    this._dragStartY = null;
    this._liveHeightVh = null;
    if( liveVh == null ) return;

    let velocity = 0;
    const samples = this._dragSamples || [];
    if( samples.length >= 2 ) {
      const a = samples[samples.length - 2];
      const b = samples[samples.length - 1];
      const dt = b.t - a.t;
      if( dt > 0 ) velocity = (((a.y - b.y) / window.innerHeight) * 100) / dt;
    }

    const shouldClose = velocity < -FLICK_VELOCITY_VH_PER_MS || liveVh <= SHEET_MIN_VH;

    if( shouldClose ) {
      if( sheet ) sheet.style.removeProperty('--sheet-height');
      this._onSheetClose();
      return;
    }

    this._heightVh = liveVh;
    this._applySheetHeight();
    this._dispatchDragProgress(this._progressFor(liveVh));
  }
}

customElements.define('app-transcript-panel', AppTranscriptPanel);
