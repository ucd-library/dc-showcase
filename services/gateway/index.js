import express from 'express';
import httpProxy from 'http-proxy';
import config from './lib/config.js';
import caskClient from './lib/cask-client.js';
import { logger, logReqMiddleware } from './lib/logger.js';
import { init as initAuthMiddleware } from './controllers/auth.js';

// matches the ark segment (and optional sub-path) of a fin container path, e.g.
// /fcrepo/rest/item/ark:/87293/d38j6q/original.jpg -> ark:/87293/d38j6q, /original.jpg
// mirrors the ARCHIVAL_GROUP_REGEX convention already used in
// dams/services/fin/models/item/transform.js
const FCREPO_PATH_REGEX = /^\/fcrepo\/rest\/(?:item|collection)\/(ark:\/[a-z0-9]+\/[a-z0-9]+)(\/.*)?$/i;
const GCS_PATH_REGEX = /^(.*)\/svc:gcs\/(.*)$/i;
const IIIF_PATH_REGEX = /^\/iiif\/(.*)$/i;
// This is a HACK
const IIIF_TIF_PATH = '/images/tiled.tif';

// proxied caskfs/iiif paths are read-only
const READ_METHODS = ['GET', 'HEAD'];

/**
 * @function rejectWrite
 * @description Send a 405 for any non-read request to a proxied file path.
 * These proxies present the gateway's trusted CaskFS identity, so writes must
 * go through the client app's protected api instead.
 *
 * @param {Object} req express request
 * @param {Object} res express response
 *
 * @returns {Boolean} true if the request was rejected
 */
function rejectWrite(req, res) {
  if( READ_METHODS.includes(req.method) ) return false;
  res.set('Allow', READ_METHODS.join(', ')).status(405).send('Method not allowed');
  return true;
}

const app = express();
const proxy = httpProxy.createProxyServer({ xfwd: true });

proxy.on('error', (err, req, res) => {
  logger.error(`Proxy error for ${req.url}: ${err.message}`);
  res.status(500).send('Proxy error');
});

app.use(logReqMiddleware(logger));

// strip all x-* headers from requests
app.use((req, res, next) => {
  for (const header in req.headers) {
    if (header.startsWith('x-')) {
      delete req.headers[header];
    }
  }
  next();
});

initAuthMiddleware(app);

app.use(async (req, res, next) => {
  if( !req.path.startsWith('/cask/') ) {
    return next();
  }
  if( rejectWrite(req, res) ) return;

  // /cask/api/fs, /cask/file, or bare /cask
  let caskPath = req.path.replace(/^\/cask(\/api\/fs|\/file)?/, '');
  req.url = '/api/fs' + caskPath;
  logger.debug(`Rewriting ${req.path} -> ${req.url} to ${config.caskfs.url} for CaskFS request`);
  proxy.web(req, res, { target: config.caskfs.url, headers: caskClient.authHeaders() });
});

app.use(async (req, res, next) => {
  if( !IIIF_PATH_REGEX.test(req.path) ) {
    return next();
  }
  if( rejectWrite(req, res) ) return;

  // split /iiif/<cask path>/-/<iiif query>
  let iiifPath = req.path.replace(/^\/iiif/, '');
  let sep = iiifPath.indexOf('/-/');
  let caskPath = sep === -1 ? iiifPath : iiifPath.slice(0, sep);
  let iiifQuery = sep === -1 ? '' : iiifPath.slice(sep + 2);
  let metadata;
  try {
    metadata = await caskClient.getFileMetadata(caskPath);
  } catch (err) {
    logger.error(`Error fetching metadata for ${caskPath}: ${err.message}`);
    return res.status(500).send('Error finding cask file for IIIF request');
  }
  console.log('metadata', metadata);
  let casPath = caskClient.casRelativePath(metadata.hash_value);
  console.log('casPath', casPath, 'iiifQuery', iiifQuery);

  req.url = config.iiif.basePath + casPath + iiifQuery;
  logger.info(`Rewriting ${req.path} -> ${req.url} to ${config.iiif.url} for IIIF request`);
  proxy.web(req, res, { target: config.iiif.url });
});


app.use(async (req, res, next) => {
  if( !GCS_PATH_REGEX.test(req.path) ) {
    return next();
  }
  if( rejectWrite(req, res) ) return;

  let [itemPath, subPath] = req.path.replace('/fcrepo/rest', '').split('/svc:gcs/');
  // subpath still has old bucket name
  subPath = subPath.split('/').slice(1).join('/');

  req.url = '/api/fs' + itemPath + subPath;
  logger.debug(`Rewriting ${req.path} -> ${req.url} to ${config.caskfs.url} for GCS request`);
  proxy.web(req, res, { target: config.caskfs.url, headers: caskClient.authHeaders() });
});


/**
 * Raw check for old fcrepo paths
 */
app.use(async (req, res, next) => {
  let match = req.path.match(FCREPO_PATH_REGEX);
  if( !match ) return next();
  if( rejectWrite(req, res) ) return;

  let [type, ark, subPath] = match;

  let caskPath = req.path.replace('/fcrepo/rest', '');

  req.url = '/api/fs' + caskPath;
  logger.debug(`Rewriting ${req.path} -> ${req.url} to ${config.caskfs.url} for fcrepo request`);
  proxy.web(req, res, { target: config.caskfs.url, headers: caskClient.authHeaders() });
});


/**
 * @function clientAuthHeaders
 * @description Bearer header for the logged-in user's access token, refreshing it if expired.
 * Requests that already send a token, or have no session, get no header.
 *
 * @param {Object} req express request
 *
 * @returns {Promise<Object>} headers to add to the client proxy request
 */
async function clientAuthHeaders(req) {
  if( req.headers.authorization || !req.oidc?.isAuthenticated() ) return {};
  let accessToken = req.oidc.accessToken;
  if( !accessToken ) return {};
  if( accessToken.isExpired() ) {
    try {
      accessToken = await accessToken.refresh();
    } catch(e) {
      logger.warn(`Access token refresh failed: ${e.message}`);
      return {};
    }
  }
  return { authorization: 'Bearer ' + accessToken.access_token };
}

app.use(async (req, res) => {
  proxy.web(req, res, { target: config.client.url, headers: await clientAuthHeaders(req) });
});

app.listen(config.port, () => {
  logger.info(`Digital Collections Showcase router listening on port ${config.port}`);
});
