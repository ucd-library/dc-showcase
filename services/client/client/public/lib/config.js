let rights = require('./rights');
let config = APP_CONFIG;

let rightsMap = {};
for( var key in rights ) {
  rightsMap[key] =  rights[key].text;
}

config.fcrepoBasePath = '/fcrepo/rest';

// facets to show on left side
config.elasticSearch = {
  facets : {
    '@graph.isPartOf.@id' : {
      label : 'Collection',
      type : 'facet',
      valueMap : (value) => {
        if( APP_CONFIG.collectionLabels[value] ) {
          return 'Collection: ' + APP_CONFIG.collectionLabels[value];
        }
        return 'Collection: ' + value;
      }
    },
    '@graph.fileFormatSimple' : {
      label : 'File Format',
      type : 'facet'
    },
    '@graph.creator.name' : {
      label : 'Creator',
      type : 'facet',
      valueMap : (value) => {
        return 'Creator: '+value;
      }
    },
    '@graph.subjects.name' : {
      label : 'Subject',
      type : 'facet',
      typeahead : 'abouts',
      valueMap : (value) => {
        return 'Subject: '+value;
      }
    },
    '@graph.yearPublished' : {
      label : 'Date',
      type : 'range'
    }
  },

  // latest text fields used for search are loaded from /services/fin/ucd-lib-client/config.js
  // when we're releasing new versions requiring schema reindexing, we can update those to the latest,
  // and update the overlay .env vars with the current working set of fields, until reindexing is done
  textFields : {
    record : APP_CONFIG.itemTextFields.split(',').map(f => f.trim()),
    collection : APP_CONFIG.collectionTextFields.split(',').map(f => f.trim())
  },
  
  // max number of facets filter options
  maxFacetCount : 50
}

module.exports = config;