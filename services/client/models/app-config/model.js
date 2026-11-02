const pg = require('../../lib/pg.js');
const esClient = require('../../lib/es-client.js');
const config = require('../../config.js');
const uriUtils = require('../../lib/uri-utils.js');
const cask = require('../../lib/cask.js');
const { logger } = require('../../lib/logger.js');

const VISIBILITY = ['public', 'private'];

// gold json cache lifetime
const JSON_CACHE_MS = 5 * 60 * 1000;

/**
 * @class AppConfigModel
 * @description Collection and item display edits (watercolor, featured image,
 * viewer overrides, visibility) in the dcf_edits tables, keyed by full record URIs.
 * Site-wide config (featured collections, hero banner, browse by images) lives
 * as json files in the gold project's CaskFS folder.
 */
class AppConfigModel {

  constructor() {
    this.jsonCache = {};
  }

  /**
   * @method get
   * @description Get the edits for a collection or item by site path or URI.
   *
   * @param {String} id e.g. /collection/ark:/87287/d7abc
   *
   * @returns {Promise<Object|null>} see getCollectionEdits() and getItemEdits()
   */
  get(id) {
    let path = uriUtils.toPath(id);
    if( path.match(/^\/item\//) ) return this.getItemEdits(path);
    if( path.match(/^\/collection\//) ) return this.getCollectionEdits(path);
    return null;
  }

  /**
   * @method getCollectionEdits
   * @description Get a collection's edits plus its items' edits, keyed by item path.
   *
   * @param {String} id collection path or URI
   *
   * @returns {Promise<Object>} {collection: Object, items: Object}
   */
  async getCollectionEdits(id) {
    let uri = uriUtils.toUri(id);
    let [collection, items] = await Promise.all([
      pg.query(`SELECT * FROM dcf_edits.collection_edit WHERE collection_id = $1`, [uri]),
      pg.query(`SELECT * FROM dcf_edits.item_edit WHERE collection_id = $1`, [uri])
    ]);

    let itemEdits = {};
    for( let row of items.rows ) {
      itemEdits[uriUtils.toPath(row.item_id)] = row.edit;
    }

    return {
      collection : collection.rows.length ? this._collectionRowForApi(collection.rows[0]) : {},
      items : itemEdits
    };
  }

  /**
   * @method getItemEdits
   * @description Get a single item's edits.
   *
   * @param {String} id item path or URI
   *
   * @returns {Promise<Object>} the item's edit, or {} if it has none
   */
  async getItemEdits(id) {
    let resp = await pg.query(
      `SELECT edit FROM dcf_edits.item_edit WHERE item_id = $1`,
      [uriUtils.toUri(id)]
    );
    return resp.rows.length ? resp.rows[0].edit : {};
  }

  /**
   * @method saveCollectionEdit
   * @description Upsert a collection's edit. A missing visibility keeps the current value.
   *
   * @param {String} id collection path or URI
   * @param {Object} data {edit: Object, visibility: String}
   * @param {Object} opts {user: String} who made the edit
   *
   * @returns {Promise<Object>} the saved collection edit
   */
  async saveCollectionEdit(id, data={}, opts={}) {
    this._validate(data);
    let resp = await pg.query(
      `INSERT INTO dcf_edits.collection_edit (collection_id, edit, visibility, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (collection_id) DO UPDATE SET
         edit = EXCLUDED.edit,
         visibility = COALESCE(EXCLUDED.visibility, collection_edit.visibility),
         updated_by = EXCLUDED.updated_by,
         updated_at = now()
       RETURNING *`,
      [uriUtils.toUri(id), data.edit || {}, data.visibility || null, opts.user || null]
    );
    return this._collectionRowForApi(resp.rows[0]);
  }

  /**
   * @method saveItemEdit
   * @description Upsert an item's edit under the collection it belongs to.
   *
   * @param {String} id item path or URI
   * @param {Object} data {edit: Object}
   * @param {Object} opts {user: String, collectionId: String} collection URI from the item's isPartOf
   *
   * @returns {Promise<Object>} the saved item edit
   */
  async saveItemEdit(id, data={}, opts={}) {
    this._validate(data);
    let resp = await pg.query(
      `INSERT INTO dcf_edits.item_edit (item_id, collection_id, edit, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (item_id) DO UPDATE SET
         collection_id = EXCLUDED.collection_id,
         edit = EXCLUDED.edit,
         updated_by = EXCLUDED.updated_by,
         updated_at = now()
       RETURNING edit`,
      [uriUtils.toUri(id), uriUtils.toUri(opts.collectionId), data.edit || {}, opts.user || null]
    );
    return resp.rows[0].edit;
  }

  /**
   * @method setFeaturedImage
   * @description Record a collection's featured image CaskFS path, creating its row if needed.
   *
   * @param {String} id collection path or URI
   * @param {String} caskPath CaskFS-absolute path of the image
   * @param {Object} opts {user: String}
   *
   * @returns {Promise<Object>} the saved collection edit
   */
  async setFeaturedImage(id, caskPath, opts={}) {
    let resp = await pg.query(
      `INSERT INTO dcf_edits.collection_edit (collection_id, featured_image, updated_by, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (collection_id) DO UPDATE SET
         featured_image = EXCLUDED.featured_image,
         updated_by = EXCLUDED.updated_by,
         updated_at = now()
       RETURNING *`,
      [uriUtils.toUri(id), caskPath, opts.user || null]
    );
    return this._collectionRowForApi(resp.rows[0]);
  }

  /**
   * @method featuredImagePath
   * @description The CaskFS path a collection's featured image is written to, in its gold folder.
   * The folder is the goldPath argonath indexes on the collection document.
   *
   * @param {String} id collection path or URI
   * @param {String} ext file extension, e.g. '.jpg'
   *
   * @returns {Promise<String>} e.g. /gold/digital-dev/haeger/featured-image.jpg
   */
  async featuredImagePath(id, ext) {
    let uri = uriUtils.toUri(id);
    let doc = await esClient.get({index: 'collection-read', id: uri}).catch(() => null);
    let root = (doc?._source?.['@graph'] || []).find(node => node['@id'] === uri) || {};
    if( !root.goldPath ) {
      throw this._badRequest('collection has no goldPath, reindex it: '+id);
    }
    return root.goldPath + '/featured-image' + ext;
  }

  /**
   * @method goldPath
   * @description The CaskFS path of a file in the app's gold project folder.
   *
   * @param {String} file e.g. featured-collection-edits.json
   *
   * @returns {String} e.g. /gold/digital-dev/featured-collection-edits.json
   */
  goldPath(file) {
    return config.cask.goldBasePath + '/' + file;
  }

  /**
   * @method getFeaturedEdits
   * @description Get the home page's featured collections panels.
   *
   * @returns {Promise<Array>} saved panels, or [] if none have been saved
   */
  async getFeaturedEdits() {
    let text = await cask.read(this.goldPath('featured-collection-edits.json'));
    return text ? JSON.parse(text) : [];
  }

  /**
   * @method saveFeaturedEdits
   * @description Replace the home page's featured collections panels.
   *
   * @param {Array} panels panel objects from the home page editor
   * @param {Object} opts currently unused
   *
   * @returns {Promise<Array>} the saved panels
   */
  async saveFeaturedEdits(panels, opts={}) {
    if( !Array.isArray(panels) || panels.some(p => typeof p !== 'object' || p === null || Array.isArray(p)) ) {
      throw this._badRequest('featured collections must be an array of objects');
    }
    await cask.write(
      this.goldPath('featured-collection-edits.json'),
      JSON.stringify(panels, null, 2),
      {mimeType: 'application/json'}
    );
    return panels;
  }

  /**
   * @method getHeroImages
   * @description Get the home page hero images from hero-banner.json, with servable image urls.
   *
   * @returns {Promise<Array>} [{imageUrl, itemName, collectionName, itemLink, collectionLink}]
   */
  async getHeroImages() {
    let hero = await this._readCachedJson('hero-banner.json', []);
    return hero.map(({image, ...rest}) => ({
      imageUrl : this._imageUrl(image),
      ...rest
    }));
  }

  /**
   * @method getBrowseBySideImages
   * @description Get the browse by pages' side images from browse-by.json, with servable image urls.
   *
   * @returns {Promise<Object>} {subjectPage, creatorPage, formatPage}, each a list of
   * {page, leftImgUrl, leftLabel, leftItemLink, rightImgUrl, rightLabel, rightItemLink}
   */
  async getBrowseBySideImages() {
    let pages = await this._readCachedJson('browse-by.json', {});
    let result = {};
    for( let [page, entries] of Object.entries(pages) ) {
      result[page] = entries.map(({leftImage, rightImage, ...rest}) => {
        let entry = {...rest};
        if( leftImage ) entry.leftImgUrl = this._imageUrl(leftImage);
        if( rightImage ) entry.rightImgUrl = this._imageUrl(rightImage);
        return entry;
      });
    }
    return result;
  }

  /**
   * @method _imageUrl
   * @description Servable url for a file in the gold project folder.
   *
   * @param {String} file e.g. browse-by/a.png
   *
   * @returns {String}
   */
  _imageUrl(file) {
    return '/cask/api/fs' + this.goldPath(file);
  }

  /**
   * @method _readCachedJson
   * @description Read a gold project json file, cached for a few minutes since page loads read it.
   * A missing or unreadable file returns the fallback.
   *
   * @param {String} file path in the gold project folder
   * @param {*} fallback value when the file can't be read
   *
   * @returns {Promise<*>}
   */
  async _readCachedJson(file, fallback) {
    let cached = this.jsonCache[file];
    if( cached && cached.expires > Date.now() ) return cached.value;

    let value = fallback;
    try {
      let text = await cask.read(this.goldPath(file));
      if( text ) value = JSON.parse(text);
      else logger.warn(`No ${file} in CaskFS gold project, run digtk showcase init-cask`);
    } catch(e) {
      logger.error(`Error reading ${file}`, e);
    }

    this.jsonCache[file] = {value, expires: Date.now() + JSON_CACHE_MS};
    return value;
  }

  /**
   * @method _collectionRowForApi
   * @description Flatten a collection_edit row into the edit object the client reads.
   *
   * @param {Object} row collection_edit row
   *
   * @returns {Object}
   */
  _collectionRowForApi(row) {
    let obj = {...(row.edit || {}), visibility : row.visibility || 'private'};
    if( row.featured_image ) {
      // client expects an absolute url
      obj.thumbnailUrl = {'@id' : config.server.url + '/cask/api/fs' + row.featured_image};
    }
    return obj;
  }

  /**
   * @method _validate
   * @description Throw a 400-style error if a write body is malformed.
   *
   * @param {Object} data {edit, visibility}
   */
  _validate(data) {
    if( data.edit !== undefined && (typeof data.edit !== 'object' || data.edit === null || Array.isArray(data.edit)) ) {
      throw this._badRequest('edit must be an object');
    }
    if( data.visibility !== undefined && !VISIBILITY.includes(data.visibility) ) {
      throw this._badRequest('visibility must be public or private');
    }
  }

  /**
   * @method _badRequest
   * @description Build an error the api maps to a 400.
   *
   * @param {String} message
   *
   * @returns {Error}
   */
  _badRequest(message) {
    let e = new Error(message);
    e.status = 400;
    return e;
  }

}

module.exports = new AppConfigModel();
