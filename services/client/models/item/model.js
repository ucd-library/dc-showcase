const EsDataModel = require('../../lib/es-model.js');
const schema = require('./schema.json');

class ItemsModel extends EsDataModel {

  constructor() {
    super('item');
    this.schema = schema;
  }

  search(searchDocument, options, index) {
    if( !searchDocument.sort ) {
      searchDocument.sort = [
        '_score',
        { 'name.raw' : 'asc' }
      ]
    }
    return super.search(searchDocument, options, index);
  }

  async getByArk(ark) {
    let searchDocument = {
      "filters":{
        "@graph.identifier.raw":{
            type:"keyword",
            op:"and",
            value:[ark]
        }
      },
      limit: 1
    }
    let resp = await this.search(searchDocument);
    return resp;
  }

  async getFiles(id, files=[]) {
    let searchDocument = {
      "filters":{
        "directParent":{
            type:"keyword",
            value:[id],
            "op":"or"
        }
      }
    }
    let resp = await this.search(searchDocument, {allRecords: true, noLimit: true});

    let types;
    for( let result of resp.results ) {
      types = result['@type'] || [];
      if( types.includes('http://fedora.info/definitions/v4/repository#Resource') ) {
        files.push({
          filename: result.filename,
          path: result['@id'],
          fileFormat : result.fileFormat,
          fileSize : result.fileSize
        });
      } else if( types.includes('http://www.w3.org/ns/ldp#BasicContainer') ) {
        await this.getFiles(result['@id'], files);
      }
    }

    return files;
  }

  getDefaultIndexConfig(schema) {
    let config = super.getDefaultIndexConfig(schema);
    config.body.settings.analysis.char_filter = {
      "remove_special_chars": {
        "type": "pattern_replace",
        "pattern": "[^\\w\\s]",
        "replacement": ""
      }
    };
    config.body.settings.analysis.normalizer = {
      "lowercase_remove_punctuation_normalizer": {
        "type": "custom",
        "char_filter": ["remove_special_chars"],
        "filter": ["lowercase"]
      }
    };

    return config;
  }

}

module.exports = new ItemsModel();
