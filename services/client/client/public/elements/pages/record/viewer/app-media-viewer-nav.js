import { LitElement } from "lit";

import render from "./app-media-viewer-nav.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

// import "@polymer/paper-icon-button"
import "../../../utils/app-share-btn";
import utils from "../../../../lib/utils";
import "@ucd-lib/theme-elements/ucdlib/ucdlib-icon/ucdlib-icon";
import "../../../utils/app-icons";

export default class AppMediaViewerNav extends Mixin(LitElement).with(
  LitCorkUtils
) {
  static get properties() {
    return {
      totalThumbnailWidth: { type: Number }, // thumbnail width w/ border and margin
      icon: { type: String },
      iconWidth: { type: Number },
      thumbnails: { type: Array },
      thumbnailsPerFrame: { type: Number },
      leftMostThumbnail: { type: Number },
      breakControls: { type: Boolean },
      showNavLeft: { type: Boolean },
      showNavRight: { type: Boolean },
      isLightbox: { attribute: "is-lightbox", type: Boolean },
      isBookReader: { type: Boolean },
      hideZoom: { type: Boolean },
      brSinglePage: { type: Boolean },
      brFullscreen: { type: Boolean },
      overrideImageList: { type: Boolean },
      singleImage: { type: Boolean },
      mediaList: { type: Array },
      showOpenLightbox: { type: Boolean },
      searchingText: { type: Boolean },
      searching: { type: Boolean },
      brSearch: { type: Boolean },
      selectedResult: { type: Number },
      searchResults: { type: Array },
      searchResultsCount: { type: Number },
      isMultimedia: { type: Boolean },
      hidePageToggle: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.active = true;

    this.totalThumbnailWidth = 68;
    this.icon = "";
    this.iconWidth = 36;

    this._reset();

    window.addEventListener("resize", () => this._resize());
    window.addEventListener("touchend", (e) => this._onTouchEnd(e));
    window.addEventListener("touchcancel", (e) => this._onTouchEnd(e));
    window.addEventListener("touchmove", (e) => this._onTouchMove(e));
    this.addEventListener("touchstart", (e) => this._onTouchStart(e));

    this._injectModel("AppStateModel", "MediaModel", "BookReaderModel", "CollectionModel");
  }

  connectedCallback() {
    super.connectedCallback();
    this._syncAttributeState();
  }

  _syncAttributeState() {
    this.isLightbox = this.hasAttribute('is-lightbox');
  }

  async firstUpdated() {
    this._onSelectedRecordUpdate(await this.AppStateModel.getSelectedRecord());
    this._resize(true);

    let screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if( screenWidth < 800 ) {
      this.brSinglePage = true;
    }
  }

  _onAppStateUpdate(e) {
    if( this.AppStateModel.location.page !== 'item' ) this._reset();

    if (e.mediaViewerNavLeftMostThumbnail === undefined) return;
    if (e.mediaViewerNavLeftMostThumbnail === this.leftMostThumbnail) return;

    this.leftMostThumbnail = e.mediaViewerNavLeftMostThumbnail;
  }

  async _getItemDisplayType(itemId, collectionId) {
    if( !collectionId ) return;

    let edits;
    try {
      edits = await this.CollectionModel.getCollectionEdits(collectionId);
    } catch (error) {
      this.logger.warn('Error retrieving collection edits', error);
    }

    if( edits.state !== 'loaded' ) return null;
    if( !Object.keys(edits.payload).length ) return null;

    let collectionEdits = edits.payload?.collection || {};
    let itemEdits = edits.payload?.items || {};

    return itemEdits[itemId]?.itemDefaultDisplay || collectionEdits.itemDefaultDisplay;
  }

  _onBookreaderStateUpdate(e) {
    this.brFullscreen = e.fullscreen;
    this.selectedResult = e.selectedSearchResult + 1;
    this.searching = e.searchActive;

    this.searchResults = [];
    if( e.searchResults?.state === 'loaded' ) {
      let searchResults = e.searchResults.payload || {};
      searchResults = Object.keys(searchResults).map(key => searchResults[key]);
      searchResults.forEach(result => {
        this.searchResults.push(...result);
      });
    }
    this.searchResultsCount = this.searchResults.length;
  }

  /**
   * @method _onTouchEnd
   * @description bound to window touch end/cancel events. if we are
   * performing a touch (swipe) action, see if we have reached the
   * threshold for swipe and if so, page left/right
   *
   * @param {Object} e HTML touch event
   */
  _onTouchEnd(e) {
    if (!this.touchAction) return;
    this.touchAction = false;

    let diff = this.touchStartX - this.touchCurrentX;
    let sdiff = Math.abs(diff);

    if (sdiff > this.totalThumbnailWidth / 2) {
      if (diff < 0) this._pageLeft();
      else this._pageRight();
    }
  }

  /**
   * @method _onTouchMove
   * @description bound to windows touch move event. if we are performing
   * a touch (swipe) action, need to keep track of current x offset
   *
   * @param {Object} e HTML touch event
   */
  _onTouchMove(e) {
    if (!this.touchAction) return;
    this.touchCurrentX = e.touches[0].clientX;
  }

  /**
   * @method _onTouchStart
   * @description bound to this elements touchstart event.
   * start performing a touch (swipe) action
   *
   * @param {Object} e HTML touch event
   */
  _onTouchStart(e) {
    this.touchAction = true;
    this.touchStartX = e.touches[0].clientX;
    this.touchCurrentX = e.touches[0].clientX;
  }

  /**
   * @method _resize
   * @description update thumbnail preview on resize
   *
   */
  _resize(updateThumbnailWindow=false) {
    let w = window.innerWidth;

    // grrrr
    if (w === 0) {
      // setTimeout(() => this._resize(), 200);
      return;
    }

    w -= 16; // padding

    this._setNavBreak(w);

    let iconsWidth;
    if (this.breakControls) {
      iconsWidth = this.iconWidth * 2;
    } else {
      iconsWidth = this.iconWidth * 4;
      if (this.isLightbox) iconsWidth += this.iconWidth * 2;
    }

    let spaceBuffer = window.innerWidth < 1000 ? 0.35 : 0.42;
    let availableThumbSpace = Math.min(w - iconsWidth, w * spaceBuffer);

    this.thumbnailsPerFrame = Math.max(
      Math.floor(availableThumbSpace / this.totalThumbnailWidth),
      1
    );
    
    this.thumbnailContainerWidth = this.thumbnailsPerFrame * this.totalThumbnailWidth;

    if( updateThumbnailWindow ) {
      let selectedThumbnail = this.thumbnails.findIndex(t => t.selected);
      if( selectedThumbnail ) {
        this.leftMostThumbnail = Math.floor(selectedThumbnail / Math.max(this.thumbnailsPerFrame, 1)) * this.thumbnailsPerFrame;
        if( this.leftMostThumbnail < 0 ) this.leftMostThumbnail = 0;
      }  
    }

    if (this.isLightbox) this.thumbnailsPerFrame *= 2;
    let thumbnailContainer = this.shadowRoot.querySelector("#thumbnails");
    if (!thumbnailContainer) return;
    
    thumbnailContainer.style.width = this.thumbnailContainerWidth + 'px';

    this.showNavLeft = this.leftMostThumbnail !== 0;
    this.showNavRight = !this._showingLastThumbFrame();

    this._updateThumbnailContainerPos();
  }

  _getTotalIconWidth() {
    let totalIconWidth = this.iconWidth * 4; // nav icons and default icons
    if (this.isLightbox) totalIconWidth += this.iconWidth * 2;
    return totalIconWidth;
  }

  _setNavBreak(width) {
    let totalIconWidth = this.iconWidth * 4; // nav icons and default icons
    if (this.isLightbox) totalIconWidth += this.iconWidth * 2;

    if (totalIconWidth + this.totalThumbnailWidth * 4 > width) {
      this.breakControls = true;
    } else {
      this.breakControls = false;
    }
  }

  _pageLeft() {
    this.leftMostThumbnail = this.leftMostThumbnail - this.thumbnailsPerFrame;
    if (this.leftMostThumbnail < 0) this.leftMostThumbnail = 0;
    this._resize();
    this.AppStateModel.set({
      mediaViewerNavLeftMostThumbnail: this.leftMostThumbnail,
    });
  }

  _pageRight() {
    if (this._showingLastThumbFrame()) return;
    this.leftMostThumbnail = this.leftMostThumbnail + this.thumbnailsPerFrame;
    this._resize();
    this.AppStateModel.set({
      mediaViewerNavLeftMostThumbnail: this.leftMostThumbnail,
    });
  }

  _prevSearchResult(e) {
    if (this.selectedResult === 1) return;
    this.selectedResult = this.selectedResult - 1;
    this.dispatchEvent(
      new CustomEvent("br-change-search-result", {
        detail: {
          selectedResult: this.selectedResult,
        },
      })
    );
  }

  _nextSearchResult(e) {
    if (this.selectedResult === this.searchResultsCount) return;
    this.selectedResult = this.selectedResult + 1;
    this.dispatchEvent(
      new CustomEvent("br-change-search-result", {
        detail: {
          selectedResult: this.selectedResult,
        },
      })
    );
  }

  _showingLastThumbFrame() {
    if (
      this.leftMostThumbnail + this.thumbnailsPerFrame >
      this.thumbnails.length - 1
    ) {
      return true;
    }
    return false;
  }

  _updateThumbnailContainerPos() {
    // that +1 is a hack, what am I missing !?
    this.shadowRoot.querySelector("#thumbnailInnerContainer").style.marginLeft =
      -1 * this.leftMostThumbnail * (this.totalThumbnailWidth + 1) + "px";

    let lastThumb = this.leftMostThumbnail + this.thumbnailsPerFrame;
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.disabled = index < this.leftMostThumbnail || index >= lastThumb;
    });
  }

  _reset() {
    this.thumbnails = [];
    this.thumbnailsPerFrame = 10;
    this.leftMostThumbnail = 0;
    this.breakControls = true;
    this.showNavLeft = false;
    this.showNavRight = false;
    this._syncAttributeState();
    this.isBookReader = false;
    this.hideZoom = false;
    this.brSinglePage = false;
    this.overrideImageList = false;
    this.brFullscreen = false;
    this.singleImage = false;
    this.mediaList = [];
    this.showOpenLightbox = false;
    this.searchingText = false;
    this.brSearch = false;
    this.searching = false;
    this.selectedResult = 1;
    this.searchResults = [];
    this.searchResultsCount = 0;
    this.isMultimedia = false;
    this.hidePageToggle = false;
  }

  /**
   * @method _onSelectedRecordUpdate
   * @description from AppStateInterface, called when a record is selected
   *
   * @param {Object} record selected record
   */
  async _onSelectedRecordUpdate(item) {
    if( !item ) return;

    let { graph, clientMedia, selectedMedia, selectedMediaPage} = item;

    let mediaGroups = clientMedia.mediaGroups || [];
    let audioMedia = mediaGroups.find(m => m.fileFormatSimple === 'audio');
    let videoMedia = mediaGroups.find(m => m.fileFormatSimple === 'video');
    if( audioMedia || videoMedia ) this.hideZoom = true;

    if ( clientMedia.mediaGroups.length === 1 &&
          selectedMediaPage === -1 ) {
      this.singleImage = true;
      return;
    }

    let thumbnails = [];

    // if this.isMultimedia, prepend thumbnails for video/audio media first
    if( this.isMultimedia ) {
      // check the display type for the item
      this.isBookReader = false; // for now, disable bookreader if multimedia.. aka imagelist

      let position = 1;
      if( audioMedia ) {
        let thumb = this._renderThumbnail(audioMedia, audioMedia.clientMedia.images || [], selectedMediaPage, 'audio');
        if( thumb ) {
          if( selectedMedia['@id'] === thumb.id ) {
            thumb.selected = true;
            this.hideZoom = true;
            this.hidePageToggle = true;
          } else {
            this.hideZoom = false;
            this.hidePageToggle = false;
          }
          thumb.position = position++;
          thumbnails.push(thumb);
        }
      }
    }

    let imagesFound = false;
    // prioritize imagelist, then pdf. else combine pages
    let imageList = (clientMedia.mediaGroups || []).filter(m => m['@shortType'].includes('ImageList'))?.[0];
    if( imageList?.clientMedia?.pages && !this.isBookReader ) {
      imagesFound = true;
      for( let page of imageList.clientMedia.pages ) {
        thumbnails.push(this._renderThumbnail(selectedMedia, page, selectedMediaPage));
      }
    }

    if( (!thumbnails.length || (!imagesFound && this.isMultimedia)) && !this.isBookReader ) {
      let pdf = (clientMedia.mediaGroups || []).filter(m => m.clientMedia.pdf)?.[0];
      if( pdf?.clientMedia?.pages ) {
        imagesFound = true;
        for( let page of pdf.clientMedia.pages ) {
          thumbnails.push(this._renderThumbnail(selectedMedia, page, selectedMediaPage));
        }
      }
    }

    if( (!thumbnails.length || (!imagesFound && this.isMultimedia)) && !this.isBookReader ) {
      for( let node of clientMedia.mediaGroups ) {
        if( !node.clientMedia.pages && !this.overrideImageList ) {
          thumbnails.push(this._renderThumbnail(selectedMedia, node.clientMedia.images, selectedMediaPage));
          continue;
        }
        if( !node.clientMedia.pages ) continue;
        for( let page of node.clientMedia.pages ) {
          thumbnails.push(this._renderThumbnail(selectedMedia, page, selectedMediaPage));
        }
      }
    }

    const ids = [];
    this.thumbnails = thumbnails
      .filter((element) => element !== null)
      .filter( (element) => {
        if ( ids.includes(element.id) ) {
          return false;
        }
        ids.push(element.id);
        return true;
      })

    this._resize(true);
  }

  _renderThumbnail(node, clientMediaPage, selectedMediaPage, mediaType) {
    let { fileType, iconType } = this._getFileAndIconType(node);

    // if (this.isLightbox && fileType !== "image") {
    //   return null;
    // }

    let thumbnailUrl = clientMediaPage.small?.url;
    if( !thumbnailUrl ) {
      thumbnailUrl = clientMediaPage.medium?.url;
    }
    if( !thumbnailUrl ) {
      thumbnailUrl = clientMediaPage.original?.url;
    }
    // if( thumbnailUrl && !thumbnailUrl.match(/\/svc:iiif\//) ) {
    //   thumbnailUrl += '/svc:iiif/full/,50/0/default.jpg';
    // }

    let uiPosition = clientMediaPage.uiPosition || clientMediaPage.page;

    let idRoot = node['@id'];
    if( this.isMultimedia ) {
      idRoot = clientMediaPage['@id']?.replace(/(\.[a-z0-9]+):\d+$/i, '$1') || node['@id'];
    }
    let thumbnail = {
      // id: node["@id"]+(!uiPosition || uiPosition === undefined ? '' : ':'+uiPosition),
      id: idRoot+(!uiPosition ? '' : ':'+uiPosition),
      icon: iconType,
      position: uiPosition,
      selected: uiPosition === selectedMediaPage,
      disabled: false,
      src: thumbnailUrl,
      // thumbnail: url
      mediaType
    };

    return thumbnail;
  }

  /**
   * @method _onSelectedRecordMediaUpdate
   * @description from AppStateInterface, called when a records media is selected
   *
   * @param {Object} media
   */
  _onSelectedRecordMediaUpdate(media) {
    this.media = media;
    if (!media) return;

    this.thumbnails.forEach((thumbnail, index) => {
      // this.set(`thumbnails.${index}.selected`, (this.media['@id'] === thumbnail.id));
    });

    let { fileType, iconType } = this._getFileAndIconType(media);

    this.showOpenLightbox = fileType === "image" ? true : false;
  }

  _getFileAndIconType(media) {
    let _file = "";
    let fileType = _file;
    let fileFormat = _file;
    let iconType = "";

    if (media.fileFormat || media.encodingFormat) {
      _file = media.fileFormat ? media.fileFormat : media.encodingFormat;

      fileType = _file.split("/").shift();
      fileFormat = _file.split("/").pop();
    }

    let type = utils.getMediaType(media);
    if (type === "AudioObject" || fileType === "audio")
      iconType = "sound-round";
    else if (
      type === "VideoObject" ||
      type === "StreamingVideo" ||
      fileType === "video"
    )
      iconType = "video-round";
    else if (fileFormat === "pdf") iconType = "blank-round";
    // TODO: Get back to this
    else if (fileType === "360") iconType = "360-round";

    return { fileType, iconType };
  }

  /**
   * @method _onZoomInClicked
   * @description bound to zoom icon click event.  emit zoom event
   *
   * @param {Object} e HTML click event
   */
  _onZoomInClicked(e) {
    this.dispatchEvent(new CustomEvent("zoom-in"));
  }

  /**
   * @method _onZoomOutClicked
   * @description bound to zoom icon click event.  emit zoom event
   *
   * @param {Object} e HTML click event
   */
  _onZoomOutClicked(e) {
    this.dispatchEvent(new CustomEvent("zoom-out"));
  }

  /**
   * @method _onBRZoomInClicked
   * @description bound to bookreader zoom icon click event.  emit zoom event
   *
   * @param {Object} e HTML click event
   */
  _onBRZoomInClicked(e) {
    this.dispatchEvent(new CustomEvent("br-zoom-in"));
  }

  /**
   * @method _onBRZoomOutClicked
   * @description bound to bookreader zoom icon click event.  emit zoom event
   *
   * @param {Object} e HTML click event
   */
  _onBRZoomOutClicked(e) {
    this.dispatchEvent(new CustomEvent("br-zoom-out"));
  }

  /**
   * @method _onToggleBookView
   * @description bound to book view single vs book mode click event.  emit event
   *
   * @param {Object} e HTML click event
   */
  _onToggleBookView(e) {
    // this.dispatchEvent(new CustomEvent("br-bookview-toggle"));  
    this.brSinglePage = !this.brSinglePage;
    this.BookReaderModel.setView(this.brSinglePage ? 'single' : 'double');
  }

  /**
   * @method _onExpandBookView
   * @description bound to book view full page click event.  emit event
   *
   * @param {Object} e HTML click event
   */
  _onExpandBookView(e) {
    this.BookReaderModel.setFullscreen(true);
    // this.dispatchEvent(new CustomEvent("br-expand-view"));
    this.brFullscreen = true;
  }

  /**
   * @method _onCollapseBookView
   * @description bound to book view full page collapse click event.  emit event
   *
   * @param {Object} e HTML click event
   */
  _onCollapseBookView(e) {
    this.BookReaderModel.setFullscreen(false);
    // this.dispatchEvent(new CustomEvent("br-collapse-view"));
    this.brFullscreen = false;
  }

  /**
   * @method _onSearchClicked
   * @description bound to search icon click event
   *
   * @param {Object} e HTML click event
   */
  _onSearchClicked(e) {
    this.searchingText = !this.searchingText;
  }

  /**
   * @method _onCloseClicked
   * @description bound to close icon click event.  emit close event
   *
   * @param {Object} e HTML click event
   */
  _onCloseClicked(e) {
    this.dispatchEvent(new CustomEvent("close"));
  }

  /**
   * @method setFocus
   * @description set focus to first clickable element
   */
  setFocus() {
    if ( this.singleImage && this.$ ) {
      if( !this.breakControls ) this.$.zoomOut1.focus();
      else this.$.zoomOut2.focus();
    } else {
      let firstBtn = this.shadowRoot.querySelector("button");
      if (firstBtn) firstBtn.focus();
    }
    // window.scrollTo(0, 0);
  }

  /**
   * @method _onSearchToggled
   * @description show/hide search panel
   */
  _onSearchToggled(e) {
    this.searching = !this.searching;
    this.BookReaderModel.setSearchActive(this.searching);
    this.dispatchEvent(new CustomEvent("br-search-toggle"));
  }
}

customElements.define("app-media-viewer-nav", AppMediaViewerNav);
