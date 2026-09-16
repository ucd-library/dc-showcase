import { LitElement} from 'lit';
import render from './citation.tpl.js';

import citations from '../../lib/models/CitationsModel';

import '../utils/app-toast-popup.js';

/**
 * @class Citation
 * @description Styleized UI component for Citations
 */
export class Citation extends LitElement {
  static get properties() {
    return {
      // count : {type : String},
      // choices: { type : Array },
      record: {type : Object},
      recordId: {type : String},
      citations : {type : Array},
      selectedCitation : {type : Object},
      citationTypeLabel : {type : String, attribute : 'citation-type-label'}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.active = true;
    
    this.record = {};
    this.recordId = '';
    this.citations = [];
    this.selectedCitation = {};
    this.citationTypeLabel = 'Collection';
    
  }

  async updated() {
    if( !Object.keys(this.record || {}).length || ( this.citations.length && this.recordId === this.record['@id']) ) return;

    this.recordId = this.record['@id'];
    let newCitations = [];

    newCitations.push({
      type : 'mla',
      text : await citations.renderEsRecord(this.record, 'mla')
    });
    newCitations.push({
      type : 'apa',
      text : await citations.renderEsRecord(this.record, 'apa')
    });
    newCitations.push({
      type : 'chicago',
      text : await citations.renderEsRecord(this.record, 'chicago')
    });

    this.citations = newCitations;
    this.selectedCitation = newCitations.filter(c => c.type === 'apa')[0];
  }

  _citeChange(e) {
    this.selectedCitation = this.citations.filter(c => c.type === e.target.value)[0];
  }

  async _copyCiteText(e) {
    try {
      await navigator.clipboard.writeText(this.shadowRoot.querySelector('.csl-entry').innerHTML);
      let toastPopup = this.shadowRoot.querySelector('app-toast-popup');
      if( toastPopup ) toastPopup.showPopup();
    } catch (err) {
      this.logger.error('Failed to copy citation: ', err);
    }
  }

}

customElements.define('app-citation', Citation);
