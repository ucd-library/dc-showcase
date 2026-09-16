/**
 * @description Mounts this app's data model APIs (see models/index.js) at
 * /api/<name> on the main app, and serves a merged OpenAPI/swagger doc at
 * /api. Single-process replacement for what fin's separate
 * services/fin/api microservice does today - see docs/PORT-PLAN.md Phase 0.
 */
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const { logger } = require('../lib/logger');
const models = require('./models.js');
const swaggerParameters = require('../lib/swagger/parameters.json');
const swaggerSchemas = require('../lib/swagger/schemas.json');
const swaggerResponses = require('../lib/swagger/responses.json');
const swaggerRequestBodies = require('../lib/swagger/requestBodies.json');

const swaggerDefinition = {
  openapi: '3.0.0',
  "info": {
    "title": "Digital Collections API",
    "version": "1.0",
    "description": "Allows for the retrieval of UC Davis Library Digital Collections item, collection, and search data.",
    "contact": {
      "email": "digital@ucdavis.edu"
    },
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    }
  },
  "servers": [
    {
      "url": "https://digital.ucdavis.edu/api"
    }
  ],
  "tags": [
    {
      "name": "digital-collections",
      "description": "Digital Collections Information"
    },
  ],
  components: {
    parameters: swaggerParameters,
    schemas: swaggerSchemas,
    responses: swaggerResponses,
    requestBodies: swaggerRequestBodies
  },
  paths: {}
};

async function mount(app) {
  let apis = [];
  let names = await models.names();
  logger.info(`Found ${names.length} API(s)`, { names });

  let apiRouter = require('express').Router();

  for( let name of names ) {
    let {api, swagger} = await models.get(name);
    if( !api ) continue;

    try {
      if( swagger?.paths ) {
        if( !Array.isArray(swagger.paths) ) {
          swagger.paths = Object.entries(swagger.paths).map(([key, value]) => ({ path : key, docs : value }));
        }
        swagger.paths.forEach(doc => {
          let docs = Object.fromEntries(
            Object.entries(doc.docs).map(([method, operation]) => {
              if( !operation ) return [method, operation];
              return [method, {...operation, tags: ['digital-collections']}];
            })
          );
          swaggerDefinition.paths[`/api/${doc.path.replace(/\/?api\/?/g, '')}`] = docs;
        });
      }
      apis.push('api/'+name);
    } catch (e) {
      logger.error('Error loading swagger for '+name, e);
    }

    logger.info(`Registering api routes for ${name} at /api/${name}`);
    apiRouter.use('/'+name, bodyParser.json(), api);
  }

  const swaggerSpec = swaggerJSDoc({ swaggerDefinition, apis });

  apiRouter.get('/', (req, res) => {
    res.json(req.user ? swaggerSpec : filterPrivateOps(swaggerSpec));
  });

  app.use('/api', apiRouter);
}

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'];

function collectRefs(obj, refs = new Set()) {
  if (!obj || typeof obj !== 'object') return refs;
  if (Array.isArray(obj)) {
    obj.forEach(item => collectRefs(item, refs));
    return refs;
  }
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string') {
      refs.add(value);
    } else {
      collectRefs(value, refs);
    }
  }
  return refs;
}

function filterPrivateOps(spec) {
  const clone = JSON.parse(JSON.stringify(spec));

  for (const [path, pathItem] of Object.entries(clone.paths || {})) {
    for (const method of HTTP_METHODS) {
      if (pathItem[method]?.['x-private']) {
        delete pathItem[method];
      }
    }
    const hasOps = HTTP_METHODS.some(m => pathItem[m]);
    if (!hasOps) {
      delete clone.paths[path];
    }
  }

  const pathRefs = collectRefs(clone.paths);
  const firstPassTypes = ['parameters', 'responses', 'requestBodies'];
  for (const type of firstPassTypes) {
    if (!clone.components?.[type]) continue;
    for (const key of Object.keys(clone.components[type])) {
      if (!pathRefs.has(`#/components/${type}/${key}`)) {
        delete clone.components[type][key];
      }
    }
  }

  const componentRefs = collectRefs(clone.components);
  if (clone.components?.schemas) {
    for (const key of Object.keys(clone.components.schemas)) {
      if (!componentRefs.has(`#/components/schemas/${key}`)) {
        delete clone.components.schemas[key];
      }
    }
  }

  return clone;
}

module.exports = { mount };
