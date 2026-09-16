const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { logger, logReqMiddleware } = require('./lib/logger');
const keycloak = require('./lib/keycloak');
const config = require('./config');

// create express instance
const app = express();

// parse cookies and add compression
app.use(cookieParser());
app.use(compression());

// http request logging
app.use(logReqMiddleware(logger));

// parse application/x-www-form-urlencoded req body
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json req body
app.use(bodyParser.json());

app.use(keycloak.setUser);

app.get('/health', (req, res) => res.status(200).send('ok'));

async function main() {
  /**
   * mount data model APIs at /api/<name> (single process - see
   * docs/PORT-PLAN.md Phase 0)
   */
  await require('./controllers/api').mount(app);

  /**
   * setup ark/doi proxy
   */
  require('./controllers/identifier')(app);

  /**
   * setup sitemap
   */
  require('./controllers/sitemap').middleware(app);

  /**
   * fcrepo-middleware shim: resolves legacy /fcrepo/rest/... URLs against
   * CaskFS - see docs/PORT-PLAN.md Phase 2
   */
  app.use(require('./lib/fcrepo-middeware.js'));

  /**
   * setup static routes
   */
  await require('./controllers/static')(app);

  app.listen(8000, () => {
    logger.info('server ready on port 8000, using: '+config.client.assets);
  });
}

main().catch(e => {
  logger.fatal('Failed to start server', e);
  process.exit(1);
});
