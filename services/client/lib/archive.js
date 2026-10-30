const path = require('path');
const { Readable } = require('stream');
const archiver = require('archiver');
const cask = require('./cask.js');
const { logger } = require('./logger.js');

// servable CaskFS url prefix the gateway proxies
const CASK_API_PREFIX = '/cask/api/fs/';

/**
 * @function caskPaths
 * @description Convert servable CaskFS urls (as found in an item's clientMedia
 * downloads) to CaskFS file paths. Only urls under /cask/api/fs/ are allowed.
 *
 * @param {Array|String} urls urls, or one comma-separated string of them
 *
 * @returns {Array} CaskFS-absolute file paths
 */
function caskPaths(urls=[]) {
  if( !Array.isArray(urls) ) urls = String(urls).split(',');

  return urls.map(u => u.trim()).filter(Boolean).map(url => {
    let pathname = decodeURIComponent(url.split('?')[0]);
    if( !pathname.startsWith(CASK_API_PREFIX) ) {
      throw new Error(`Not an archivable path: ${url}`);
    }
    let filePath = '/' + pathname.slice(CASK_API_PREFIX.length);
    if( filePath.split('/').some(s => s === '..' || s === '.') ) {
      throw new Error(`Not an archivable path: ${url}`);
    }
    return path.posix.normalize(filePath);
  });
}

/**
 * @function entryNames
 * @description Flat zip entry name for each file: its file name, with a
 * numeric suffix when a name repeats.
 *
 * @param {Array} filePaths CaskFS-absolute file paths
 *
 * @returns {Array} entry names, in the same order
 */
function entryNames(filePaths=[]) {
  let used = new Set();
  return filePaths.map(p => {
    let name = path.posix.basename(p);
    let { name: stem, ext } = path.posix.parse(name);
    for( let i = 2; used.has(name); i++ ) name = `${stem}-${i}${ext}`;
    used.add(name);
    return name;
  });
}

/**
 * @function zipName
 * @description Safe zip file name from a requested name.
 *
 * @param {String} name requested name
 *
 * @returns {String} name with a .zip extension
 */
function zipName(name) {
  let safe = String(name || '').replace(/\.zip$/i, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  return (safe || 'archive') + '.zip';
}

/**
 * @function streamArchive
 * @description Stream CaskFS files to an express response as a zip. Files
 * are fetched one at a time and stored uncompressed.
 *
 * @param {Object} res express response
 * @param {Array|String} urls servable CaskFS urls (see caskPaths())
 * @param {Object} opts
 * @param {String} opts.name zip file name
 *
 * @returns {Promise}
 */
async function streamArchive(res, urls, opts={}) {
  let filePaths;
  try {
    filePaths = caskPaths(urls);
  } catch(e) {
    return res.status(400).json({ error: true, message: e.message });
  }
  if( !filePaths.length ) {
    return res.status(400).json({ error: true, message: 'No paths given' });
  }

  let names = entryNames(filePaths);
  let zip = archiver('zip', { store: true });
  zip.on('warning', e => logger.warn('Archive warning', e));
  zip.on('error', e => {
    logger.error('Archive error', e);
    res.destroy(e);
  });

  for( let i = 0; i < filePaths.length; i++ ) {
    let resp = await fetch(cask.fileUrl(filePaths[i]), { headers: cask.headers() });
    if( !resp.ok ) {
      logger.error(`Archive file fetch failed (${resp.status}): ${filePaths[i]}`);
      // nothing sent yet, so report it
      if( !res.headersSent ) {
        return res.status(resp.status === 404 ? 404 : 502).json({ error: true, message: `Unable to read ${names[i]}` });
      }
      zip.abort();
      return res.destroy();
    }

    if( !res.headersSent ) {
      res.set('Content-Type', 'application/zip');
      res.attachment(zipName(opts.name));
      zip.pipe(res);
    }

    // wait for the entry before the next fetch
    await new Promise((resolve, reject) => {
      let onEntry = () => { zip.off('error', onError); resolve(); };
      let onError = e => { zip.off('entry', onEntry); reject(e); };
      zip.once('entry', onEntry);
      zip.once('error', onError);
      zip.append(Readable.fromWeb(resp.body), { name: names[i] });
    });
  }

  await zip.finalize();
}

module.exports = { caskPaths, entryNames, zipName, streamArchive };
