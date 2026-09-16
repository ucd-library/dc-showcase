class CollectionVcModel {

  /**
   * @method renderCollection
   * @description transform data for ui
   *
   * @param {Object} e
   */
  renderCollection(e) {
    // translate collection and related nodes/items to ui model
    const rootNode = e.payload.root;

    let callNumber = "";
    if (rootNode.identifier) {
      if (!Array.isArray(rootNode.identifier)) {
        rootNode.identifier = [rootNode.identifier];
      }

      for (const id of rootNode.identifier) {
        // match D-192, MC-342, etc.
        let match = id.match(/[a-zA-Z]{1,2}-\d{3}/);
        if( match ) {
          callNumber = match[0];
          break;
        }

        // match LoC call numbers, ie  'BX2080.A2.1497', 'LD781.D5j 2004 J644', etc..
        // 1+ letters/numbers followed by a period, followed by 1+ letters/numbers/spaces/periods
        match = id.match(/^([A-Za-z0-9]+)\.([A-Za-z0-9 .]+)$/);
        if( match ) {
          callNumber = match[0];
          break;
        }
      }
    }

    let images;
    if( e.payload?.clientMedia?.mediaGroups ) {
      let groups = e.payload.clientMedia.mediaGroups;
      let group = groups.find(g => g.clientMedia?.images);
      if( group ) {
        images = group?.clientMedia?.images;
      }
    }

    if( rootNode.subjects && !Array.isArray(rootNode.subjects) ) rootNode.subjects = [rootNode.subjects];

    let clientEdits = {};
    try {
      clientEdits = e.payload.data['@graph'].find(g => g['@shortType'] === 'ClientEdit' || g['@shortType'].includes('ClientEdit'));
    } catch(e) {}

    let publishedDateRange = '';
    if( rootNode.publishedDateRange?.minYear && rootNode.publishedDateRange?.maxYear ) {
      publishedDateRange = `${rootNode.publishedDateRange.minYear} - ${rootNode.publishedDateRange.maxYear}`;
    }

    const vcData = {
      id: rootNode["@id"],
      description: rootNode.description,
      title: rootNode.name,
      images,
      subjects: rootNode.subjects || [],
      callNumber,
      count: rootNode.itemCount,
      yearPublished: rootNode.yearPublished,
      publishedDateRange,
      clientEdits
    };

    e.vcData = vcData;
  }

    /**
   * @method renderCollections
   * @description transform data for ui from search results
   *
   * @param {Object} e
   */
    renderCollections(e) {
      // translate collection and related nodes/items to ui model
      let results = (e.payload.results || []);
      results.forEach(result => {
        let rootNode = result.root;

        let callNumber = "";
        if (rootNode.identifier) {
          if (!Array.isArray(rootNode.identifier)) {
            rootNode.identifier = [rootNode.identifier];
          }
    
          rootNode.identifier.forEach((id) => {
            let match = id.match(/[a-zA-Z]{1,2}-\d{3}/g);
            if (match) callNumber = match[0];
          });
        }
    
        let images;
        if( result.clientMedia?.mediaGroups ) {
          let groups = result.clientMedia.mediaGroups;
          let group = groups.find(g => g.clientMedia?.images);
          if( group ) {
            images = group?.clientMedia?.images;
          }
        }
    
        const vcData = {
          id: rootNode["@id"],
          description: rootNode.description,
          title: rootNode.name,
          images,
          subjects: rootNode.subjects || [],
          callNumber,
          count: rootNode.itemCount,
          yearPublished: rootNode.yearPublished,
        };
    
        result.vcData = vcData;
      });
    }
}

module.exports = new CollectionVcModel();
