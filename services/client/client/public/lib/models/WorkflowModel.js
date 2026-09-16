import {BaseModel} from '@ucd-lib/cork-app-utils';
import WorkflowService from '../services/WorkflowService.js';
// import WorkflowStore from '../stores/WorkflowStore.js';

class WorkflowModel extends BaseModel {

  constructor() {
    super();

    // this.store = WorkflowStore;
    this.service = WorkflowService;
    this.service.model = this;
      
    this.register('WorkflowModel');
  }

  // async get(imageUrl) {
  //   return this.service.get(imageUrl);
  // }

  // async start(imageUrl) {
  //   return this.service.start(imageUrl);
  // }

  // async getParams(imageUrl) {
  //   return this.service.getParams(imageUrl);
  // }

  // async setParams(imageUrl, params) {
  //   return this.service.setParams(imageUrl, params);
  // }

  async batchStatus(name, imageIds) {
    return this.service.batchStatus(name, imageIds);
  }

  async batchStart(name, params, imageIds) {
    return this.service.batchStart(name, params, imageIds);
  }

}

const model = new WorkflowModel();
export default model;