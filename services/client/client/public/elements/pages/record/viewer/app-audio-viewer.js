// https://github.com/sampotts/plyr
// https://github.com/google/shaka-player/
// https://github.com/google/shaka-player/tree/master/docs/tutorials

import { LitElement } from "lit";

import render from "./app-audio-viewer.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import "../../../utils/app-share-btn";
import "./app-transcript-panel";

import config from "../../../../lib/config";
import utils from "../../../../lib/utils";
import videoLibs from "../../../../lib/utils/video-lib-loader";
import bytes from "bytes";

import plyrCss from "plyr/dist/plyr.css";
import shakaCss from "shaka-player/dist/controls.css";
let AUDIO_STYLES = plyrCss+shakaCss;

import spriteSheet from "plyr/dist/plyr.svg";
let SPRITE_SHEET = spriteSheet;

export default class AppAudioViewer extends Mixin(LitElement)
  .with(LitCorkUtils) {
  
  static get properties() {
    return {
      isMultimedia : { type : Boolean },
      transcript : { type : Object },
      rootRecord : { type : Object },
      tracks: {type: Array},
      transcriptCues: {type: Array},
      activeCueId: {type: String},
      showTranscript: {type: Boolean},
      sheetState: {type: String},
      // reflected to an attribute so the :host([fullscreen]) CSS can respond -
      // can't be bound from this component's own template since a render()
      // result sets shadow content, not host attributes
      fullscreen: {type: Boolean, reflect: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.isMultimedia = false;
    this.transcript = null;
    this.rootRecord = null;
    this.tracks = [];
    this.transcriptCues = [];
    this.activeCueId = null;
    this.showTranscript = false;
    // mirrors app-transcript-panel's own sheetState on mobile - drives this
    // viewer's :host([fullscreen]) CSS since the panel can't reach into this
    // component's shadow DOM directly
    this.sheetState = 'closed';
    this.fullscreen = false;

    this._injectModel('AppStateModel', 'MediaModel');
    this.libsLoaded = false;
    this.$ = {};
  }

  async _onAppStateUpdate(e) {
    if ( this.fullPath !== e.location.fullpath ) { 
      this._stop();
    }

    this.fullPath = e.location.fullpath;
    this._updateStyles();

    let selectedRecord = await this.AppStateModel.getSelectedRecord();
    if( selectedRecord && selectedRecord.selectedMedia ) this._onSelectedRecordMediaUpdate(selectedRecord.selectedMedia);
  }

  /**
   * @method _onSelectedRecordUpdate
   * @description from AppStateModel/AppStateStore's dedicated 'selected-record-update'
   * event (fired by setSelectedRecord) - unlike the generic _onAppStateUpdate, this is
   * guaranteed to fire with clientMedia already populated, so this is where transcript
   * should be read from (see app-media-download.js for the same pattern).
   *
   * @param {Object} record
   */
  _onSelectedRecordUpdate(record) {
    this.transcript = record?.clientMedia?.transcript || null;
    this.rootRecord = record?.graph?.root || null;
  }

  /**
   * @method _transcriptLabel
   * @description build the "Transcript: PDF (2.1mb)" style label shown above the player
   *
   * @returns {String}
   */
  _transcriptLabel() {
    if( !this.transcript ) return '';
    let format = (this.transcript.format || '').toUpperCase();
    let size = this.transcript.fileSize ? ' (' + bytes(this.transcript.fileSize).toLowerCase() + ')' : '';
    return `${this.transcript.label}: ${format}${size}`;
  }

  async firstUpdated(e) {
    this.$.audio  = this.shadowRoot.getElementById('audio_player');
    this.$.poster = this.shadowRoot.getElementById('audio_poster');

    this.fullPath = (await this.AppStateModel.get()).location.fullpath;
    
    // webpack module is base64 encoded URL, check if this happened 
    // and decode, then set svg to innerHtml inside the shadow dom.
    if( SPRITE_SHEET.indexOf('data:image/svg+xml;base64') > -1 ) {
      SPRITE_SHEET = atob(SPRITE_SHEET.replace('data:image/svg+xml;base64,', ''));
    }
    this.shadowRoot.querySelector('#sprite-plyr').innerHTML = SPRITE_SHEET;

    this._updateStyles();

    // On a cold/direct page load, this element lives in a lazily-loaded chunk that can
    // finish connecting AFTER RecordModel has already fetched the record and fired its
    // one-shot 'selected-record-update'/'app-state-update' events - those are lost by
    // the time we start listening. Resync with whatever is already selected, mirroring
    // app-media-viewer.js/app-media-download.js's firstUpdated().
    let selectedRecord = await this.AppStateModel.getSelectedRecord();
    if( selectedRecord ) {
      this._onSelectedRecordUpdate(selectedRecord);
      if( selectedRecord.selectedMedia ) this._onSelectedRecordMediaUpdate(selectedRecord.selectedMedia);
    }
  }

  _updateStyles() {
    // decide where to put css
    // The PLYR library isn't aware of shadydom so we need to manually
    // place our styles in document.head w/o shadydom touching them.
    let plyrStyles = document.createElement('style');
    plyrStyles.innerHTML = AUDIO_STYLES;
    if( window.ShadyDOM && window.ShadyDOM.inUse ) {
      document.head.appendChild(plyrStyles);
      this.hideControls = false;
    } else {
      this.shadowRoot.appendChild(plyrStyles);
      this.hideControls = true;
    }
  }

  /**
   * @method _onSelectedRecordMediaUpdate
   * @description from AppStateModel, called when a records media is selected
   * 
   * @param {Object} media 
  **/
  async _onSelectedRecordMediaUpdate(media) {
    if( !media ) return;
    if ( utils.getMediaType(media) !== 'AudioObject' ) return;

    this.media = media;

    // find associated captions and prep to tracks array
    this.tracks = utils.asArray(media, 'caption')
      .filter(caption => caption['@id'] !== undefined )
      .map(caption => {
        let lng = caption.language;
        let setDefault = (lng === 'en' ? true : false);

        return {
          kind: 'captions',
          label: utils.getLanguage(lng),
          srclang: lng,
          src: config.fcrepoBasePath+caption['@id'],
          default: setDefault
        };
      });

    if( this.libsLoaded ) {
      this._loadAudio();
      return;
    }

    // dynamically load plyr and shaka libs
    let {plyr} = await videoLibs.load();

    this.audioPlayer = new plyr(this.$.audio, {
      fullscreen : {enabled: false},
      captions: {update: false},
      controls : ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions']
    });

    this.style.display = 'block';
    this.libsLoaded = true;
    this._loadAudio();

    this._updateStyles();
  }

  async _loadAudio() {
    let sourceEle = this.shadowRoot.querySelector('#audio_player source');
    // argonath-indexed items carry a playable url (a /cask/file/ silver path)
    sourceEle.src = this.media.clientMedia?.audio?.url || this.media['@id'];
    sourceEle.type = this.media.fileFormat || this.media.hasMimeType || this.media.encodingFormat || '';

    // FF Hack.  Range slider not going back to 0 on stop
    try {
      this.audioPlayer.stop();
      let ele = this.shadowRoot.querySelector('input[type="range"][data-plyr="seek"]');
      if( ele ) ele.value = 0;
    } catch(e) {}

    this.shadowRoot.querySelector('#audio_player').load();

    let poster = this.media.thumbnailUrl  ? this.media.thumbnailUrl+'/svc:iiif/full/,400/0/default.jpg' : '';
    if ( poster ) {
      this.$.poster.style.display = 'block';
      this.$.poster.style.backgroundImage = "url(" + poster + ")";
    } else {
      this.$.poster.style.display = 'none';
    }

    // wait for the <track> elements reflecting the current tracks array to
    // actually be in the DOM before we go looking for their native TextTracks
    await this.updateComplete;
    this._attachTranscript();
  }

  /**
   * @method _attachTranscript
   * @description find the default (or first) caption track for the current audio,
   * wait for its cues to be parsed, and wire up the listeners that drive the
   * transcript panel. Safe to call repeatedly - tears down any previous track's
   * listeners first, since the underlying <track> elements aren't guaranteed to
   * be the same ones across a media/record switch.
   */
  _attachTranscript() {
    this._teardownTranscript();

    if( !this.tracks.length ) return;

    const audioEle = this.shadowRoot.getElementById('audio_player');
    if( !audioEle ) return;

    let index = this.tracks.findIndex(t => t.default);
    if( index === -1 ) index = 0;

    const trackEle = audioEle.querySelectorAll('track')[index];
    const textTrack = audioEle.textTracks[index];
    if( !trackEle || !textTrack ) return;

    this._activeTrackEle = trackEle;
    this._activeTextTrack = textTrack;
    this._activeMediaEle = audioEle;

    this._onTrackLoad = () => this._buildCueArray(textTrack);
    trackEle.addEventListener('load', this._onTrackLoad);
    // HTMLTrackElement.LOADED - in case 'load' already fired before we attached
    if( trackEle.readyState === 2 ) this._buildCueArray(textTrack);

    // fallback in case 'load' never fires (seen intermittently in some browsers) -
    // cuechange can't fire before cues exist, so it's a safe one-time trigger
    this._onCueChangeBound = () => this._buildCueArray(textTrack);
    textTrack.addEventListener('cuechange', this._onCueChangeBound);

    // drive the highlighted line from the media element's own currentTime rather
    // than the native TextTrack activeCues snapshot - activeCues was reporting a
    // cue behind the one cuechange had just announced, showing up as the
    // highlight always lagging one section behind actual playback
    this._onTimeUpdateBound = () => this._onMediaTimeUpdate(audioEle);
    audioEle.addEventListener('timeupdate', this._onTimeUpdateBound);
  }

  /**
   * @method _buildCueArray
   * @description convert a TextTrack's live TextTrackCueList into a plain array
   * of {id, start, end, text} objects for the transcript panel to render
   *
   * @param {TextTrack} track
   */
  _buildCueArray(track) {
    if( !track.cues || this.transcriptCues.length ) return;
    this.transcriptCues = Array.from(track.cues).map(cue => ({
      id: cue.id || String(cue.startTime),
      start: cue.startTime,
      end: cue.endTime,
      text: this._stripCueMarkup(cue.text)
    }));
  }

  /**
   * @method _stripCueMarkup
   * @description strip WebVTT inline markup (eg <b>, <i>, voice tags) from cue text,
   * since the transcript panel renders plain text
   *
   * @param {String} text
   *
   * @returns {String}
   */
  _stripCueMarkup(text) {
    return (text || '').replace(/<[^>]+>/g, '');
  }

  /**
   * @method _onMediaTimeUpdate
   * @description compute which transcript cue is active directly from the media
   * element's currentTime against our own parsed cue list, rather than trusting
   * the TextTrack's activeCues snapshot - some browsers report activeCues a beat
   * stale relative to the cuechange event announcing it, which is simplest to
   * sidestep entirely since we already have the cue start/end times ourselves.
   *
   * @param {HTMLMediaElement} mediaEle
   */
  _onMediaTimeUpdate(mediaEle) {
    if( !this.transcriptCues.length ) return;

    const time = mediaEle.currentTime;
    const activeCue = this.transcriptCues.find(c => time >= c.start && time < c.end);
    const newId = activeCue ? activeCue.id : null;
    if( newId === this.activeCueId ) return;

    this.activeCueId = newId;
  }

  /**
   * @method _onCueClick
   * @description bound to the shared transcript panel's cue-click event - seek
   * playback to the clicked cue's timestamp and resume if paused
   *
   * @param {CustomEvent} e detail is the clicked cue {id, start, end, text}
   */
  _onCueClick(e) {
    const cue = e.detail;
    if( !this.audioPlayer ) return;
    this.audioPlayer.currentTime = cue.start;
    // optimistic update - timeupdate will confirm this on its next tick anyway,
    // but there's no reason to wait for that just to highlight the line the
    // user explicitly clicked
    this.activeCueId = cue.id;
    if( !this.audioPlayer.playing ) this.audioPlayer.play();
  }

  /**
   * @method _onTranscriptToggle
   * @description show/hide the transcript panel
   */
  _onTranscriptToggle() {
    this.showTranscript = !this.showTranscript;
  }

  /**
   * @method _onTranscriptSheetChange
   * @description bound to the transcript panel's mobile bottom-sheet
   * transcript-sheet-change event - mirrors its snap state so this viewer's
   * fullscreen shell CSS can respond, locks/unlocks page scroll while the
   * sheet is open, and closes the transcript (same property the toggle
   * button uses) when the sheet is dismissed, so the button and the sheet's
   * own swipe-to-dismiss never disagree about state
   *
   * @param {CustomEvent} e detail: {state: 'closed'|'open'}
   */
  _onTranscriptSheetChange(e) {
    const state = e.detail.state;
    const wasClosed = this.sheetState === 'closed';
    this.sheetState = state;
    this.fullscreen = state !== 'closed';

    // entering fullscreen - pin this component to the top of the viewport
    // before locking scroll there, rather than fighting the site header's own
    // stacking context with position:fixed
    if( state !== 'closed' && wasClosed ) this.scrollIntoView({block: 'start'});
    utils.lockBodyScroll(state !== 'closed');

    if( state === 'closed' ) this.showTranscript = false;
  }

  /**
   * @method _teardownTranscript
   * @description remove any transcript-related listeners and reset transcript
   * state - called before re-attaching to a new track and when playback stops
   */
  _teardownTranscript() {
    if( this._activeTrackEle && this._onTrackLoad ) {
      this._activeTrackEle.removeEventListener('load', this._onTrackLoad);
    }
    if( this._activeTextTrack && this._onCueChangeBound ) {
      this._activeTextTrack.removeEventListener('cuechange', this._onCueChangeBound);
    }
    if( this._activeMediaEle && this._onTimeUpdateBound ) {
      this._activeMediaEle.removeEventListener('timeupdate', this._onTimeUpdateBound);
    }
    this._activeTrackEle = null;
    this._activeTextTrack = null;
    this._activeMediaEle = null;
    this._onTrackLoad = null;
    this._onCueChangeBound = null;
    this._onTimeUpdateBound = null;
    this.transcriptCues = [];
    this.activeCueId = null;

    // clear any stale search filter left over from a previous track, since
    // the panel owns that state itself
    this.shadowRoot.querySelector('app-transcript-panel')?.reset();
  }

  /**
   * Stop playback and reset to start
   **/
  _stop() {
    this._teardownTranscript();

    // switching records shouldn't leave a stuck-open transcript - on mobile
    // this would otherwise leave the fullscreen sheet shell/scroll-lock
    // active on the newly-loaded record
    if( this.sheetState !== 'closed' ) utils.lockBodyScroll(false);
    this.showTranscript = false;
    this.sheetState = 'closed';
    this.fullscreen = false;

    if( !this.audioPlayer ) return;
    this.audioPlayer.stop();
  }
}

customElements.define('app-audio-viewer', AppAudioViewer);