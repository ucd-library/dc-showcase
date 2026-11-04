const fs = require('fs');
const path = require('path');
const config = require('../config.js');
const cask = require('../lib/cask.js');
const { logger } = require('../lib/logger.js');

const INIT_DIR = path.join(__dirname, '..', 'init', 'caskfs');

const MIME_TYPES = {
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png'
};

/**
 * @description List every non-dot file under a directory, recursively.
 *
 * @param {String} dir directory to walk
 *
 * @returns {Array} file paths relative to dir, sorted
 */
function listFiles(dir) {
  return fs.readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && !entry.name.startsWith('.'))
    .map(entry => path.relative(dir, path.join(entry.parentPath, entry.name)))
    .sort();
}

/**
 * @description Copy this app's seed files (hero banner, browse by) into its
 * CaskFS gold project. Files already in CaskFS are skipped, so later edits
 * are kept and this is safe to rerun.
 *
 * @param {Object} opts
 * @param {String} [opts.initDir] seed file directory, defaults to init/caskfs
 * @param {String} [opts.goldBasePath] gold project path, defaults to config.cask.goldBasePath
 *
 * @returns {Promise<Object>} {added: [cask paths], skipped: [cask paths]}
 */
async function initCask(opts={}) {
  let initDir = opts.initDir || INIT_DIR;
  let goldBasePath = opts.goldBasePath || config.cask.goldBasePath;
  let files = listFiles(initDir);
  if( !files.length ) throw new Error(`No files in ${initDir}`);

  let result = { added: [], skipped: [] };
  for( let file of files ) {
    let dest = `${goldBasePath}/${file.split(path.sep).join('/')}`;
    if( await cask.exists(dest) ) {
      result.skipped.push(dest);
      continue;
    }

    let mimeType = MIME_TYPES[path.extname(file).toLowerCase()];
    await cask.write(dest, fs.readFileSync(path.join(initDir, file)), { mimeType });
    result.added.push(dest);
  }
  return result;
}

if( require.main === module ) {
  initCask()
    .then(r => logger.info(`Added ${r.added.length} file(s), skipped ${r.skipped.length} existing`))
    .catch(e => {
      logger.error('Error seeding CaskFS gold files', e);
      process.exitCode = 1;
    });
}

module.exports = initCask;
