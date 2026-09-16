module.exports = {
  api : require('./api.js'),
  model : require('./model.js'),
  schema : require('./schema.json'),
  swagger : 'swagger.yaml'
}
// transform.js is not required here - it's no longer invoked (fin's dbsync
// used to call it on write; argonath owns indexing going forward, see
// docs/PORT-PLAN.md Phase 3) but is kept as the reference ES-envelope shape
// argonath's own transform is being written to match.