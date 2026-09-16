import { LitElement, html } from 'lit';
import {render, styles} from "./dams-collection-import.tpl.js";
import {Mixin, MainDomElement} from '@ucd-lib/theme-elements/utils/mixins';
import {LitCorkUtils} from '@ucd-lib/cork-app-utils';

import '../../lib/models/CollectionImportModel.js';

export default class DamsCollectionImport extends Mixin(LitElement)
  .with(MainDomElement, LitCorkUtils) {

  static get properties() {
    return {
      collectionList : {type: Array},
    }
  }

  // static get styles() {
  //   return styles();
  // }


  constructor() {
    super();

    this.collectionList = [];

    this.render = render.bind(this);
    this._injectModel('AppStateModel', 'DataViewModel', 'CollectionImportModel');

    this.AppStateModel.get().then(e => this._onAppStateUpdate(e));
    this.DataViewModel.coreData().then(e => this._onCoreDataUpdate(e));

    setInterval(() => {
      this.refresh();
    }, 5000);
  }

  _onCoreDataUpdate(e) {
    if( e.state !== 'loaded' ) return;
    this.config = e.payload.config;
    this.requestUpdate();
  }

  async _onAppStateUpdate(e) {
    if( e.page !== this.id ) return;

    await this.loadCollectionList();
  }

  updated() {
    for( let item of this.collectionList ) {
      if( item.state === 'running' || item.state === 'finished' ) {
        this._updateScroll(item.id);
      }
    }
  }

  async loadCollectionList() {
    this.logger.info('Loading collection list'); 
    let resp = await this.CollectionImportModel.list();

    if( resp.error ) {
      return;
    }
    resp = resp.payload;

    let list = [];

    resp.available.forEach(item => {
      if( resp.volumes.includes(item) ) {
        list.push({
          id : item,
          status : 'available (volume exists)',
          state : 'not-running',
          volume : true
        });
      } else {
        list.push({
          id : item,
          status : 'available',
          state : 'not-running'
        });
      } 
    });

    resp.applied.forEach(item => {
      this._wrapCollectionItem(item);
      list.push(item);
    });

    list.sort((a, b) => {
      if( a.id.toLowerCase() < b.id.toLowerCase() ) return -1;
      if( a.id.toLowerCase() > b.id.toLowerCase() ) return 1;
      return 0;
    });

    this.collectionList = list;
  }

  _wrapCollectionItem(item) {
    item.id = item.metadata.name.replace('import-', '');
    // item.statusDetails = [];

    // for( let key in item.status ) {
    //   if( typeof item.status[key] === 'object' ) {
    //     continue;
    //   } 
    //   item.statusDetails.push(key+'='+item.status[key]);
    // }
    // item.statusDetails = item.statusDetails.join(', ');

    if( item.status.active > 0 || item.status.ready > 0 ) {
      item.state = 'running';
    } else {
      item.state = 'finished';
    }
  }

  _renderStatus(item) {
    if( typeof item.status === 'string' ) {
      return item.status;
    }

    let timestamps = [];
    if( item.status.startTime ) {
      timestamps.push({key: 'startTime', ts: new Date(item.status.startTime)});
    }
    if( item.status.completionTime ) {
      timestamps.push({key: 'completionTime', ts: new Date(item.status.completionTime)});
    }

    let statusFlags = [];
    for( let key in item.status ) {
      if( item.status[key] !== 1 ) {
        continue;
      }
      statusFlags.push(key);
    }

    return html`
      <div style="display: flex">
        <div style="flex: 1">
          <div><b>Job Status</b></div>
          <div>${statusFlags.join(', ')}</div>
        </div>
        <div style="flex: 1">
          <div><b>Timestamps</b></div>
          ${timestamps.map(item => html`<div>${item.key}: ${item.ts.toLocaleString()}</div>`)}
      </div>
    `;
  }

  getJob(id) {
    return this.collectionList.find(item => item.id === id);
  }

  async _onCollectionImportClicked(id) {
    let job = this.getJob(id);
    let ignoreBinarySync = false;
    let privateImport = false;

    if( job.state == 'finished' || job.volume ) {
      ignoreBinarySync = this.querySelector(`input#ibs-input-${id}`).checked;
    }

    privateImport = this.querySelector(`input#private-input-${id}`).checked;

    if( !confirm(`Are you sure you want to run the import for ${id} with IGNORE_BINARY_SYNC=${ignoreBinarySync} and PRIVATE=${privateImport}?`) ) {
      return;
    }

    let agent = privateImport ? 'protected' : null;

    this.logger.info('Running collection import', id, {ignoreBinarySync, agent});
    let resp = await this.CollectionImportModel.start(id, {ignoreBinarySync, agent});
    this.logger.info('Collection import started', resp);
    this.loadCollectionList();
  }

  async _onForceStopClicked(id) {
    if( !confirm(`Are you sure you want to stop the import for ${id}`) ) {
      return;
    }

    this.logger.info('Force stopping collection import', id);
    let resp = await this.CollectionImportModel.delete(id);
    this.logger.info('Collection import stopped', resp);
    this.loadCollectionList();
  }

  async _onRerunImportClicked(collection) {
    let ignoreBinarySync = this.querySelector(`input#ibs-input-${collection.id}`).checked;
    let privateImport = this.querySelector(`input#private-input-${collection.id}`).checked;
    let id = collection.id;
    
    if( !confirm(`Are you sure you want to run the re-import for ${id} with IGNORE_BINARY_SYNC=${ignoreBinarySync} and PRIVATE=${privateImport}?`) ) {
      return;
    }

    let agent = privateImport ? 'protected' : null;

    collection.state = 'removing';
    this.requestUpdate();

    this.logger.info('Rerunning collection import', id);
    let resp = await this.CollectionImportModel.delete(id);
    this.logger.info('Collection import stopped', resp);

    resp = await this.CollectionImportModel.start(id, {ignoreBinarySync, agent});
    this.logger.info('Collection import started', resp);
    this.updateCollection(id);
  }

  async refresh() {
    for( let item of this.collectionList ) {
      if( item.state === 'running' ) {
        this.logger.info('Refreshing collection import', item.id);
        this.updateCollection(item.id);
      }
    }
  }

  async updateCollection(id) {
    this.logger.info('Updating collection', id);
    let resp = await this.CollectionImportModel.get(id);

    if( resp.state !== 'loaded' ) {
      this.logger.warn('Error updating collection', id, resp);
      return
    }

    let item = resp.payload;
    this._wrapCollectionItem(item);

    let index = this.collectionList.findIndex(item => item.id === id);
    this.collectionList[index] = item;

    this.requestUpdate();
  }

  _updateScroll(collectionId) {
    let ele = this.querySelector(`pre.logs[collection-id="${collectionId}"][auto-scroll]`);
    if( !ele ) return;
    ele.scrollTop = ele.scrollHeight;
  }

  getJobLink(id) {
    if( !this.config ) return '';
    let k8s = this.config.k8s || {};

    if( k8s.dashboardUrl ) {
      return `${k8s.dashboardUrl}/job/${k8s.namespace}/import-${id}?namespace=${k8s.namespace}`;
    } else if( k8s.platform === 'docker-desktop' ) {
      return `http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/job/${k8s.namespace}/import-${id}?namespace=${k8s.namespace}`
    } else if( k8s.platform === 'gke' ) {
      return `https://console.cloud.google.com/kubernetes/job/${k8s.region}/${k8s.cluster}/${k8s.namespace}/import-${id}/details?project=${this.config.google.project}`;
    }
  
  }


}

customElements.define('dams-collection-import', DamsCollectionImport);