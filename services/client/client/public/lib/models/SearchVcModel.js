const { BaseModel } = require("@ucd-lib/cork-app-utils");
const SearchVcStore = require("../stores/SearchVcStore");
const utils = require("../../lib/utils");
class SearchVcModel extends BaseModel {
  constructor() {
    super();

    this.store = SearchVcStore;
    this.EventBus.on("record-search-update", (e) => {
      this._onRecordSearchUpdate(e)
    });
    this.register("SearchVcModel");
  }

  getSearch(name = "default") {
    return this.store.getSearch(name);
  }

  /**
   * @method _onRecordSearchUpdate
   * @description listen for record search update events, transform data for ui and emit event to update
   *
   * @param {Object} e
   */
  async _onRecordSearchUpdate(e) {
    if (e.state !== "loaded") return;

    // translate RecordGraph's to ui model
    const matchedItems = [];
    let matchedCollections = [];

    e.payload.results.forEach((result) => {
      if( !result.root ) return;
      let thumbnailUrl = utils.getThumbnailFromClientMedia(
        result.clientMedia
      );

      // TODO could belong to multiple collections.. which should be listed? or collectionIds as array type?
      // also this index0 sometimes is oac and not /collection/*
      let collectionId;
      if (Array.isArray(result.root.isPartOf)) {
        collectionId = result.root.isPartOf.filter(
          (c) => c["@id"].indexOf("/collection") > -1
        )[0];
      } else if (result.root.isPartOf) {
        collectionId = { "@id": result.root.isPartOf["@id"] };
      }

      if (
        collectionId &&
        !matchedCollections.find((c) => c["@id"] === collectionId["@id"])
      ) {
        matchedCollections.push({
          "@id": collectionId["@id"],
          title: result.root.publisher ? result.root.publisher.name : "",
          name: result.root.publisher ? result.root.publisher.name : "",
          thumbnailUrl,
          recordCount: result.root.itemCount,
        });
      }

      // check if imageList
      let mediaGroups = result?.clientMedia?.mediaGroups || [];

      let videoMedia = mediaGroups.find(m => m.fileFormatSimple === 'video');
      let audioMedia = mediaGroups.find(m => m.fileFormatSimple === 'audio');
      let imageListMedia = mediaGroups.find(m => m['@shortType'].includes('ImageList'));
      let pdfMedia = mediaGroups.find(m => m.fileFormatSimple === 'pdf');
      let imageMedia = mediaGroups.find(m => m['@shortType'].includes('ImageObject'));

      let pageCount = '';
      let mediaTypes = [];
      let multiImage = false;

      if( videoMedia ) mediaTypes.push('Video');
      if( audioMedia ) mediaTypes.push('Audio');
      if( imageListMedia || pdfMedia || imageMedia ) {
        if( imageListMedia && imageListMedia.hasPart && imageListMedia.hasPart.length ) {
          multiImage = true;
          pageCount = ' (' + utils.formatNumberWithCommas(imageListMedia.hasPart.length) + ' page' + (imageListMedia.hasPart.length > 1 ? 's' : '') + ')';
        } 
        else if( (imageListMedia && imageListMedia.hasPart) || pdfMedia) {
          multiImage = true;
        }
        mediaTypes.push('Image' + pageCount);
      }

      let size = mediaGroups.find(g => g.clientMedia?.images?.original?.size);
      if( size ) {
        size = size.clientMedia.images.original.size;
      } else { 
        size = {};
      }
      if( Array.isArray(size) ) size = size[0];

      matchedItems.push({
        id: result.root["@id"],
        collectionId,
        title: result.root.name,
        thumbnailUrl,
        mediaTypes,
        multiImage,
        collection: result.root.publisher ? result.root.publisher.name : "", // for detail display
        creator: result.root.creator ? result.root.creator.name : "", // for detail display
        date: result.root.yearPublished || 'Undated', // for detail display
        format: mediaTypes.length ? mediaTypes.join(', ') : null, // for detail display,
        size
      });
    });

    // if( e.searchDocument.text === '' ) matchedCollections = [];
    e.payload.results = matchedItems;
    e.payload.matchedCollections = matchedCollections;
    // todo save translated data to store
    // todo this really will emit from this.store.setRecordSearchState() or similar
 
    this.store.setSearchLoaded(e.name, e.searchDocument, e.payload);
  }
}

module.exports = new SearchVcModel();
