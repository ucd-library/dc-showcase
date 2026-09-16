const config = require('../config.js');
const { logger } = require('./logger.js');

/**
 * @class KeycloakUtils
 * @description Local OIDC/Keycloak verification, replacing
 * @ucd-lib/fin-service-utils's keycloak module. Follows the pattern in
 * aggie-experts/webapp/lib/keycloak.js (userinfo-endpoint token
 * verification with a short-lived cache), adapted to use native fetch()
 * instead of node-fetch and structuredClone() instead of the clone package.
 */
class KeycloakUtils {

  constructor() {
    this.tokenCache = new Map();
    this.tokenRequestCache = new Map();
    this.maxTokenRequests = 3;

    this.setUser = this.setUser.bind(this);
    this.protect = this.protect.bind(this);
  }

  /**
   * @method getJwtFromRequest
   * @description given an express request object, return a jwt token.
   * Checks the request cookie first, then the Authorization header.
   *
   * @param {Object} req express request object
   *
   * @returns {String|null} null if no token found.
   */
  getJwtFromRequest(req) {
    let token;

    if( req.cookies ) {
      token = req.cookies[config.jwt.cookieName];
      if( token ) return token;
    }

    token = req.get('Authorization');
    if( token && token.match(/^Bearer /i) ) {
      return token.replace(/^Bearer /i, '');
    }

    return null;
  }

  /**
   * @method verifyActiveToken
   * @description verify a token is active against Keycloak's userinfo
   * endpoint, caching the result for config.oidc.tokenCacheTTL ms.
   *
   * @param {String} token
   *
   * @returns {Promise<Object>} {active, status, user}
   */
  async verifyActiveToken(token='') {
    token = token.replace(/^Bearer /i, '');

    if( this.tokenCache.has(token) ) {
      return structuredClone(this.tokenCache.get(token));
    }

    if( this.tokenRequestCache.has(token) ) {
      return structuredClone(await this.tokenRequestCache.get(token));
    }

    let requestResolve;
    let promise = new Promise(resolve => requestResolve = resolve);
    this.tokenRequestCache.set(token, promise);

    let attempt = 1;
    let result = { active: false, status: -1, user: null };

    while( attempt <= this.maxTokenRequests ) {
      try {
        result = await this._verifyTokenRequest(token);
        break;
      } catch(e) {
        attempt++;
        if( attempt > this.maxTokenRequests ) {
          logger.error('Failed to verify token, max attempts reached', e);
        } else {
          logger.warn('Failed to verify token, retrying: '+attempt, e);
        }
      }
    }

    this.tokenRequestCache.delete(token);
    requestResolve(result);
    return structuredClone(result);
  }

  async _verifyTokenRequest(token) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    let resp;
    try {
      resp = await fetch(`${config.oidc.host}/realms/${config.oidc.realm}/protocol/openid-connect/userinfo`, {
        signal: controller.signal,
        headers: { authorization: 'Bearer '+token }
      });
    } finally {
      clearTimeout(timeoutId);
    }

    let body = await resp.text();
    let result = {
      active: resp.status === 200,
      status: resp.status,
      user: body ? JSON.parse(body) : null
    };

    this.tokenCache.set(token, result);
    setTimeout(() => this.tokenCache.delete(token), config.oidc.tokenCacheTTL);

    return result;
  }

  /**
   * @method setUser
   * @description express middleware. Sets req.user from a verified token
   * (cookie or Authorization header), normalizing roles onto req.user.roles.
   */
  async setUser(req, res, next) {
    let token = this.getJwtFromRequest(req);
    if( !token ) return next();
    req.token = token;

    let resp = await this.verifyActiveToken(token);
    if( resp.active !== true ) return next();

    let user = resp.user;
    let roles = new Set();

    if( user.roles && Array.isArray(user.roles) ) {
      user.roles.forEach(role => roles.add(role));
    }
    if( user.realmRoles && Array.isArray(user.realmRoles) ) {
      user.realmRoles.forEach(role => roles.add(role));
      delete user.realmRoles;
    }

    user.roles = Array.from(roles).filter(role => !config.oidc.roleIgnoreList.includes(role));
    req.user = user;

    next();
  }

  /**
   * @method protect
   * @description express middleware generator. Requires a verified user;
   * if roles are given, requires the user to have at least one of them.
   *
   * @param {Array<String>} roles
   */
  protect(roles=[]) {
    if( !Array.isArray(roles) ) roles = [roles];

    return async (req, res, next) => {
      await this.setUser(req, res, () => {
        if( !req.user ) return res.status(403).send();
        if( roles.length === 0 ) return next();
        if( roles.some(role => req.user.roles.includes(role)) ) return next();
        return res.status(403).send();
      });
    };
  }

}

module.exports = new KeycloakUtils();
