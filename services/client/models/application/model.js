const EsDataModel = require('../../lib/es-model.js');
const schema = require('./schema.json');

class ApplicationsModel extends EsDataModel {

  constructor() {
    super('application');
    this.schema = schema;
  }

}

module.exports = new ApplicationsModel();
