module.exports = {
  model : require('./model.js'),
  schema : require('./schema.json'),
  api : require('./api.js'),
  swagger : 'swagger.yaml'
}
// transform.js not required here - see models/item/index.js comment