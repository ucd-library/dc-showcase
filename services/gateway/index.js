import express from 'express';
import httpProxy from 'http-proxy';
import config from './lib/config.js';
import caskClient from './lib/cask-client.js';
import { logger, logReqMiddleware } from './lib/logger.js';

// matches the ark segment (and optional sub-path) of a fin container path, e.g.
// /fcrepo/rest/item/ark:/87293/d38j6q/original.jpg -> ark:/87293/d38j6q, /original.jpg
// mirrors the ARCHIVAL_GROUP_REGEX convention already used in
// dams/services/fin/models/item/transform.js
const FCREPO_PATH_REGEX = /^\/fcrepo\/rest\/(?:item|collection)\/(ark:\/[a-z0-9]+\/[a-z0-9]+)(\/.*)?$/i;
const GCS_PATH_REGEX = /^(.*)\/svc:gcs\/(.*)$/i;
const IIIF_PATH_REGEX = /^(.*)]\/svc:iiif\/(.*)$/i;
// This is a HACK
const IIIF_TIF_PATH = '/images/tiled.tif';

const app = express();
const proxy = httpProxy.createProxyServer({ xfwd: true });


app.use(logReqMiddleware);

// proxy.on('error', (err, req, res) => {
//   console.error(`Proxy error for ${req.method} ${req.originalUrl}`, err);
//   if( !res.headersSent ) {
//     res.status(502).send('Bad gateway');
//   }
// });

// TODO: any fcrepo/rest path should check access first.

app.use(async (req, res, next) => {
  if( !req.path.startsWith(config.IIIF_PATH_REGEX) ) {
    return next();
  }

  let parts = req.path.replace('/fcrepo/rest', '').split('/svc:iiif/');
  let caskPath = [config.caskfs.goldBasePath, parts[0], IIIF_TIF_PATH].join('');
  let metadata = await caskClient.getFileMetadata(caskPath);
  let iiifQuery = parts[1].replace(IIIF_TIF_PATH, '');


  req.url = metadata.fullPath + iiifQuery;
  logger.debug(`Rewriting ${req.path} -> ${req.url} to ${config.iiif.url} for IIIF request`);
  proxy.web(req, res, { target: config.iiif.url });
});


app.use(async (req, res, next) => {
  if( !req.path.startsWith(config.GCS_PATH_REGEX) ) {
    return next();
  }

  let [itemPath, subPath] = req.path.replace('/fcrepo/rest', '').split('/svc:gcs/');
  // subpath still has old bucket name
  subPath = subPath.split('/').slice(1).join('/');

  req.url = itemPath + subPath;
  logger.debug(`Rewriting ${req.path} -> ${req.url} to ${config.caskfs.url} for GCS request`);
  proxy.web(req, res, { target: config.caskfs.url });
});


/**
 * Raw check for old fcrepo paths
 */
app.use(async (req, res, next) => {
  let match = req.path.match(FCREPO_PATH_REGEX);
  if( !match ) return next();

  let [type, ark, subPath] = match;

  let caskPath = req.path.replace('/fcrepo/rest', '');

  req.url = caskPath;
  logger.debug(`Rewriting ${req.path} -> ${req.url} to ${config.caskfs.url} for fcrepo request`);
  proxy.web(req, res, { target: config.caskfs.url });
});


app.use((req, res) => {
  proxy.web(req, res, { target: config.client.url });
});

app.listen(config.port, () => {
  console.log(`DAMS router listening on port ${config.port}`);
});
