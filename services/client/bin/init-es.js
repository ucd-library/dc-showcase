const client = require('../lib/es-client.js');
const { ensureEsIndices } = require('../lib/es-index-init.js');
const { logger } = require('../lib/logger.js');

/**
 * @description Create this app's ES indices and their <model>-read /
 * <model>-write aliases for every ES-backed model, if they don't exist.
 * Run once from the init Job (see bin/prod-init.sh) rather than at app
 * startup, so multiple app replicas can't each create an index. Existing
 * aliases are left alone, so this is safe to rerun.
 *
 * @param {Object} opts
 * @param {Object} [opts.modelsRegistry] models registry, defaults to models/index.js
 *
 * @returns {Promise}
 */
async function initEs(opts={}) {
  return ensureEsIndices(opts.modelsRegistry);
}

if( require.main === module ) {
  initEs()
    .then(() => logger.info('ES indices initialized'))
    .catch(e => {
      logger.error('Error initializing ES indices', e);
      process.exitCode = 1;
    })
    .finally(() => client.close());
}

module.exports = initEs;
