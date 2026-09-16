import fetch from 'node-fetch';
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
   * @method authHeaders
   * @description Builds the header caskfs's header-auth middleware expects
   * when CASKFS_HEADER_AUTH_ENABLED=true (CASKFS_HEADER_AUTH_HEADER, set to
   * x-anduin-user in argonath-deployment's compose) - mirrors
   * digtk.lib.fs.cask.CaskBackend's trusted-user convention on the Python
   * side. Returns {} (anonymous) if CASKFS_USER isn't set.
   *
   * @returns {Object}
   */
  authHeaders() {
    if( !config.caskfs.user ) return {};
    return { 'x-anduin-user': JSON.stringify({ username: config.caskfs.user }) };
  }

  /**
   * @method getFileMetadata
   * @description Gets the metadata for a caskfs file (GET /api/fs/{path}?metadata=true).
   *
   * @param {String} filePath caskfs-absolute path to the file
   * @returns {Promise<Object>} the file's metadata (includes hash_value)
   */
  async getFileMetadata(filePath) {
    let resp = await fetch(`${config.caskfs.url}/api/fs${filePath}?metadata=true`, { headers: this.authHeaders() });
    if( !resp.ok ) {
      throw new Error(`caskfs /api/fs failed for filePath=${filePath}: ${resp.status} ${resp.statusText}`);
    }

    return await resp.json();
  }

  /**
   * @method casRelativePath
   * @description Build the CAS-relative path for a file's content hash,
   * mirroring caskfs's own cas.js sharding convention
   * (hash[0:3]/hash[3:6]/hash) and dc-showcase's own
   * services/client/lib/cask.js's identical helper. This is what the IIIF
   * service's own direct mount of caskfs's CAS root resolves against (see
   * services/iipimage/lighttpd.conf's FILESYSTEM_PREFIX).
   *
   * @param {String} hash CAS hash value (metadata.hash_value)
   * @returns {String}
   */
  casRelativePath(hash) {
    return `/cas/${hash.slice(0, 3)}/${hash.slice(3, 6)}/${hash}`;
  }

}

const inst = new CaskClient();
export default inst;
