import { LitElement } from "lit";

import render from "./app-media-download.tpl.js";

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import config from "../../../lib/config";
import utils from "../../../lib/utils";
import bytes from "bytes";

export default class AppMediaDownload extends Mixin(LitElement).with(
  LitCorkUtils
) {
  static get properties() {
    return {
      defaultImage : { type: Boolean },
      formats : { type: Array },
      sources : { type: Array },
      href : { type: String },
      archiveHref : { type: String },
      imageSizes : { type: Array },
      hasMultipleDownloadMedia : { type: Boolean },
      selectedMediaHasSources : { type: Boolean },
      fullSetCount : { type: Boolean },
      fullSetSelected : { type: Boolean },
      downloadOptions : { type: Array },
      showImageFormats : { type: Boolean },
      selectedRecordMedia : { type: Object },
      isMultimedia : { type: Boolean },
      showDownloadLabel : { type: Boolean },
      zipConcatenatedPaths : { type: String },
      isTwoPageView : { type: Boolean },
      downloadAllMedia : { type: Boolean },
      isBookreader : { type: Boolean },
      disableDownload : { type: Boolean }
    };
  }

  constructor() {
    super();

    this.render = render.bind(this);
   
    this._reset();

    this._injectModel(
      "AppStateModel",
      "MediaModel",
      "CollectionModel",
      "BookReaderModel"
    );
  }

  async firstUpdated() {
    let selectedRecord = await this.AppStateModel.getSelectedRecord();
    if (selectedRecord) this._onSelectedRecordUpdate(selectedRecord);    
  }

  _reset() {
    this.active = true;

    this.defaultImage = true;
    this.formats = [];
    this.sources = [];
    this.href = "";
    this.archiveHref = "";
    this.imageSizes = [];
    this.hasMultipleDownloadMedia = false;
    this.selectedMediaHasSources = true;
    this.fullSetCount = 0;
    this.fullSetSelected = false;
    this.downloadOptions = [];
    this.showImageFormats = false;
    this.selectedRecordMedia = {};
    this.isMultimedia = false;
    this.zipConcatenatedPaths = "";
    this.isTwoPageView = false;
    this.downloadAllMedia = false;
    this.isBookreader = false;
    this.disableDownload = APP_CONFIG.disableFileDownloads;
  }

  _onAppStateUpdate(e) {
    if( e.location.page !== 'item' ) this._reset();
  }

  _onSelectedRecordUpdate(record) {
    if( !record ) return;

    let { graph, clientMedia, selectedMedia, selectedMediaPage } = record;    

    this.firstLoad = graph.root?.id !== this.rootRecord?.id ? true : false;

    this.rootRecord = graph.root;
    this.selectedMedia = selectedMedia;
    this.clientMedia = clientMedia;
    this.graphIndex = graph.index;
    this.selectedMediaPage = selectedMediaPage;

    this.sources = this._getDownloadSources();

    // set single/zip download hrefs
    this._setDownloadHref(this.sources);

    this.hasMultipleDownloadMedia = this.sources.length > 1;
    if( this.firstLoad && this.hasMultipleDownloadMedia ) {
      this.shadowRoot.querySelector("#single").checked = true;
      this.shadowRoot.querySelector("#fullset").checked = false;
      this.fullSetSelected = false;
    }

    if( this.sources.length === 0 ) {
      this.selectedMediaHasSources = false;
      return;
    }

    this.selectedMediaHasSources = true;
    this.fullSetCount = this.sources.length;

    this._onSelectedRecordMediaUpdate(selectedMedia)
  }

  _onSelectedRecordMediaUpdate(media) {
    this.selectedRecordMedia = media;
    this.downloadOptions = [this.selectedRecordMedia];
    this.isMultimedia = this.downloadOptions[0]?.fileFormat?.includes('video');
    let pdf;

    if( this.isMultimedia ) {
      this.fullSetSelected = false;
      let download = this.downloadOptions[0];
      this.shadowRoot.querySelector("#multimedia-format-label").innerHTML = download.fileFormatSimple + ' (' + bytes(download.fileSize).toLowerCase() + ')';
      this.showImageFormats = false;

      // update all label to include video + other media (prob just thumbnail)
      // multimedia-all-format-label
      let filesize = this.sources.reduce((a, r) => a + r.fileSize, 0);
      // let fileTypes = this.sources.map(s => s.url?.split('.')?.pop()).join(', ');
      let label = 'video (' + bytes(filesize).toLowerCase() + ')';
      this.shadowRoot.querySelector("#multimedia-all-format-label").innerHTML = label;

    } else {
      // check if the only main source with pages is pdf,
      // if so then just show archive download options instead of single page
      let imageList = this.clientMedia.mediaGroups.filter(m => m['@shortType'].includes('ImageList'))[0];
      pdf = this.clientMedia.mediaGroups.filter(m => m.clientMedia?.pdf && 
                                                         m.clientMedia?.pages?.length && 
                                                         m.clientMedia?.download?.[0]?.label === 'pdf')[0];

      if( !imageList && pdf ) {
        this.showDownloadLabel = true;
        // this._noSinglePageDownload();
        this._renderDownloadAllFormats();
        this._renderDownloadSingleFormat();
        return;
      }
    }

    this._renderDownloadAllFormats();
    this._renderDownloadSingleFormat();

    if( pdf && !this.isMultimedia && this.firstLoad ) {
      this._toggleMultipleDownload(null, true);
    }
  }

  /**
   * @method _onBookreaderStateUpdate
   * @description bookreader state update event handler
   * 
   * @param {Object} e bookreader state update event
   */
  _onBookreaderStateUpdate(e) {
    if( this.AppStateModel.location.page !== 'item' ) return;

    this.isBookreader = true;
    let pageNumber = e.selectedPage + 1;
    let onePageMode = e.selectedView === 'single';
    let pages;
    let imageList = this.clientMedia.mediaGroups.filter(m => m['@shortType'].includes('ImageList'))[0];

    if( imageList ) {
      pages = imageList.clientMedia?.pages || [];
    } else {
      pages = this.selectedMedia?.clientMedia?.pages || [];
    }

    if( !pages || !pages.length ) return;

    if( onePageMode || pageNumber === 1 ) {
      // single image download
      let href = pages[pageNumber - 1]?.download?.url;  
      this.isTwoPageView = false;
      this.href = href || '';
      this._renderDownloadSingleFormat();
  
    } else {
      // 2 page image download
      this.isTwoPageView = true;      

      // if switching from single to two page view on odd page, selected page is the second page in the displayed bookreader view
      let startIndex = pageNumber % 2 !== 0 ? pageNumber - 2 : pageNumber - 1;

      // set download href to 2 pages for archive download option
      let image1 = pages[startIndex]?.download?.url?.replace('/fcrepo/rest', '');
      let image2 = pages[startIndex + 1]?.download?.url?.replace('/fcrepo/rest', '');
      let urls = [];
      if( image1 ) urls.push(image1);
      if( image2 ) urls.push(image2);
      if( urls.length && !this.fullSetSelected ) {
        this._setZipPaths(urls);
      }
      this._renderDownloadSingleFormat(true);      
    }
  }

  _noSinglePageDownload() {
    this.zipName = this.rootRecord.name
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    this.archiveHref = '/fin/archive?paths=' + this.sources.map(s => s.url.replace('/fcrepo/rest', '')).join(',') + (this.zipName ? '&name='+this.zipName : '');

    this.downloadAllMedia = true;
    let formats = [];
    this.sources.forEach((source) => {
      let format = source.url.split('.').pop();
      if( !formats.includes(format) ) {
        formats.push(format);
      }
    });

    this.shadowRoot.querySelector("#media-format-label").innerHTML = 'image' + ' (' + formats.join(', ') + ')';
  }

  /**
   * @method _getDownloadSources
   * @description get all client media download sources
   *
   * @returns {Array} sources 
   */
  _getDownloadSources() {
    let sources = [];
    this.clientMedia.mediaGroups.forEach((media) => {
      if( media.clientMedia?.download ) {
        media.clientMedia.download.forEach((download) => {
          sources.push(download);
        });
      }
    });
    return sources;
  }

  /**
   * @method _setDownloadHref
   * @description set the download sourceType and href for single and fullset download options
   * @param {Array} sources the download source(s)
   */
  _setDownloadHref(sources=[]) {
    if (!sources.length) return;
    
    this.href = '';
    this.archiveHref = '';

    if( this.disableDownload ) return;

    let imageList = this.clientMedia.mediaGroups.filter(m => m['@shortType'].includes('ImageList'))[0];
    let firstMediaDownload = this.clientMedia.mediaGroups[0]?.clientMedia?.download?.[0]?.url;

    if( this.fullSetSelected || this.isTwoPageView ) {
      // build zip download url
      this.zipName = this.rootRecord.name
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();
      this.archiveHref = '/fin/archive?paths=' + sources.map(s => s.url.replace('/fcrepo/rest', '')).join(',') + (this.zipName ? '&name='+this.zipName : '');
    } else if( this.AppStateModel.location.fullpath === this.rootRecord['@id'] ) {
      // first image from imageList if exists, or mediaObject first download
      this.href = imageList?.clientMedia?.download?.[0]?.url || firstMediaDownload;
    } else {
      // get image from selected page
      let page = this.selectedMediaPage || 0;

      // pull page from pdf if no imagelist
      let url = '';
      let imageUrl = this.AppStateModel.location.fullpath.replace(/:\d+$/, ''); // scrub :pageNumber suffix
      if( !imageList ) {
        let media = this.clientMedia.mediaGroups?.find(mg => mg['@id'] === imageUrl)?.clientMedia;
        if( media?.pages ) {
          url = media.pages[page-1]?.original?.url || media.pages[page-1]?.large?.url;
        }
      }

      this.href = imageList?.clientMedia?.download?.[page]?.url || url || firstMediaDownload;
    }
  }

  /**
   * @method _renderDownloadSingleFormat
   * @private
   * @description render image formats for single page images, ie "Image (png)"
   * 
   * @param {Boolean} multipage if true, then render for 2 pages (combine file sizes)
   */
  _renderDownloadSingleFormat(multipage=false) {
    let formats = [];
    let singlePdf = false;
    let multiImageSize = 0;
    this.sources.forEach((source) => {
      let format = source.label || source.url.split('.').pop();
      // if( formats.includes(format) ) {
      // } else 
      if( !formats.includes(format) && format !== 'pdf') {
        formats.push(format);
      }
      if( format === 'pdf' ) {
        singlePdf = true;
      }
      if( multipage ) {
        if( this.archiveHref.indexOf(source.url?.split('/fcrepo/rest')?.[1]) > -1 ) multiImageSize += source.fileSize;
      }
    });
  
    if( singlePdf && formats.length > 0 ) singlePdf = false; 

    let imageLabel = singlePdf ? 'pdf ' : '';

    let viewingPdf = this.AppStateModel.location.fullpath.replace(/:\d+$/, '')?.split('.')?.pop() === 'pdf';
    if( viewingPdf ) {
      singlePdf = true;
      imageLabel = this.href.split('.').pop(); // get format from url, could be workflow image or pdf
    }

    let fileSize = this.sources.find(s => s.url === this.href)?.fileSize;
    if( formats.length && !viewingPdf ) imageLabel += formats.join(', ') + ' ';

    // if multipage, combine file sizes
    if( multipage && multiImageSize ) {
      imageLabel += '(' + bytes(multiImageSize).toLowerCase() + ')';
    } else if( fileSize ) {
      imageLabel += '(' + bytes(fileSize).toLowerCase() + ')';
    }

    if( !this.fullSetSelected ) this.showDownloadLabel = true;
    this.shadowRoot.querySelector("#media-format-label").innerHTML = imageLabel;
  }

  /**
   * @method _renderDownloadAllFormats
   * @private
   * @description render image formats if download media exists for images and pdf
   * also render All Files image format if only images exist for download media (ie not image + pdf)
   */
  _renderDownloadAllFormats() {
    let formats = [];
    let hasPdf = false;
    this.sources.forEach((source) => {
      let format = source.label || source.url.split('.').pop();
      if( format === 'pdf' ) hasPdf = true;
      let matchedFileType = formats.filter(f => f.format === format)[0];

      if( matchedFileType ) {
        // update fileSize
        matchedFileType.fileSize += source.fileSize;
      } else {
        formats.push({
          format,
          fileSize : source.fileSize
        });
      }
    });

    if( hasPdf && formats.length > 1 ) {
      // show dropdown to select pdf vs image
      this.showImageFormats = true;
      this.shadowRoot.querySelector("#format").innerHTML = '';
      
      formats.forEach((format) => {
        let option = document.createElement("option");
        let imageLabel = format.format;
        if( format.fileSize && !isNaN(format.fileSize) ) imageLabel += ' (' + bytes(format.fileSize).toLowerCase() + ')';
        option.value = format.format;
        option.innerHTML = imageLabel
        this.shadowRoot.querySelector("#format").appendChild(option);
      });
      this.showDownloadLabel = false;
    } else {
      this.showDownloadLabel = true;
    
      let imageLabel = '';
      if( formats.length ) imageLabel += formats.map(f => f.format).join(', ') + ' ';
      imageLabel += '(' + (bytes(formats.reduce(((a, r) => a + r.fileSize), 0))||'').toLowerCase() + ')';
      
      this.shadowRoot.querySelector("#media-format-label").innerHTML = imageLabel;
      this.shadowRoot.querySelector("#media-all-format-label").innerHTML = imageLabel;      
    }
  }

  /**
   * @method _getImageFormat
   * @description get the image format. Looks at the schema.org fileFormat parameter or falls back to the url
   *
   * @returns {String}
   */
  _getImageFormat(imageRecord) {
    if (!imageRecord || !imageRecord.url) return;

    // get the graph record for the image
    imageRecord = this.graphIndex[imageRecord.url.split('/fcrepo/rest')[1]]; 

    if( !imageRecord ) return;
    
    let originalFormat = (
      imageRecord.fileFormat ||
      imageRecord["@id"]?.split(".").pop() ||
      imageRecord?.split('.').pop() ||
      ""
    )
      .replace(/.*\//, "")
      .toLowerCase();
    // hack
    if (originalFormat === "jpeg") originalFormat = "jpg";
    return originalFormat;
  }

  /**
   * @method _onFormatSelected
   * @private
   * @description when a format is selected, render the download button.
   */
  _onFormatSelected() {
    let selectedFormat = this.shadowRoot.querySelector("#format").value;
    let sources = this.sources.filter(s => s.label === selectedFormat || s.url?.split('.').pop() === selectedFormat);
    this._setZipPaths(sources.map(s => s.url.replace('/fcrepo/rest', '')));
  }

  /**
   * @method _toggleMultipleDownload
   * @description bound to radio buttons click event
   *
   * @param {Event} evt the click event
   * @param {Boolean} preselectPdf if true, then preselect the pdf format if it exists
   */
  _toggleMultipleDownload(evt, preselectPdf=false) {
    if( preselectPdf && this.firstLoad) {
      let pdfOption = Array.from(this.shadowRoot.querySelector("#format").options).filter(o => o.value === 'pdf')[0];
      if( pdfOption ) pdfOption.selected = true;

      this.shadowRoot.querySelector("#fullset").checked = true;
      this.shadowRoot.querySelector("#single").checked = false;
    }

    this.fullSetSelected = this.shadowRoot.querySelector("#fullset").checked
        ? true
        : false;
    
    let selectedFormat = this.shadowRoot.querySelector("#format").value;
    let sources = this.sources.filter(s => s.label === selectedFormat || !selectedFormat);
    let urls = [];

    if( this.fullSetSelected ) {
      this.showDownloadLabel = false;
    } else {
      this.showDownloadLabel = true;
    }
    
    this._setDownloadHref(this.sources);
    this._renderDownloadSingleFormat();

    if( this.isBookreader && !this.fullSetSelected ) {
      this._onBookreaderStateUpdate(this.BookReaderModel.getState());
    } else {
      urls = sources.map(s => s.url.replace('/fcrepo/rest', ''));
    }
    
    this._setZipPaths(urls);
  }

  /**
   * @method _setZipPaths
   * @description set the zip url based on mutlipage bookreader selected page
   */
  _setZipPaths(urls=[]) {
    this.zipName = this.rootRecord.name
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

    if( !urls.length ) return;

    if( urls.length === 1 ) {
      this.archiveHref = '/fcrepo/rest'+urls[0];
      return;
    }

    this.zipConcatenatedPaths = urls.join(',');
    this.zipPaths = urls;

    // this.shadowRoot.querySelector("#format") to get current format, match to url label?
    this.archiveHref = `/fin/archive?paths=${this.zipConcatenatedPaths}${this.zipName ? '&name='+this.zipName : ''}`;
  }

  /**
   * @method _onDownloadFullSetClicked
   * @description bound to download set button click event
   */
  async _onDownloadFullSetClicked(e) {
    if( this.disableDownload ) {
      e.preventDefault();
      return;
    }

    let path = this.rootRecord["@id"].replace(config.fcrepoBasePath, "");
    gtag("event", "download", {
      event_category: "fullset",
      event_label: path,
      value: 1,
    });
  }

  /**
   * @method _onDownloadClicked
   * @description bound to download button click event, record analytics
   */
  _onDownloadClicked(e) {
    if( this.disableDownload ) {
      e.preventDefault();
      return;
    }
    let path = this.href.replace(config.fcrepoBasePath, "");

    gtag("event", "download", {
      event_category: this.sourceType,
      event_label: path,
      value: 1,
    });
  }
}

customElements.define("app-media-download", AppMediaDownload);
