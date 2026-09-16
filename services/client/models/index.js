/**
 * @description Registry of this app's data models, loaded by
 * `controllers/models.js` (`FinModelLoader`) via `config.models.rootDir`
 * resolving to this directory. Each entry follows the `{api, model, schema,
 * swagger}` contract that loader expects (`swagger`/`schema` are optional —
 * a model with no `api` is loaded but never mounted as a route).
 */
module.exports = {
  item : require('./item'),
  collection : require('./collection'),
  'client-edits' : require('./client-edits'),
  'page-search' : require('./page-search'),
  seo : require('./seo'),
  application : require('./application')
}
