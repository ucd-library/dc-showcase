import {BaseService, PayloadUtils} from '@ucd-lib/cork-app-utils';
import BookReaderStore from '../stores/BookReaderStore.js';

let payloadUtils = new PayloadUtils({
  idParts : ['path', 'text', 'itemId', 'bookId']
});

class BookReaderService extends BaseService {

  constructor() {
    super();
    this.store = BookReaderStore;

    this.FIN_SERVICE = 'svc:gcs';
  }

  async loadPdfManifest(id, pdf) {
    let ido = {path: id};

    await this.request({
      url : pdf.clientMedia.pdf.manifest,
      checkCached : () => this.store.data.bookManifest.get(id),
      onUpdate : resp => {
        let payload = payloadUtils.generate(ido, resp);
        payload.src = pdf;
        payload.id = id;
        if( payload.payload ) {
          payload.payload = payload.payload.pages;
        }
        this.store.set(payload, this.store.data.bookManifest);
      }
    })
  }

  async getOcrData(url, itemId, page) {
    let id = url;
    await this.request({
      url,
      checkCached : () => this.store.data.ocrData.get(id),
      onUpdate : resp => {
        if( resp.payload ) {
          resp.payload = this.model.parsePageWords(resp.payload, itemId, page);
        }
        let payload = payloadUtils.generate({path:id}, resp)
        payload.id = id;
        this.store.set(payload, this.store.data.ocrData)
      }
    })

    return this.store.data.ocrData.get(id);
  }

  async search(itemId, bookId, query) {
    let ido = {itemId, bookId, text: query};
    let id = payloadUtils.getKey(ido);

    let pageLookupCache = {};

    await this.request({
      url : '/api/page-search/ia',
      qs : {
        item_id : bookId,
        q : query
      },
      checkCached : () => {
        let searchResults = this.store.data.state.searchResults;
        if( searchResults?.id === id ) {
          return searchResults;
        }
        return this.store.data.state.searchResults;
      },
      onUpdate : resp => {    
        if( resp.payload ) {
          let byPage = {};

          let pages = this.store.data.state.bookViewData.pages || [];

          // update matches to be matches[0] for entire array
          (resp.payload.matches || []).forEach(match => {
            let text = match.text;
            if( Array.isArray(match.par) && match.par.length > 0 ) {
              match.par = match.par[0];
            }
            match.par.text = text;
            match.par.regex = (text.match(/{{{(.*?)}}}/g) || [])
              .map(str => str.replace('{{{', '').replace('}}}', ''))
              .map(str => new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));

            if( match.par.boxes ) delete match.par.boxes;

            let page = pages.find(p => p.page === match.par.page);
            if( page ) match.par.page = (page.displayIndex||0) + 1;          

            if( !byPage[match.par.page-1] ) {
              byPage[match.par.page-1] = [];
              pageLookupCache[match.par.page] = this.model.getBookViewPage(itemId, match.par.page);
            }
            byPage[match.par.page-1].push(match.par);
          });
  
          resp.payload = byPage;
        }    
        this.store.setState('searchResults', payloadUtils.generate(ido, resp));
      }
    });

    return this.store.data.state.searchResults;
  }

}

const service = new BookReaderService();
export default service;