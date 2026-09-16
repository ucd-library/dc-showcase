const config = require("../config");
const utils = require("../../lib/utils");

class RecordVcModel {
  
  /**
   * @method renderRecord
   * @description transform data for ui
   *
   * @param {Object} e
   */
  renderRecord(e) {
    let {root, clientMedia, data} = e.payload;

    if (root && clientMedia) {
      let callNumber = "";

      if (root && root.identifier) {
        if (!Array.isArray(root.identifier)) root.identifier = [root.identifier];

        for (const id of root.identifier) {
          // match D-192, MC-342, etc.
          let match = id.match(/[a-zA-Z]{1,2}-\d{3}/);
          if( match ) {
            callNumber = id;
            break;
          }

          // match LoC call numbers, ie  'BX2080.A2.1497', 'LD781.D5j 2004 J644', etc..
          // 1+ letters/numbers followed by a period, followed by 1+ letters/numbers/spaces/periods
          match = id.match(/^([A-Za-z0-9]+)\.([A-Za-z0-9 .]+)$/);
          if( match ) {
            callNumber = id;
            break;
          }
        }
      }

      let collectionId = '';
      if (root.isPartOf) {
        if (!Array.isArray(root.isPartOf)) {
          root.isPartOf = [root.isPartOf];
        }

        collectionId = root.isPartOf.filter(p => p['@id']?.includes('/collection/ark'))[0]?.['@id'];
        if( !collectionId ) {
          for( let part of root.isPartOf ) {
            if( part['@id'].startsWith('/collection/') ) {
              collectionId = part['@id'];
              break;
            }
          }
        }
      }

      let subjects = root.subjects || [];
      if( !Array.isArray(subjects) ) subjects = [subjects];

      let images;
      if( e.payload?.clientMedia?.mediaGroups ) {
        let groups = e.payload.clientMedia.mediaGroups;
        let group = groups.find(g => g['@type'].includes('ImageObject') || (g.filename || '').match(/\.(png|jpg)$/));

        let graph = e.payload.clientMedia.graph || [];
        if( !Array.isArray(graph) ) graph = [graph];
        let graphImage = graph.find(g => g['@type'].includes('ImageObject') || (g.filename || '').match(/\.(png|jpg)$/));

        let imagesWithoutErrors = groups.filter(g => g.clientMedia?.images && !g.clientMedia.images.error);

        if( group ) {
          images = group.clientMedia?.images;
        } else if( graphImage && graphImage.clientMedia?.images ) {
          images = graphImage.clientMedia?.images;
        } else if ( imagesWithoutErrors.length ) {
          images = imagesWithoutErrors[0].clientMedia.images;
        }
      }

      let mediaType = '';
      let mediaGroups = e.payload.clientMedia?.mediaGroups || [];
      let imageList = mediaGroups.filter(m => utils.getMediaType(m) === 'ImageList')[0];
      if( imageList && imageList.hasPart && imageList.hasPart.length ) {
        mediaType = 'ImageList';
      } else if( imageList && typeof imageList.hasPart === 'object' && Object.keys(imageList.hasPart).length < 2 ) {
        mediaType = 'Image';
      }

      if( !mediaType ) {
        for (const mediaGroup of mediaGroups) {
          mediaType = utils.getMediaType(mediaGroup);
          if( mediaType ) break;
        }
      }

      if (mediaType) mediaType = mediaType.replace("Object", "");

      // translate collection and related nodes/items to ui model
      const vcData = {
        "@id": root["@id"],
        name: root.name,
        collectionId,
        collectionName: config.collectionLabels[collectionId] || '',
        clientMedia: clientMedia,
        images,
        date: root.datePublished || root.yearPublished || 'Undated',
        description: root.description || '',
        publisher: root?.publisher?.name,
        subjects,
        callNumber,
        arkDoi: ["?"],
        fedoraLinks: ["?"],
        citationText: "?",
        material: root.material || '',
        creator: root.creator?.name || '',
        // building these in the ui for now since the links change as different media is selected
        // arkDoi,
        // fedoraLinks,
        root,
        mediaType
      };

      e.vcData = vcData;
    }
  }
}

module.exports = new RecordVcModel();
