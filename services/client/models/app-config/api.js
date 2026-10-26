const {Router} = require('express');
const model = require('./model.js');
const itemModel = require('../item/model.js');
const keycloak = require('../../lib/keycloak.js');
const cask = require('../../lib/cask.js');
const collectionRoles = require('../../lib/collection-roles.js');
const config = require('../../config.js');
const { logger } = require('../../lib/logger.js');

const IMAGE_EXT = {
  'image/jpeg' : '.jpg',
  'image/png' : '.png',
  'image/webp' : '.webp',
  'image/gif' : '.gif'
};

let router = Router();
let protect = keycloak.protect([config.finac.agents.admin, 'ui-admin']);

/**
 * @function sendError
 * @description Send an error response, using its status when set.
 *
 * @param {Object} res express response
 * @param {Error} e
 */
function sendError(res, e) {
  if( !e.status ) logger.error('app-config api error', e);
  res.status(e.status || 500).json({error: true, message: e.message});
}

/**
 * @function idFromPath
 * @description The record path a request is for, minus any suffix.
 *
 * @param {Object} req express request
 * @param {String} suffix trailing path segment to strip
 *
 * @returns {String} e.g. /collection/ark:/87287/d7abc
 */
function idFromPath(req, suffix='') {
  let path = decodeURIComponent(req.path);
  return suffix ? path.slice(0, -suffix.length) : path;
}

/**
 * @function editor
 * @description The username recorded as updated_by.
 *
 * @param {Object} req express request
 *
 * @returns {String|null}
 */
function editor(req) {
  return req.user?.preferred_username || req.user?.username || null;
}

router.put(/^\/collection\/.+/, protect, async (req, res) => {
  try {
    let id = idFromPath(req);
    let {edit, visibility} = req.body || {};
    let previous = (await model.getCollectionEdits(id)).collection.visibility || 'private';
    let saved = await model.saveCollectionEdit(id, {edit, visibility}, {user: editor(req)});

    // only re-role ES docs on change
    if( saved.visibility !== previous ) {
      let result = await collectionRoles.set(id, saved.visibility);
      logger.info(`${id}: visibility ${previous} -> ${saved.visibility}`, result);
    }
    res.json(saved);
  } catch(e) {
    sendError(res, e);
  }
});

router.put(/^\/item\/.+/, protect, async (req, res) => {
  try {
    let id = idFromPath(req);
    let item = await itemModel.get(id, {roles: [config.finac.agents.admin]});
    if( !item ) return res.status(404).json({error: true, message: 'item not found: '+id});

    // collection comes from the indexed item
    let root = (item['@graph'] || []).find(node => node['@id'] === item['@id']) || {};
    let isPartOf = [].concat(root.isPartOf || []);
    let collection = isPartOf.find(node => (node['@id'] || '').startsWith('/collection/'));
    if( !collection ) return res.status(400).json({error: true, message: 'item has no collection: '+id});

    let {edit} = req.body || {};
    res.json(await model.saveItemEdit(id, {edit}, {
      user: editor(req),
      collectionId: collection['@id']
    }));
  } catch(e) {
    sendError(res, e);
  }
});

router.post(/^\/collection\/.+\/featured-image$/, protect, async (req, res) => {
  try {
    let mimeType = (req.headers['content-type'] || '').split(';')[0].trim();
    let ext = IMAGE_EXT[mimeType];
    if( !ext ) return res.status(400).json({error: true, message: 'unsupported image type: '+mimeType});

    let id = idFromPath(req, '/featured-image');
    let caskPath = await model.featuredImagePath(id, ext);
    await cask.write(caskPath, req, {mimeType});
    res.json(await model.setFeaturedImage(id, caskPath, {user: editor(req)}));
  } catch(e) {
    sendError(res, e);
  }
});

router.get(/^\/.*/, async (req, res) => {
  try {
    res.json(await model.get(idFromPath(req)));
  } catch(e) {
    sendError(res, e);
  }
});

module.exports = router;
