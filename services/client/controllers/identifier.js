const config = require('../config');
const { logger } = require('../lib/logger');
const models = require('./models.js');
const pg = require('../lib/pg.js');
const cors = require('cors');
const v1CollectionLookup = require('./v1-collections.json');
let item, collection;

let idRegExp = /(ark|doi):\/?[a-zA-Z0-9\.]+\/[a-zA-Z0-9\.]+/;
const V1_REDIRECTS_TABLE = 'v1_port.redirects';

module.exports = async (app) => {
  /**
   * listen for /ark: or /doi:
   */
  app.get(/^\/(ark|doi):*/, cors(), handleRequest);
  app.get(/^\/collection\//, checkForCollectionRedirect);
  item = (await models.get('item')).model;
  collection = (await models.get('collection')).model;
};

async function checkForCollectionRedirect(req, resp, next) {
  // if an ark, doi or skip
  if( req.originalUrl.match(idRegExp) ) {
    return next();
  }

  let fullId = req.originalUrl.replace(/\?.*/, '').split('/');

  // v1 redirects are 5, 6 or 7 segments long
  let idSet = new Set([
    fullId.slice(0, 5).join('/'),
    fullId.slice(0, 6).join('/'),
    fullId.slice(0, 7).join('/')
  ]);

  let t = Date.now();
  let result = await pg.query(
    `select * from ${V1_REDIRECTS_TABLE} where source = any($1::text[])`,
    [Array.from(idSet)]
  );

  if( result.rows.length ) {
    let redirect = result.rows[0];
    logger.info('found v1 item redirect', req.originalUrl, redirect.status_code+'', redirect.source, redirect.destination);
    return resp.redirect(redirect.status_code, '/item/'+redirect.destination);
  }

  fullId = req.originalUrl.replace(/\/collection\//, '');
  let id = fullId.split('/')[0];
  if( v1CollectionLookup[id] ) {
    logger.info('found v1 collection redirect', req.originalUrl, id, v1CollectionLookup[id]);
    let code = req.originalUrl.split('/').length === 3 ? 301 : 302;
    let flag = req.originalUrl.split('/').length === 3 ? '' : '?from=v1';
    resp.redirect(code, '/collection/'+v1CollectionLookup[id]+flag);
    return;
  }

  next();
}

/**
 * @function handleRequest
 * @description handle express request
 * 
 * @param {Object} req express request
 * @param {Object} resp express response
 */
async function handleRequest(req, resp) {
  let info = {};

  // split apart id, type and suffix from url
  try {
    info = req.url.split(idRegExp);
    info = {
      id : req.url.match(idRegExp)[0],
      type : info[1],
      suffix : info[2]
    }
  } catch(e) { 
    logger.info('error parsing ark/doi request: ', req.originalUrl, e);
    return resp.status(400).send('Bad request');
  }

  // request record from identifier field in elasticsearch
  let record;
  let isCollection = false;
  try {
    record = await item.getByArk(info.id);
    if( !record.results.length ) {
      record = await collection.getByArk(info.id);
      isCollection = true;
    }
  } catch(e) {
    logger.info('error looking up ark: ', info, e);
    return resp.status(500).json({error: true, message: e.message, stack: e.stack});
  }

  // if we dont find a record, send unknown id message
  if( !record.results.length ) {
    return resp.status(404).send(`Unknown ${info.type} identifier: ${info.id}`);
  }

  let id = record.results[0]['@id'];

  // if the Accept header contains text/html and there is no
  // suffix in the url, ie just the ark or doi is provided
  // redirect to ucd dams UI.  otherwise send to fcrepo UI
  if( (req.get('accept') || '').match(/text\/html/) ) {
    if( isCollection ) {
      resp.redirect(id);
    } else {
      resp.redirect(id+info.suffix);
    }
  } else {
    resp.redirect(config.fcrepo.root+id+info.suffix);
  }
};

