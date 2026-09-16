const config = require('../config.js');
const { logger } = require('./logger.js');

/**
 * @class CaskClient
 * @description Thin HTTP client for the CaskFS service this app's
 * fcrepo-middleware shim resolves against (see docs/PORT-PLAN.md Phase 2).
 * CaskFS's ACL is username-keyed (config.cask.user), not Keycloak-role-keyed
 * - see docs/PORT-PLAN.md Phase 1 and dams-deployment/cmds/provision-cask-dev-access.sh
 * for the full explanation - so every request presents the same fixed
 * `x-user` identity regardless of the calling browser session.
 *
 * Identifier-to-path resolution: CaskFS paths are not derived from an
 * item's identifier (see argonath's docs/cask-conventions.md "Item
 * Identity") - the identifier only exists as RDF data (a file's JSON-LD
 * sidecar `@id` property). This app deliberately treats that identifier as
 * an **opaque string** throughout - confirmed 2026-09-10 with the user that
 * real identifiers won't all be ARKs (a custom library box/folder ID
 * scheme is also in play, minted alongside ARKs in Dagster) - nothing here
 * parses or assumes any particular identifier shape. `resolvePath()` uses
 * CaskFS's `/api/find?subject=` RDF-graph lookup (already implemented
 * server-side, unlike `/api/ld` which still 404s) to go from that
 * identifier to the file that carries it as its RDF subject. This is a
 * working assumption pending confirmation with whoever owns the argonath
 * ingestion pipeline (see docs/PORT-PLAN.md's "Critical discovery"): it
 * assumes ingestion mints an RDF subject equal to the full fcrepo-style
 * path this app is resolving (an item's own identifier, or identifier plus
 * a child-binary path), not just the bare item identifier - see
 * docs/PORT-PLAN.md Phase 2 for why that second part is still an open
 * question, separate from the identifier-shape question this comment
 * covers.
 */
class CaskClient {

  constructor() {
    this.baseUrl = `${config.cask.url}${config.cask.pathPrefix}`;
  }

  /**
   * @method headers
   * @description Build the `x-user` header CaskFS's header-auth middleware
   * expects, presenting this server's fixed CaskFS identity.
   *
   * @returns {Object}
   */
  headers() {
    return { 'x-user': JSON.stringify({ username: config.cask.user }) };
  }

  /**
   * @method find
   * @description Query CaskFS's RDF graph for files matching the given
   * criteria (see CaskFS's `GET /api/find`).
   *
   * @param {Object} opts
   * @param {String} [opts.subject] subject URI to filter by
   * @param {Number} [opts.limit] max results to return
   *
   * @returns {Promise<Object>} `{totalCount, results}`
   */
  async find(opts={}) {
    let query = new URLSearchParams();
    if( opts.subject ) query.set('subject', opts.subject);
    if( opts.limit ) query.set('limit', String(opts.limit));

    let resp = await fetch(`${this.baseUrl}/api/find?${query}`, { headers: this.headers() });
    if( !resp.ok ) {
      throw new Error(`CaskFS find failed (${resp.status}): ${await resp.text()}`);
    }
    return resp.json();
  }

  /**
   * @method resolvePath
   * @description Resolve an RDF subject URI (an opaque identifier - an ARK,
   * a box/folder ID, or that plus a child-binary path segment; see class
   * doc) to the CaskFS file path that carries it.
   *
   * @param {String} subject
   *
   * @returns {Promise<String|null>} the resolved file path, or null if no
   * file carries this subject
   */
  async resolvePath(subject) {
    let { results } = await this.find({ subject, limit: 1 });
    return results?.[0]?.filepath || null;
  }

  /**
   * @method getMetadata
   * @description Fetch CaskFS file metadata (`GET /api/fs/{path}?metadata=true`),
   * including `hash_value`, the CAS hash the IIIF direct-mount proxy target
   * needs (see `casRelativePath()`).
   *
   * @param {String} filePath CaskFS file path (as returned by `resolvePath()`)
   *
   * @returns {Promise<Object>}
   */
  async getMetadata(filePath) {
    let resp = await fetch(`${this.baseUrl}/api/fs${filePath}?metadata=true`, { headers: this.headers() });
    if( !resp.ok ) {
      throw new Error(`CaskFS metadata fetch failed (${resp.status}): ${await resp.text()}`);
    }
    return resp.json();
  }

  /**
   * @method casRelativePath
   * @description Build the path a binary's content-addressed hash resolves
   * to, relative to CaskFS's own CAS root - mirroring CaskFS's own
   * `cas.js#_getHashFilePath()` sharding convention (`<hash[0:3]>/<hash[3:6]>/<hash>`)
   * exactly. Deliberately computed from `hash_value` rather than read off
   * `getMetadata()`'s `fullPath`: `fullPath` is CaskFS's own absolute view
   * of its own CAS root (`CASKFS_ROOT_DIR` on the CaskFS server), which is
   * mounted at a different path in the IIIF service's own container (its
   * `lighttpd.conf` hardcodes `/etc/gcs-fuse` - see docs/PORT-PLAN.md
   * Phase 2), so `fullPath` isn't usable across that boundary - this
   * relative path is what the IIIF service's own direct mount of CaskFS's
   * CAS root needs instead, whichever way that mount is backed (there is no
   * GCS anywhere in this architecture - see docs/PORT-PLAN.md's "No GCS
   * anywhere in the new architecture" note - this is a plain shared-volume
   * mount, not a cloud-storage-mode concern).
   *
   * @param {String} hash CAS hash value (`metadata.hash_value`)
   *
   * @returns {String}
   */
  casRelativePath(hash) {
    return `/cas/${hash.slice(0, 3)}/${hash.slice(3, 6)}/${hash}`;
  }

  /**
   * @method fileUrl
   * @description Build the CaskFS URL for streaming a file's content
   * (`GET /api/fs/{path}`), for proxying non-IIIF binary/metadata reads.
   *
   * @param {String} filePath CaskFS file path
   *
   * @returns {String}
   */
  fileUrl(filePath) {
    return `${this.baseUrl}/api/fs${filePath}`;
  }

}

module.exports = new CaskClient();
