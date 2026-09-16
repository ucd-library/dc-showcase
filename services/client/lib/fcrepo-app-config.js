/**
 * @description Stand-in for the old fcrepo-crawling AppConfig (which
 * walked /application/ucd-lib-client in fcrepo via @ucd-lib/fin-api and
 * refreshed on RabbitMQ change events). That data now lives in Postgres,
 * served by the app-config model/API - see docs/PORT-PLAN.md Phase 6.
 * This stub keeps controllers/static.js's `appConfig.config`/`reload()`
 * interface working with an empty config until that lands.
 */
class AppConfig {
  constructor() {
    this.config = {};
  }

  async reload() {}
}

module.exports = new AppConfig();
