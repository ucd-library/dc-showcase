import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class WorkflowStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      state : {}
    };
    this.events = {
      WORKFLOW_STATE_UPDATE: 'workflow-state-update'
    };
  }

  setState(prop, value) {
    if( typeof prop === 'object' ) {
      Object.keys(prop).forEach(key => {
        this.data.state[key] = prop[key];
      });
    } else {
      this.data.state[prop] = value;
    }
    this.emit(this.events.WORKFLOW_STATE_UPDATE, this.data.state);
  }

}

const store = new WorkflowStore();
export default store;
