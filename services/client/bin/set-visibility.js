/**
 * Set a collection's public/private visibility from the command line, the same
 * way the admin API does (PUT /api/app-config/collection/<id>, see
 * models/app-config/api.js): save dcf_edits.collection_edit.visibility (which
 * argonath reads when it indexes later imports) and, if it changed, update
 * the roles on the collection's collection, item and page-search documents
 * (lib/collection-roles.js).
 *
 * For operators and the e2e suite (dc-showcase-deployment/e2e), which run it
 * inside the client container, where no Keycloak login is needed:
 *
 *   node bin/set-visibility.js <collection id or URI> <public|private> [--user <name>]
 *
 * Prints the saved edit row and the roles update as JSON.
 */
const pg = require('../lib/pg.js');
const model = require('../models/app-config/model.js');
const collectionRoles = require('../lib/collection-roles.js');
const { logger } = require('../lib/logger.js');

const VISIBILITY = ['public', 'private'];

/**
 * @method setVisibility
 * @description Save a collection's visibility and, when it changed, update its documents' roles.
 *
 * @param {String} id collection path or URI, e.g. /collection/ark:/... or https://.../collection/ark:/...
 * @param {String} visibility 'public' or 'private'
 * @param {Object} opts {user: String} recorded as updated_by
 *
 * @returns {Promise<Object>} {previous: String, saved: Object, roles: Object|null}
 */
async function setVisibility(id, visibility, opts={}) {
  if( !VISIBILITY.includes(visibility) ) {
    throw new Error(`visibility must be one of ${VISIBILITY.join(', ')}, got '${visibility}'`);
  }
  let previous = (await model.getCollectionEdits(id)).collection.visibility || 'private';
  let saved = await model.saveCollectionEdit(id, {visibility}, {user: opts.user || 'cli'});

  let roles = null;
  if( saved.visibility !== previous ) {
    roles = await collectionRoles.set(id, saved.visibility);
    logger.info(`${id}: visibility ${previous} -> ${saved.visibility}`, roles);
  }
  return {previous, saved, roles};
}

if( require.main === module ) {
  let args = process.argv.slice(2);
  let userIndex = args.indexOf('--user');
  let user = userIndex >= 0 ? args.splice(userIndex, 2)[1] : undefined;
  let [id, visibility] = args;

  if( !id || !visibility ) {
    console.error('usage: node bin/set-visibility.js <collection id or URI> <public|private> [--user <name>]');
    process.exit(2);
  }

  setVisibility(id, visibility, {user})
    .then(result => console.log(JSON.stringify(result)))
    .catch(e => {
      logger.error('Error setting visibility', e);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pg.end();
      // the ES client keeps sockets open
      process.exit();
    });
}

module.exports = setVisibility;
