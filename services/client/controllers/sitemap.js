const config = require('../config.js');
let collections = require('../models/collection/index.js');
let items = require('../models/item/index.js');

collections = collections.model;
items = items.model;

const COLLECTIONS_SITEMAP = '_collections';

class SitemapModel {

  /**
   * @method middleware
   * @description wireup middleware for sitemap
   * 
   * @param {Object} app express app instance
   */
  middleware(app) {
    let allow = 'Disallow: /';
    let sitemap = '';

    if( config.server.url.match('https://digital.ucdavis.edu') ) {
      allow = `Disallow: /api/search
Disallow: /auth
Disallow: /api`;
      sitemap = `Sitemap: ${config.server.url}/sitemap.xml`;
    }

    app.get(/^\/sitemap.*/, (req, res) => this._onRequest(req, res));
    app.get('/all-items.txt', (req, res) => this.allItems(res));
    app.get('/robots.txt', (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send(`User-agent: * 
${allow}
Crawl-delay: 30

${sitemap}`);
    });
  }

  /**
   * @method _onRequest
   * @description handle any request that starts with /sitemap.  Bound
   * to express app route above
   * 
   * @param {Object} req express request
   * @param {Object} res express response
   */
  async _onRequest(req, res) {
    let collection = req.url
      .replace(/^\/sitemap/, '')
      .replace(/\.xml$/, '');

    res.set('Content-Type', 'application/xml');
    
    try {
      // no collection name provided, set the root sitemapindex for all collections
      if( !collection ) {
        // return res.send(await this.getRoot());
        return  res.send(await this.getCollections());
      }

      collection = collection.replace(/^-/,'');
      // if( collection === COLLECTIONS_SITEMAP ) {
      //   return await this.getCollections(res);
      // }

      // send express response, we are going to stream out the xml result
      this.getCollection(collection.replace(/^-/,''), res);
    } catch(e) {
      res.set('Content-Type', 'application/json');
      res.status(500).json({
        error : true,
        message : e.message,
        stack : e.stack
      });
    }
  }

  /**
   * @method getRoot
   * @description create the root sitemapindex for all collections
   * 
   * @returns {Promise} resolves to xml string
   */
//   async getRoot() {
//     let sitemaps = await collections.esSearch({
//       _source : ['name']
//     });

//     let hits = sitemaps.hits.hits || [];
//     sitemaps = hits.map(result => `<sitemap>
//     <loc>${config.server.url}/sitemap-${result._id.replace('/collection/','')}.xml</loc>
// </sitemap>`);

//     return `<?xml version="1.0" encoding="UTF-8"?>
// <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   <sitemap>
//     <loc>${config.server.url}/sitemap-${COLLECTIONS_SITEMAP}.xml</loc>
//   </sitemap>
//   ${sitemaps.join('\n')}
// </sitemapindex>`;
//   }

  /**
   * @method getCollections
   * 
   */
  async getCollections() {
    let sitemaps = await collections.esSearch({
      from : 0,
      size : 10000,
      _source : ['name']
    });

    let hits = sitemaps.hits.hits || [];
    sitemaps = hits.map(result => `<sitemap>
        <loc>${config.server.url}/sitemap-${result._id.replace('/collection/','')}.xml</loc>
    </sitemap>`);

        return `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemaps.join('\n')}
    </sitemapindex>`;
  }

  /**
   * @method getCollection
   * @description create sitemap file for a collection.  Unlike get root above,
   * this method takes the collection id AND express response object as we are
   * going to stream the sitemap xml as it may be large (10k+ records)
   * 
   * @param {String} id collection slug
   * @param {Object} resp express response object
   * 
   * @returns {Promise} resolves to xml string
   */
  async getCollection(id, resp) {
    // set xml header
    resp.write(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);

    // create our es query
    let query = {
      bool: {
        filter: [
          {term: {'@graph.isPartOf.@id': `/collection/${id}`}}
        ]
      }
    };

    let chunkSize = 1000;
    let time = '30s';

    // find records and start scroll
    let result = await items.esSearch({
      _source : ['name'],
      query : query,
      size: chunkSize
    }, {scroll: time});

    let sent = result.hits.hits.length;
    result.hits.hits.forEach(result => this._writeResult(resp, result));
    
    while( chunkSize === sent ) {
      result = await items.esScroll({
        scroll_id: result._scroll_id,
        scroll: time
      });

      result.hits.hits.forEach(result => this._writeResult(resp, result));
      sent = result.hits.hits.length;
    }

    // finish our sitemap xml and end response
    resp.write('</urlset>');
    resp.end();
  }

  async allItems(resp) {
    resp.set('Content-Type', 'text/plain');

    // create our es query
    let query = {};
    let time = '30s';
    let chunkSize = 1000;

    // find records and start scroll
    let result = await items.esSearch({
      _source : ['name'],
      size: chunkSize
    }, {scroll: time});

    let sent = result.hits.hits.length;
    result.hits.hits.forEach(result => resp.write(`${config.server.url}${result._id}\n`));
    while( sent > 0 ) {
      result = await items.esScroll({
        scroll_id: result._scroll_id,
        scroll: time
      });

      result.hits.hits.forEach(result => resp.write(`${config.server.url}${result._id}\n`));
      sent = result.hits.hits.length;
    }

    // todo clear scroll

    // finish our response
    resp.end();
  }

  /**
   * @method _writeResult
   * @description write a single result for sitemap
   * 
   * @param {Object} resp express response
   * @param {Object} result elasticsearch record result
   */
  _writeResult(resp, result) {
    resp.write(`<url>
        <loc>${config.server.url}${result._id}</loc>
        <changefreq>weekly</changefreq>
        <priority>.5</priority>
    </url>\n`);
  }

}

module.exports = new SitemapModel();