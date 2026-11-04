const { Pool } = require('pg');
const config = require('../config.js');
const { logger } = require('./logger.js');

class PG {

  _initClient() {
    if( this.client ) return;

    this.client = new Pool({
      host: config.pg.host,
      user: config.pg.user,
      password: config.pg.password,
      port: config.pg.port,
      database: config.pg.database,
      options: '--search_path=' + config.pg.searchPath.join(','),
      max: 3
    });

    this.client.on('error', e => logger.error('Postgresql pool error event', e));
  }

  async query(query, params) {
    this._initClient();
    return this.client.query(query, params);
  }

  /**
   * @method end
   * @description Close the pool, so one-off scripts can exit.
   *
   * @returns {Promise}
   */
  async end() {
    if( !this.client ) return;
    await this.client.end();
    this.client = null;
  }

}

module.exports = new PG();
