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
const IIIF_PATH_REGEX = /^(.*)\/svc:iiif\/(.*)$/i;
// This is a HACK
const IIIF_TIF_PATH = '/images/tiled.tif';

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

  let caskPath = req.path.replace(/^\/cask(\/file)?/, '');
  req.url = '/api/fs' + caskPath;
  logger.debug(`Rewriting ${req.path} -> ${req.url} to ${config.caskfs.url} for CaskFS request`);
  proxy.web(req, res, { target: config.caskfs.url, headers: caskClient.authHeaders() });
});

app.use(async (req, res, next) => {
  if( !IIIF_PATH_REGEX.test(req.path) ) {
    return next();
  }

  let parts = req.path.replace('/fcrepo/rest', '').split('/svc:iiif/');
  let caskPath = [config.caskfs.goldBasePath, parts[0], IIIF_TIF_PATH].join('');
  let metadata = await caskClient.getFileMetadata(caskPath);
  let iiifQuery = parts[1].replace(IIIF_TIF_PATH, '');
  let casPath = caskClient.casRelativePath(metadata.hash_value);

  req.url = config.iiif.basePath + casPath + iiifQuery;
  logger.debug(`Rewriting ${req.path} -> ${req.url} to ${config.iiif.url} for IIIF request`);
  proxy.web(req, res, { target: config.iiif.url });
});


app.use(async (req, res, next) => {
  if( !GCS_PATH_REGEX.test(req.path) ) {
    return next();
  }

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

  let [type, ark, subPath] = match;

  let caskPath = req.path.replace('/fcrepo/rest', '');

  req.url = '/api/fs' + caskPath;
  logger.debug(`Rewriting ${req.path} -> ${req.url} to ${config.caskfs.url} for fcrepo request`);
  proxy.web(req, res, { target: config.caskfs.url, headers: caskClient.authHeaders() });
});


app.use((req, res) => {
  proxy.web(req, res, { target: config.client.url });
});

app.listen(config.port, () => {
  logger.info(`Digital Collections Showcase router listening on port ${config.port}`);
});
