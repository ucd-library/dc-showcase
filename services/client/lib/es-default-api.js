const { Router } = require('express');
const { logger } = require('./logger.js');
const config = require('../config.js');

/**
 * @description express middleware setting req.esRoles from the current
 * user, for read-side role filtering in ES queries. Replaces
 * @ucd-lib/fin-service-utils's fin-ac/middleware.js `esRoles`.
 *
 * NOTE: this only reflects the requesting user's own roles/username plus
 * the public role - it does not resolve per-collection WebAC/FinAC grants
 * (that system doesn't exist anymore without fcrepo). Real ACL support is
 * a known follow-up - see docs/PORT-PLAN.md.
 */
function esRoles(req, res, next) {
  let user = req.user;
  let access = new Set([config.finac.agents.public]);

  if( user ) {
    if( user.username ) access.add(user.username);
    if( user.preferred_username ) access.add(user.preferred_username);
    (user.roles || []).forEach(role => access.add(role));
  }

  req.esRoles = Array.from(access);
  next();
}

/**
 * @description build a default read-only router for an EsDataModel:
 * GET / -> model.all(), POST / -> model.search(), GET /* -> model.get(id)
 *
 * @param {EsDataModel} model
 * @param {Object} opts
 * @param {Router} opts.router mount onto an existing router instead of a new one
 */
function createDefaultApi(model, opts={}) {
  let router = opts.router || Router();

  router.post('/', esRoles, async (req, res) => {
    if( !req.body ) return res.json({error: true, message: 'no body sent'});

    try {
      res.json(await model.search(req.body, {
        debug: req.query.debug,
        compact: req.query.compact ? true : false,
        singleNode: req.query['single-node'] ? true : false,
        roles: req.esRoles
      }));
    } catch(e) {
      res.json(errorResponse(e, 'Error with search query'));
    }
  });

  router.get('/*', esRoles, async (req, res) => {
    try {
      let id = '/'+model.id+decodeURIComponent(req.path);

      let opts = {
        admin: req.query.admin ? true : false,
        compact: req.query.compact ? true : false,
        singleNode: req.query['single-node'] ? true : false,
        roles: req.esRoles
      }

      res.json(await model.get(id, opts));
    } catch(e) {
      res.json(errorResponse(e, 'Error with '+model.id+' retrieval'));
    }
  });

  return router;
}

function errorResponse(e, message) {
  logger.error(e);
  return { error: true, message, details: { message: e.message, stack: e.stack } };
}

module.exports = createDefaultApi;
module.exports.esRoles = esRoles;
