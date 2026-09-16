import fetch from 'node-fetch';
import path from 'path';
import config from './config.js';

/**
 * @class CaskClient
 * @description Thin wrapper around the caskfs HTTP API this adapter needs
 * (see caskfs repo docs/fs-rest-api.md and docs/ld-rest-api.md). Mirrors the
 * request shapes argonath's own Python client (exec/digtk/lib/fs/cask.py)
 * already uses, so ark resolution behaves the same way here as it does inside
 * argonath's ingest/derivative pipeline.
 */
class CaskClient {

  /**
   * @method getFileMetadata
   * @description Gets the metadata for a caskfs file.
   *
   * @param {String} filePath caskfs-absolute path to the file
   * @returns {Promise<Object>} the file's metadata
   */
  async getFileMetadata(filePath) {
    let resp = await fetch(`${config.caskfs.url}/fs/${filePath}`, { headers: this.authHeaders() });
    if( !resp.ok ) {
      throw new Error(`caskfs /fs failed for filePath=${filePath}: ${resp.status} ${resp.statusText}`);
    }

    return await resp.json();
  }

}

const inst = new CaskClient();
export default inst;
