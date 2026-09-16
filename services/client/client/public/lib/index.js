let {Registry} = require('@ucd-lib/cork-app-utils');

const models =  {
  AuthModel : require('./models/AuthModel'),
  AppStateModel : require('./models/AppStateModel'),
  RecordModel : require('./models/RecordModel'),
  SearchVcModel : require('./models/SearchVcModel'),
  CollectionModel : require('./models/CollectionModel'),
  MediaModel : require('./models/MediaModel.mjs'),
  CitationModel : require('./models/CitationsModel'),
  SeoModel : require('./models/SeoModel'),
  FiltersModel : require('./models/FiltersModel'),
  FcAppConfigModel : require('./models/FcAppConfigModel'),
  BrowseByModel : require('./models/BrowseByModel'),
  BookReaderModel : require('./models/BookReaderModel'),
  WorkflowModel: require('./models/WorkflowModel')
};

if( typeof window !== 'undefined' ) {
  window.damsClientModels = models;
  window.recordData = models.RecordModel.store.data.byId
}

Registry.ready();

module.exports = models;