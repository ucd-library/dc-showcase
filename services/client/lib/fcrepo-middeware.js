const httpProxy = require('http-proxy');
const config = require('../config.js');
const cask = require('./cask.js');
const { logger } = require('./logger.js');

/**
 * @description Reverse-proxy shim resolving legacy `/fcrepo/rest/...` URLs
 * against CaskFS instead of real fcrepo/fin - see docs/PORT-PLAN.md Phase 2.
 * The dams client/server is the sole public front door; every branch below
 * forwards the request server-side via `http-proxy` rather than redirecting
 * the browser to an internal-only host.
 *
 * Identifier resolution: CaskFS paths are not derived from an item's
 * identifier (see `lib/cask.js`'s doc comment) - `fcrepoPath` is treated as
 * an opaque identifier (an ARK, a box/folder ID, or that plus any
 * child-binary path segment - real identifiers won't all be ARKs, see
 * docs/PORT-PLAN.md Phase 2) and resolved to a real CaskFS file path via
 * `cask.resolvePath()` before any branch below runs. This is the working
 * assumption flagged as an open risk in docs/PORT-PLAN.md Phase 2 - confirm
 * against the real argonath ingestion contract once it lands.
 */
const fcrepo = httpProxy.createProxyServer({
  selfHandleResponse: false,
  proxyTimeout: 30000,
  timeout: 30000
});

fcrepo.on('error', (err, req, res) => {
  logger.error('fcrepo-middleware proxy error', err);
  if( !res.headersSent ) res.status(502).json({ error: true, message: 'Upstream request failed' });
});

/**
 * @function parseFcrepoUrl
 * @description Split an incoming `/fcrepo/...` request URL into the
 * resolvable identifier/path portion and, if present, a fin-style `svc:xxx`
 * service name plus its own sub-path.
 *
 * @param {String} url
 *
 * @returns {{fcrepoPath: String, service: String|null, servicePath: String}}
 */
function parseFcrepoUrl(url) {
  let fcrepoPath = url.replace(/^\/fcrepo(\/rest)?/, '');

  let service = null;
  let servicePath = '';
  let match = fcrepoPath.match(/\/svc:([a-zA-Z0-9]+)/);
  if( match ) {
    service = match[1];
    servicePath = fcrepoPath.replace(/.*\/svc:[a-zA-Z0-9]+/, '');
    fcrepoPath = fcrepoPath.replace(/\/svc:.*$/, '');
  }

  return { fcrepoPath, service, servicePath };
}

/**
 * @function sidecarToBinaryPath
 * @description CaskFS's RDF subject-to-file resolution (`cask.resolvePath()`)
 * resolves to whichever file actually carries the RDF triple - for a
 * binary's own identifier-addressed child path, that's its `.jsonld.json`
 * sidecar
 * (see argonath's docs/cask-conventions.md "Sidecar Convention": "every
 * binary has a sibling `.jsonld.json` sidecar"), not the binary itself.
 * Binary-serving branches (svc:iiif, svc:gcs) need the real binary's path
 * to get its own hash/content; strip the sidecar suffix to get there. A
 * plain resolved path (an item/collection's own descriptive document, the
 * plain-stream branch's territory) has no such suffix and passes through
 * unchanged.
 *
 * @param {String} filePath resolved CaskFS file path
 *
 * @returns {String}
 */
function sidecarToBinaryPath(filePath) {
  return filePath.endsWith('.jsonld.json') ? filePath.slice(0, -'.jsonld.json'.length) : filePath;
}

/**
 * @function dirname
 * @description POSIX-path dirname, without pulling in Node's `path` module
 * for one line - CaskFS paths are always POSIX-style regardless of host OS.
 *
 * @param {String} filePath
 *
 * @returns {String}
 */
function dirname(filePath) {
  return filePath.replace(/\/[^/]*$/, '') || '/';
}

/**
 * @function proxyToCask
 * @description Forward the request to CaskFS's file-content endpoint for
 * a resolved file path, presenting this server's CaskFS identity. Forwards
 * Range/If-None-Match headers through untouched (CaskFS supports both).
 *
 * @param {Object} req express request
 * @param {Object} res express response
 * @param {String} filePath resolved CaskFS file path
 */
function proxyToCask(req, res, filePath) {
  fcrepo.web(req, res, {
    target: cask.fileUrl(filePath),
    ignorePath: true,
    changeOrigin: true,
    headers: cask.headers()
  });
}

async function middleware(req, res, next) {
  if( !req.url.match(/^\/fcrepo/) ) return next();

  try {
    let { fcrepoPath, service, servicePath } = parseFcrepoUrl(req.url);

    if( service && !['iiif', 'gcs'].includes(service) ) {
      return res.status(404).json({ error: true, message: `Service not found: ${service}` });
    }

    let subject = fcrepoPath.replace(/^\//, '');
    let resolvedPath = await cask.resolvePath(subject);
    if( !resolvedPath ) {
      return res.status(404).json({ error: true, message: `Not found: ${fcrepoPath}` });
    }

    if( service === 'iiif' ) {
      // resolve the CAS-relative hash path, then proxy straight to the IIIF
      // service's own direct-mount of CaskFS's CAS root - Node never
      // streams the image bytes itself.
      let metadata = await cask.getMetadata(sidecarToBinaryPath(resolvedPath));
      if( !metadata?.hash_value ) {
        return res.status(404).json({ error: true, message: `No binary content for: ${fcrepoPath}` });
      }

      let iiifQuery = new URLSearchParams({ IIIF: `${cask.casRelativePath(metadata.hash_value)}${servicePath}` });
      fcrepo.web(req, res, {
        target: `${config.iiif.host}/fcgi-bin/iipsrv.fcgi?${iiifQuery}`,
        ignorePath: true,
        changeOrigin: true
      });
      return;
    }

    if( service === 'gcs' ) {
      // first path segment of servicePath is the legacy gcs bucket name -
      // silver derivative products are addressed relative to the item's
      // own resolved CaskFS directory instead.
      let assetPath = servicePath.replace(/^\/[a-zA-Z0-9-]+/, '');
      return proxyToCask(req, res, dirname(sidecarToBinaryPath(resolvedPath)) + assetPath);
    }

    // plain resource stream: metadata document or binary, forwarded as-is
    return proxyToCask(req, res, resolvedPath);

  } catch(e) {
    logger.error('fcrepo-middleware error', e);
    if( !res.headersSent ) res.status(502).json({ error: true, message: 'Upstream request failed' });
  }
}

module.exports = middleware;
module.exports.proxy = fcrepo;
module.exports.parseFcrepoUrl = parseFcrepoUrl;
