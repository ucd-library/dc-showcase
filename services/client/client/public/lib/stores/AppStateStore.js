const {AppStateStore} = require('@ucd-lib/cork-app-state');

class ImplAppStateStore extends AppStateStore {

  constructor() {
    super();

    this.data.selectedRecord = null;
    this.data.selectedRecordMedia = null;
    this.data.selectedCollection = null;

    this.events.SELECTED_RECORD_UPDATE = 'selected-record-update';
    this.events.SELECTED_COLLECTION_UPDATE = 'selected-collection-update';
  }

  set(state) {
    super.set(state);
  }

  setSelectedRecord(record) {
    this.set({selectedRecord: record});
    this.emit(this.events.SELECTED_RECORD_UPDATE, record);
  }

  getSelectedRecord() {
    return this.data.selectedRecord;
  }


  setSelectedCollection(collection) {
    if( this.data.selectedCollection === collection ) return;
    this.set({selectedCollection: collection});
    this.emit(this.events.SELECTED_COLLECTION_UPDATE, collection);
  }

  getSelectedCollection() {
    return this.data.selectedCollection;
  }

}

module.exports = new ImplAppStateStore();