const env = process.env;
import fs from 'fs';
import dotenv from 'dotenv';

// load custom .env file if it exists in environment variables
// this is really useful for k8s environments where individual
// env variables from secrets are verbose and hard to manage
let envPath = '/etc/fin/.env';
if( process.env.FIN_ENV_FILE ) {
  envPath = process.env.FIN_ENV_FILE;
}
if( fs.existsSync(envPath) && fs.lstatSync(envPath).isFile() ) {
  if( ['info', 'debug'].includes(process.env.LOG_LEVEL) ) {
    console.log(`Loading environment variables from ${envPath}`);
  }
  dotenv.config({ path: envPath });
}

function envToArray(value) {
  if( !value ) {
    return null;
  }
  return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
}
const roleIgnoreList = envToArray(env.OIDC_ROLE_IGNORE_LIST);

const config = {

  port : env.PORT || 3000,

  publicUrl : env.PUBLIC_URL || 'http://localhost:3000',

  client : {
    url : env.CLIENT_URL || 'http://client:8000',
  },

  auth : {
    oidc : {
      clientId : env.OIDC_CLIENT_ID,
      baseUrl : env.OIDC_BASE_URL,
      secret : env.OIDC_CLIENT_SECRET,
      scopes : env.OIDC_SCOPES || 'roles openid profile email',
      roleIgnoreList : roleIgnoreList || [
        "default-roles-argonath",
        "uma_authorization",
        "manage-account",
        "manage-account-links",
        "view-profile",
        "offline_access"
      ]
    },
    secret : env.AUTH_SECRET,
    xUserHeader : env.X_USER_HEADER || 'x-argonath-user',
    cookieName : process.env.JWT_COOKIE_NAME || 'argonath-jwt',
    tokenCacheTTL : env.OIDC_TOKEN_CACHE_TTL ? parseInt(env.OIDC_TOKEN_CACHE_TTL) : (1000*60*5)
  },

  iiif : {
    url : env.IIIF_URL || 'http://iiif:80',
    basePath : env.IIIF_BASE_PATH || '/fcgi-bin/iipsrv.fcgi?IIIF='
  },

  // caskfs connection, used to resolve/stream migrated-item files directly
  // (see lib/cask-client.js) - was a separate argonath-adapter service's own
  // config before that service was merged into this one.
  caskfs : {
    // TODO: same cross-cluster/cross-namespace reachability caveat as
    // caskIiifUrl above - not yet confirmed once argonath is actually
    // deployed alongside dams.
    url : env.CASKFS_URL || 'http://cask:3001/cask',

    goldBasePath : env.CASKFS_GOLD_BASE_PATH || '/gold/dc-showcase',

    rootDir : env.CASKFS_ROOT_DIR || '/opt/cask',

    // trusted identity presented via the x-anduin-user header when calling
    // caskfs (CASKFS_HEADER_AUTH_ENABLED=true) - see lib/cask-client.js#authHeaders()
    user : env.CASKFS_USER || '',
  }

}

export default config;
