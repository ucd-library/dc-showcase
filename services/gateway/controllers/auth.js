import config from '../lib/config.js';
import { logger } from '../lib/logger.js';
import keycloak from '../lib/keycloak.js';
import { auth } from 'express-openid-connect';

function init(app) {
  if( !config.auth.secret ) { 
    logger.error('auth.secret (AUTH_SECRET) is not set, cannot start auth service');
    process.exit(1);
  }

  // TODO: add if we need service accounts again.
  // always set long hashes as secret:
  // openssl rand -base64 512 | tr -d '\n'
  // add policy to expire secret after one year.
  // app.post('/auth/service-account/token', async (req, res) => {
  //   let loginResp = await keycloak.loginServiceAccount(
  //     req.body.username, req.body.secret
  //   );

  //   // strip id_token, don't have 3rd party users bother with this.
  //   if( loginResp.status === 200 ) {
  //     if( loginResp.body.id_token ) {
  //       delete loginResp.body.id_token;
  //     }
  //     if( loginResp.body.refresh_token ) {
  //       delete loginResp.body.refresh_token;
  //     }
  //   }

  //   res
  //     .status(loginResp.status)
  //     .json(loginResp.body);
  // });

  app.use(auth({
    authRequired: false,
    issuerBaseURL: config.auth.oidc.baseUrl,
    baseURL: config.publicUrl,
    clientID: config.auth.oidc.clientId,
    clientSecret: config.auth.oidc.secret,
    secret : config.auth.secret,
    routes : {
      callback : '/auth/callback',
      login : '/auth/login',
      logout : '/auth/logout',
      postLogoutRedirect : '/auth/postLogoutRedirect'
    },
    authorizationParams: {
      response_type: 'code',
      scope : config.auth.oidc.scopes
    },
    idpLogout: true
  }));


  logger.info('oidc service baseUrl='+config.auth.oidc.baseUrl);
  logger.info('oidc service clientID='+config.auth.oidc.clientId);
}

export {
  init
};