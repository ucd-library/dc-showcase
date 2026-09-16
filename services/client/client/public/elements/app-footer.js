import { LitElement, html } from 'lit';

import render from "./app-footer.tpl.js";
import { Mixin, LitCorkUtils } from '@ucd-lib/cork-app-utils';

import "./auth/app-auth-footer";

class AppFooter extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return { 
      localBuildTime : {type: String},
      appVersion : {type: String},
      showVersion : {type: Boolean},
      buildNum : {type: String},
      clientEnv : {type: String},
      finAppVersion : {type: String},
      finBranchName : {type: String},
      finRepoTag : {type: String},
      finServerImage : {type: String},
      finServerRepoHash : {type: String},
      damsDeployBranch : {type: String},
      damsDeploySha : {type: String},
      damsDeployTag : {type: String},
      damsRepoBranch : {type: String},
      damsRepoSha : {type: String},
      damsRepoTag : {type: String}
    };
  }

  constructor() {
    super();
    this.active = true;
    this.render = render.bind(this);

    this._injectModel('AppStateModel');
  }  

  getLocalTime(date) {
    if( !date ) return '';
    date = new Date(date+'.000Z');

    return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+
     (date.getHours() > 12 ? date.getHours() - 12 : date.getHours())+':'+
     (date.getMinutes() < 10 ? '0' : '')+date.getMinutes()+
     (date.getHours() > 11 ? 'pm' : 'am');
  }
}

customElements.define('app-footer', AppFooter);