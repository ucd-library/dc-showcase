const client = require('./es-client.js');
const config = require('../config.js');
const { logger } = require('./logger.js');
const collectionModel = require('../models/collection/model.js');

// sets itemCount on the collection's root node
const UPDATE_SCRIPT = `
for (def node : ctx._source['@graph']) {
  if (node['@id'] == params.id) {
    node.itemCount = params.count;
  }
}`;

/**
 * @class ItemCountCron
 * @description Keeps each collection document's itemCount in sync with the
 * number of items whose isPartOf points at it. Argonath sets the count when
 * it indexes a collection; this catches items added or removed afterwards.
 */
class ItemCountCron {

  constructor() {
    this.timer = null;
    this.running = false;
  }

  /**
   * @method start
   * @description run once now, then on an interval. No-op if disabled or
   * already started.
   *
   * @param {Object} opts
   * @param {Number} opts.interval ms between runs, defaults to config.itemCountCron.interval
   * @param {Boolean} opts.enabled defaults to config.itemCountCron.enabled
   *
   * @returns {Boolean} true if the cron was started
   */
  start(opts={}) {
    let enabled = opts.enabled ?? config.itemCountCron.enabled;
    let interval = opts.interval || config.itemCountCron.interval;
    if( !enabled || this.timer ) return false;

    logger.info(`[item-count-cron] starting, every ${interval}ms`);
    this.run();
    this.timer = setInterval(() => this.run(), interval);
    return true;
  }

  /**
   * @method stop
   * @description stop the interval.
   */
  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * @method run
   * @description check every collection's itemCount and update the ones
   * that changed. Skips if a previous run is still going.
   *
   * @returns {Promise<Object|null>} {checked, updated, failed}, or null if skipped
   */
  async run() {
    if( this.running ) return null;
    this.running = true;

    let summary = {checked: 0, updated: 0, failed: 0};
    try {
      let hits = await this.getCollections();
      for( let hit of hits ) {
        summary.checked++;
        try {
          if( await this.syncCollection(hit) ) summary.updated++;
        } catch(e) {
          summary.failed++;
          logger.warn(`[item-count-cron] ${hit._source?.['@id']}: update failed`, e.message);
        }
      }
      if( summary.updated || summary.failed ) {
        logger.info('[item-count-cron] run complete', summary);
      }
    } catch(e) {
      logger.error('[item-count-cron] run failed', e.message);
    } finally {
      this.running = false;
    }
    return summary;
  }

  /**
   * @method getCollections
   * @description every collection document, with just the fields needed to
   * compare counts. Uses the ES client directly to skip the roles filter.
   *
   * @returns {Promise<Array>} ES hits, with _id and _source
   */
  async getCollections() {
    let result = await client.search({
      index: collectionModel.readIndexAlias,
      size: 10000,
      _source_includes: ['@id', '@graph.@id', '@graph.itemCount'],
      query: {match_all: {}}
    });
    return result.hits.hits;
  }

  /**
   * @method syncCollection
   * @description count a collection's items and update its itemCount if
   * the stored value differs.
   *
   * @param {Object} hit ES hit from getCollections()
   *
   * @returns {Promise<Boolean>} true if the document was updated
   */
  async syncCollection(hit) {
    let id = hit._source['@id'];
    let root = (hit._source['@graph'] || []).find(node => node['@id'] === id) || {};
    let count = await collectionModel.getItemCount(id);
    if( root.itemCount === count ) return false;

    await client.update({
      index: collectionModel.writeIndexAlias,
      id: hit._id,
      script: {source: UPDATE_SCRIPT, params: {id, count}}
    });
    logger.info(`[item-count-cron] ${id}: itemCount ${root.itemCount} -> ${count}`);
    return true;
  }
}

module.exports = new ItemCountCron();
