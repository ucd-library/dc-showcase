const fs = require('fs');
const path = require('path');
const pg = require('../lib/pg.js');
const { logger } = require('../lib/logger.js');

const INIT_DIR = path.join(__dirname, '..', 'init', 'postgres');

/**
 * @description Apply this app's init SQL files to its database, in
 * filename order. The files are idempotent, so this is safe to rerun.
 *
 * @param {Object} opts
 * @param {String} [opts.initDir] directory of .sql files, defaults to init/postgres
 *
 * @returns {Promise<Array>} applied file names
 */
async function initDb(opts={}) {
  let initDir = opts.initDir || INIT_DIR;
  let files = fs.readdirSync(initDir).filter(f => f.endsWith('.sql')).sort();
  if( !files.length ) throw new Error(`No .sql files in ${initDir}`);

  for( let file of files ) {
    await pg.query(fs.readFileSync(path.join(initDir, file), 'utf-8'));
    logger.info(`Applied ${file}`);
  }
  return files;
}

if( require.main === module ) {
  initDb()
    .then(files => logger.info(`Applied ${files.length} init file(s)`))
    .catch(e => {
      logger.error('Error applying init SQL', e);
      process.exitCode = 1;
    })
    .finally(() => pg.end());
}

module.exports = initDb;
