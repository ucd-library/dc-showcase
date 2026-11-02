const config = require('../config.js');

// path form: /<type>/ark:/<naan>/<name>[/<fragment>]
const PATH_RE = /^\/(item|collection)\/(ark:\/[^/]+\/[^/#]+)(?:\/(.*))?$/;

/**
 * @class UriUtils
 * @description Maps between the full record URIs stored in Elasticsearch
 * (gold record @ids, e.g. https://digital.ucdavis.edu/item/<ark>#imagelist/x.tif)
 * and the site paths the browser routes on (/item/<ark>/imagelist/x.tif).
 */
class UriUtils {

  /**
   * @method uriPrefixes
   * @description the full URI prefixes this module translates.
   *
   * @returns {Array<String>}
   */
  uriPrefixes() {
    let base = config.uri.baseUri;
    return [base+'/item/', base+'/collection/'];
  }

  /**
   * @method isUri
   * @description whether a value is a full record URI.
   *
   * @param {*} value
   *
   * @returns {Boolean}
   */
  isUri(value) {
    return typeof value === 'string' && this.uriPrefixes().some(p => value.startsWith(p));
  }

  /**
   * @method toPath
   * @description full record URI to its site path; '#' becomes '/'.
   * Anything that isn't a record URI is returned as is.
   *
   * @param {String} uri
   *
   * @returns {String}
   */
  toPath(uri) {
    if( !this.isUri(uri) ) return uri;
    return uri.slice(config.uri.baseUri.length).replace('#', '/');
  }

  /**
   * @method toUri
   * @description site path to its full record URI. Fragment segments are
   * encoded like argonath's quote(safe=""), so encoded or decoded input both
   * map to the stored id. Anything that isn't a record path is returned as is.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  toUri(path) {
    if( typeof path !== 'string' ) return path;
    let match = path.match(PATH_RE);
    if( !match ) return path;

    let [, type, ark, fragment] = match;
    let uri = `${config.uri.baseUri}/${type}/${ark}`;
    if( fragment ) {
      uri += '#' + fragment.split('/').map(seg => this._encode(seg)).join('/');
    }
    return uri;
  }

  /**
   * @method normalizePath
   * @description a site path in the same encoded form toPath() produces.
   *
   * @param {String} path
   *
   * @returns {String}
   */
  normalizePath(path) {
    return this.toPath(this.toUri(path));
  }

  /**
   * @method translateDoc
   * @description deep copy of a value with every record URI, in string
   * values and object keys, replaced by its site path.
   *
   * @param {*} value
   *
   * @returns {*}
   */
  translateDoc(value) {
    if( Array.isArray(value) ) return value.map(v => this.translateDoc(v));
    if( value && typeof value === 'object' ) {
      let out = {};
      for( let key in value ) {
        out[this.toPath(key)] = this.translateDoc(value[key]);
      }
      return out;
    }
    return this.toPath(value);
  }

  /**
   * @method _encode
   * @description encode one fragment segment like python's quote(safe="").
   * Colons are kept, since page ids end in ':<n>'.
   *
   * @param {String} segment
   *
   * @returns {String}
   */
  _encode(segment) {
    let decoded = segment;
    try {
      decoded = decodeURIComponent(segment);
    } catch(e) {}
    return encodeURIComponent(decoded)
      .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
      .replace(/%3A/g, ':');
  }
}

module.exports = new UriUtils();
