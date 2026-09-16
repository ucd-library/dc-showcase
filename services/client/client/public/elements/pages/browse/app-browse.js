import { LitElement} from 'lit';
import render from "./app-browse.tpl.js";
import {MainDomElement} from '@ucd-lib/theme-elements/utils/mixins';

import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import '../../utils/app-browse-by';

class AppBrowse extends Mixin(LitElement) 
  .with(MainDomElement, LitCorkUtils) {

  static get properties() {
    return {
      page : {type: String},
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.active = true;

    this.page = '';

    this._injectModel('AppStateModel');
  }

  async firstUpdated() {
    this._onAppStateUpdate(await this.AppStateModel.get());
  }

  _onAppStateUpdate(e) {
    let page = '/'+e.location.path[0];
    if( e.location.path.length > 1 ) page += '/'+e.location.path[1];
    this.page = page;
  }
  
}

customElements.define('app-browse', AppBrowse);
