import {BaseService} from '@ucd-lib/cork-app-utils';
import CollectionImportStore from '../stores/CollectionImportStore.js';
import payload from '../utils/payload.js';

class CollectionImportService extends BaseService {

  constructor() {
    super();
    this.store = CollectionImportStore;
    this.basePath = '/api/collection-import';
  }

  async list() {
    let ido = {action: 'list'};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.list,
      () => this.request({
        url : this.basePath,
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp), 
          this.store.data.list
        )
      })
    );

    return this.store.data.list.get(id);
  }

  async get(collection) {
    let ido = {action: 'get', collection};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.metadata,
      () => this.request({
        url : this.basePath+'/'+collection,
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp), 
          this.store.data.metadata
        )
      })
    );

    return this.store.data.metadata.get(id);
  }

  async start(collection, opts={}) {
    let ido = {action: 'start-import', collection};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.actions,
      () => this.request({
        url : this.basePath+'/'+collection,
        qs : opts,
        fetchOptions : {
          method : 'POST',
        },
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp), 
          this.store.data.actions
        )
      })
    );

    return this.store.data.actions.get(id);
  }

  async delete(collection) {
    let ido = {action: 'delete-import', collection};
    let id = payload.getKey(ido);

    await this.checkRequesting(
      id, this.store.data.actions,
      () => this.request({
        url : this.basePath+'/'+collection,
        fetchOptions : {
          method : 'DELETE',
        },
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp), 
          this.store.data.actions
        )
      })
    );

    return this.store.data.actions.get(id);
  }

}

const service = new CollectionImportService();
export default service;
