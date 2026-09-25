const client = require('./es-client.js');
const EsDataModel = require('./es-model.js');
const { logger } = require('./logger.js');

/**
 * @description determine whether an error from the ES client is the
 * "resource_already_exists_exception" thrown when another process wins a
 * race to create the same index.
 *
 * @param {Error} e error thrown by the elasticsearch client
 *
 * @returns {Boolean}
 */
function isResourceAlreadyExists(e) {
  return e?.meta?.body?.error?.type === 'resource_already_exists_exception'
      || e?.body?.error?.type === 'resource_already_exists_exception';
}

/**
 * @description find every model in the given registry that is ES-backed
 * (extends EsDataModel), so callers don't need to hardcode model names.
 *
 * @param {Object} modelsRegistry models/index.js registry, keyed by model name
 *
 * @returns {Array} EsDataModel instances
 */
function getEsModels(modelsRegistry) {
  return Object.values(modelsRegistry)
    .filter(entry => entry && entry.model instanceof EsDataModel)
    .map(entry => entry.model);
}

/**
 * @description ensure a single model's `<name>-read` and `<name>-write`
 * aliases exist and point at a real index, creating or repairing as needed:
 * - both exist: no-op
 * - neither exists: create a new index via model.getDefaultIndexConfig()
 *   and point both aliases at it
 * - only one exists: add the missing alias to whatever index the existing
 *   alias already points at
 *
 * @param {EsDataModel} model
 *
 * @returns {Promise}
 */
async function ensureModelIndices(model) {
  const modelName = model.modelName;
  const readAlias = model.readIndexAlias;
  const writeAlias = model.writeIndexAlias;

  const [readExists, writeExists] = await Promise.all([
    client.indices.existsAlias({ name: readAlias }),
    client.indices.existsAlias({ name: writeAlias })
  ]);

  if( readExists && writeExists ) {
    logger.info(`[es-index-init] ${modelName}: aliases already exist, skipping`);
    return;
  }

  if( !readExists && !writeExists ) {
    if( !model.schema ) {
      throw new Error(`[es-index-init] model '${modelName}' has no schema; cannot create default index`);
    }

    const indexConfig = model.getDefaultIndexConfig();

    try {
      await client.indices.create(indexConfig);
    } catch(e) {
      if( !isResourceAlreadyExists(e) ) throw e;
      logger.warn(`[es-index-init] ${modelName}: index '${indexConfig.index}' already existed on create, continuing`);
    }

    await client.indices.updateAliases({
      body: { actions: [
        { add: { index: indexConfig.index, alias: readAlias } },
        { add: { index: indexConfig.index, alias: writeAlias } }
      ]}
    });

    logger.info(`[es-index-init] ${modelName}: created index '${indexConfig.index}', pointed '${readAlias}' + '${writeAlias}' at it`);
    return;
  }

  // partial state - repair the missing alias onto the existing alias's index
  const existingAliasName = readExists ? readAlias : writeAlias;
  const missingAliasName = readExists ? writeAlias : readAlias;

  const aliasInfo = await client.indices.getAlias({ name: existingAliasName });
  const targetIndices = Object.keys(aliasInfo);

  if( targetIndices.length !== 1 ) {
    logger.warn(`[es-index-init] ${modelName}: alias '${existingAliasName}' points at multiple indices (${targetIndices.join(', ')}); repairing onto all of them`);
  }

  await client.indices.putAlias({ index: targetIndices, name: missingAliasName });
  logger.warn(`[es-index-init] ${modelName}: repaired missing alias '${missingAliasName}' -> '${targetIndices.join(', ')}'`);
}

/**
 * @description ensure every ES-backed model in the given registry has
 * working read/write aliases, creating or repairing indices as needed.
 * Intended to run once at app startup, before any route that queries ES
 * is mounted. Errors propagate to the caller - this app should fail to
 * start rather than serve traffic against a broken ES index/alias state.
 *
 * @param {Object} modelsRegistry defaults to the app's real models/index.js registry
 *
 * @returns {Promise}
 */
async function ensureEsIndices(modelsRegistry = require('../models/index.js')) {
  const esModels = getEsModels(modelsRegistry);
  logger.info(`[es-index-init] checking aliases for ${esModels.length} model(s): ${esModels.map(m => m.modelName).join(', ')}`);

  for( const model of esModels ) {
    await ensureModelIndices(model);
  }

  logger.info('[es-index-init] ES index/alias bootstrap complete');
}

module.exports = ensureEsIndices;
