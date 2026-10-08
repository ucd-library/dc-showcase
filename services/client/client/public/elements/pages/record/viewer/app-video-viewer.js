// https://github.com/sampotts/plyr
// https://github.com/google/shaka-player/
// https://github.com/google/shaka-player/tree/master/docs/tutorials

import { LitElement } from "lit"
import render from "./app-video-viewer.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import "../../../utils/app-share-btn";
import "./app-transcript-panel";

import config from "../../../../lib/config"
import utils from "../../../../lib/utils"
import videoLibs from "../../../../lib/utils/video-lib-loader"

import plyrCss from "plyr/dist/plyr.css"
import shakaCss from "shaka-player/dist/controls.css"
let VIDEO_STYLES = plyrCss+shakaCss;

import spriteSheet from "plyr/dist/plyr.svg"
let SPRITE_SHEET = spriteSheet

// Very dump.  To remove the 'Shaka Player TextTrack'
// you have to override this...
class SimpleTextDisplayer {
  constructor(video) {}
  remove() {return true}
  destroy() {}
  append(cues) {}
  setTextVisibility(on) {}
  isTextVisible() {return false}
}

export default class AppVideoViewer extends Mixin(LitElement)
  .with(LitCorkUtils) {
  
  static get properties() {
    return {
      player: {type: Object},
      tracks: {type: Array},
      libsLoaded : {type: Boolean},
      transcriptCues: {type: Array},
      activeCueId: {type: String},
      showTranscript: {type: Boolean},
      isMultimedia: {type: Boolean},
      sheetState: {type: String},
      // reflected to an attribute so the :host([fullscreen]) CSS can respond -
      // can't be bound from this component's own template since a render()
      // result sets shadow content, not host attributes
      fullscreen: {type: Boolean, reflect: true}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this._injectModel('AppStateModel', 'MediaModel');
    this.tracks = [];
    this.player = {};
    this.libsLoaded = false;
    this.transcriptCues = [];
    this.activeCueId = null;
    this.showTranscript = false;
    this.isMultimedia = false;
    // mirrors app-transcript-panel's own sheetState on mobile - drives this
    // viewer's :host([fullscreen]) CSS since the panel can't reach into this
    // component's shadow DOM to resize the <video> itself. The video-shrink
    // amount itself is driven continuously by --sheet-progress (see
    // _onTranscriptSheetDrag), not by sheetState/fullscreen.
    this.sheetState = 'closed';
    this.fullscreen = false;
  }

  _onAppStateUpdate(e) {
    if ( this.fullPath !== e.location.fullpath ) {
      this._stop();
    }

    if( !e.selectedRecord ) return;

    this.fullPath = e.location.fullpath;

    // TODO change to support multiple media groups
    let media = e.selectedRecord.clientMedia?.mediaGroups[0];

    // avoid reloading/restarting the current video for app state updates that
    // aren't actually about a different media selection (eg nav thumbnail paging)
    if( media && this.media && media['@id'] === this.media['@id'] ) return;

    this._onSelectedRecordMediaUpdate(media);
  }

  async firstUpdated(e) {
    this._onAppStateUpdate(await this.AppStateModel.get());

    requestAnimationFrame(async () => {
      // webpack module is base64 encoded URL, check if this happened 
      // and decode, then set svg to innerHtml inside the shadow dom.
      if( SPRITE_SHEET.indexOf('data:image/svg+xml;base64') > -1 ) {
        SPRITE_SHEET = atob(SPRITE_SHEET.replace('data:image/svg+xml;base64,', ''));
      }
      this.shadowRoot.querySelector('#sprite-plyr').innerHTML = SPRITE_SHEET;
    
      // decide where to put css
      // The PLYR library isn't aware of shadydom so we need to manually
      // place our styles in document.head w/o shadydom touching them.
      let plyrStyles = document.createElement('style');
      plyrStyles.innerHTML = VIDEO_STYLES;
      if( window.ShadyDOM && window.ShadyDOM.inUse ) {
        document.head.appendChild(plyrStyles);
        this.hideControls = false;
      } else {
        this.shadowRoot.appendChild(plyrStyles);
        this.hideControls = true;
      }
    });    
  }

  /**
   * @method _onSelectedRecordMediaUpdate
   * @description from AppStateModel, called when a records media is selected
   * 
   * @param {Object} media 
  **/
  async _onSelectedRecordMediaUpdate(media) {
    if( !media ) return;
    let mediaType = utils.getMediaType(media);
    if (mediaType !== 'VideoObject' && mediaType !== 'StreamingVideo') return;

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

    // if we have already loaded the player and shaka libraries
    // then we can go ahead and load the video
    if( this.libsLoaded ) {
      this._loadVideo();
      return;
    }

    // dynamically load plyr and shaka libs
    let {plyr, shaka} = await videoLibs.load();

    // alert user if video playback is not supported
    let plyr_supported = plyr.supported('video', 'html5', true);
    let shaka_supported = shaka.Player.isBrowserSupported();
    if( !plyr_supported || !shaka_supported ) {
      return alert('Your browser does not support video playback');
    }

    let videoEle = this.shadowRoot.getElementById('video');

    this.plyr = new plyr(videoEle, {
      hideControls: this.hideControls,
      fullscreen : { enabled: false }, // fallback: true, iosNative: true },
      captions: {update: false},
      // keyboard: {global: true},
      controls : ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions'] //, 'fullscreen'],
    });

    // Construct a Player to wrap around the <video> tag.
    this.shaka = new shaka.Player(videoEle, );
    this.shaka.configure({
      textDisplayFactory : SimpleTextDisplayer
    });

    this.shaka.addEventListener('error', e => this.logger.error('shaka error', e));
    
    this.libsLoaded = true;
    await this._loadVideo();
  }

  /**
   * @method _loadVideo
   * @description load url into shaka for current media
   */
  async _loadVideo() {
    if( !this.media ) return;

    let mediaType = utils.getMediaType(this.media);
    let manifestUri = this.media['@id'];

    if( this.media.clientMedia?.streamingVideo?.manifest ) {
      manifestUri = this.media.clientMedia.streamingVideo.manifest;
    } else if( mediaType === 'StreamingVideo' ) {
      manifestUri += '/playlist.m3u8'
    }

    try {
      await this.shaka.load(manifestUri);
      // wait for the <track> elements reflecting the current tracks array to
      // actually be in the DOM before we go looking for their native TextTracks
      await this.updateComplete;
      this._attachTranscript();
    } catch(error) {
      this.logger.error('Error code: ', error.code, 'object', error);
    }
  }

  /**
   * @method _attachTranscript
   * @description find the default (or first) caption track for the current video,
   * wait for its cues to be parsed, and wire up the listeners that drive the
   * transcript panel. Safe to call repeatedly - tears down any previous track's
   * listeners first, since Shaka reloading the manifest can reset track readiness
   * and the underlying <track> elements aren't guaranteed to be the same ones
   * across a media/record switch.
   */
  _attachTranscript() {
    this._teardownTranscript();

    if( !this.tracks.length ) return;

    const videoEle = this.shadowRoot.getElementById('video');
    if( !videoEle ) return;

    let index = this.tracks.findIndex(t => t.default);
    if( index === -1 ) index = 0;

    const trackEle = videoEle.querySelectorAll('track')[index];
    const textTrack = videoEle.textTracks[index];
    if( !trackEle || !textTrack ) return;

    this._activeTrackEle = trackEle;
    this._activeTextTrack = textTrack;
    this._activeMediaEle = videoEle;

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
    this._onTimeUpdateBound = () => this._onMediaTimeUpdate(videoEle);
    videoEle.addEventListener('timeupdate', this._onTimeUpdateBound);
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
    if( !this.plyr ) return;
    this.plyr.currentTime = cue.start;
    // optimistic update - timeupdate will confirm this on its next tick anyway,
    // but there's no reason to wait for that just to highlight the line the
    // user explicitly clicked
    this.activeCueId = cue.id;
    if( !this.plyr.playing ) this.plyr.play();
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
   * fullscreen shell/video-shrink CSS can respond, locks/unlocks page scroll
   * while the sheet is open, and closes the transcript (same property the
   * toggle button uses) when the sheet is dismissed, so the button and the
   * sheet's own swipe-to-dismiss never disagree about state
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
   * @method _onTranscriptSheetDrag
   * @description bound to the transcript panel's transcript-sheet-drag event -
   * writes the sheet's current height progress (0-1 across its full draggable
   * range) directly onto .media-wrap as a CSS custom property (rather than a
   * Lit property) so the video can shrink continuously in step with the
   * sheet - both live during a drag and at rest - without a full render on
   * every animation frame
   *
   * @param {CustomEvent} e detail: {progress} 0-1
   */
  _onTranscriptSheetDrag(e) {
    const mediaWrap = this.shadowRoot.querySelector('.media-wrap');
    if( mediaWrap ) mediaWrap.style.setProperty('--sheet-progress', e.detail.progress);
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
   */
  _stop() {
    const video = this.shadowRoot.querySelector('#video');
    video.pause();

    this._teardownTranscript();

    // switching records shouldn't leave a stuck-open transcript - on mobile
    // this would otherwise leave the fullscreen sheet shell/scroll-lock
    // active on the newly-loaded record
    if( this.sheetState !== 'closed' ) utils.lockBodyScroll(false);
    this.showTranscript = false;
    this.sheetState = 'closed';
    this.fullscreen = false;

    if ( this.plyr === undefined || this.plyr === null ) return;

    if (Object.entries(this.plyr).length != 0) {
      this.plyr.stop();
    };
  }
}

customElements.define('app-video-viewer', AppVideoViewer);