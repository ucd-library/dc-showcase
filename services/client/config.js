const path = require('path');

let env = process.env.CLIENT_ENV || 'dev';

/**
 * Local, independent config - replaces @ucd-lib/fin-service-utils's config
 * object (see docs/PORT-PLAN.md Phase 0). Only includes what this app's own
 * code actually reads; there is no fcrepo/fin service to configure for
 * anymore beyond the fcrepo-middleware shim's own CASK_URL (see
 * lib/fcrepo-middeware.js).
 */
let config = {

  server: {
    url: process.env.SERVER_URL || 'http://localhost:8000'
  },

  models: {
    rootDir: path.join(__dirname, 'models')
  },

  api: {
    port: parseInt(process.env.API_PORT || '3004')
  },

  pg: {
    host: process.env.PG_HOST || 'postgres',
    port: parseInt(process.env.PG_PORT || '5432'),
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE || 'dcf',
    searchPath: ['public', 'dcf_edits']
  },

  elasticsearch: {
    host: process.env.ES_HOST || 'elastic-search',
    port: parseInt(process.env.ES_PORT || '9200'),
    username: process.env.ELASTIC_USERNAME || 'elastic',
    password: process.env.ELASTIC_PASSWORD || 'elastic',
    get connStr() {
      return `http://${this.host}:${this.port}`;
    },
    log: process.env.ES_LOG_LEVEL || 'error',
    compactTypeInclude: [
      /http:\/\/digital\.ucdavis\.edu\/schema#/,
      /http:\/\/schema\.org\//
    ],
    fields: {
      exclude: [
        'roles', '@graph.indexableContent',
        '@graph.createdBy', '@graph.lastModifiedBy', '@graph._', '@graph.textIndexable'
      ],
      excludeCompact: [
        'roles', '@graph.indexableContent',
        '@graph.createdBy', '@graph.lastModifiedBy', '@graph._',
        '@graph.image', '@graph.textIndexable', '@graph.lastModified'
      ],
      // search results skip per-file media
      excludeSearch: [
        'roles', '@graph.indexableContent',
        '@graph.createdBy', '@graph.lastModifiedBy', '@graph._', '@graph.textIndexable',
        'clientMedia'
      ]
    }
  },

  uri: {
    baseUri: process.env.RECORD_BASE_URI || 'https://digital.ucdavis.edu'
  },

  // collection itemCount sync - see lib/item-count-cron.js
  itemCountCron: {
    enabled: process.env.ITEM_COUNT_CRON_ENABLED !== 'false',
    interval: parseInt(process.env.ITEM_COUNT_CRON_INTERVAL || String(1000 * 60 * 5))
  },

  // simplified stand-in for fin's FinAC role names - see lib/es-model.js
  finac: {
    agents: {
      admin: 'admin',
      public: 'public'
    }
  },

  jwt: {
    cookieName: process.env.JWT_COOKIE_NAME || 'dcf-jwt'
  },

  oidc: {
    // issuer url, includes the realm
    host: process.env.OIDC_BASE_URL || 'https://auth.library.ucdavis.edu/realms/internal',
    clientId: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    roleIgnoreList: [
      'default-roles-internal',
      'uma_authorization',
      'manage-account',
      'manage-account-links',
      'view-profile',
      'offline_access'
    ],
    tokenCacheTTL: parseInt(process.env.OIDC_TOKEN_CACHE_TTL || String(1000 * 60 * 5))
  },

  // legacy fcrepo/fin values, still needed by the fcrepo-middleware shim
  // and v1-redirect handling until Phase 2/9 land - see docs/PORT-PLAN.md
  fcrepo: {
    root: process.env.FCREPO_ROOT || '/fcrepo/rest',
    dataMirror: {
      url: process.env.FCREPO_DATA_MIRROR_URL || ''
    }
  },
  gateway: {
    host: process.env.GATEWAY_HOST || '',
    proxy: {
      disableFileDownloads: process.env.DISABLE_FILE_DOWNLOADS === 'true'
    }
  },

  // CaskFS connection used by the fcrepo-middleware shim (Phase 2) - see
  // docs/PORT-PLAN.md Phase 1. CaskFS's own ACL is username-keyed, not
  // Keycloak-role-keyed (see dams-deployment/cmds/provision-cask-dev-access.sh
  // for the full explanation), so CASK_USER is the fixed identity this server
  // presents as, scoped via a CaskFS-side role/grant on that username, not
  // derived from the request.
  cask: {
    url: process.env.CASK_URL || 'http://cask.argonath-prod.svc.cluster.local:3001',
    pathPrefix: process.env.CASK_PATH_PREFIX || '/cask',
    user: process.env.CASK_USER || '',
    // app's gold project, e.g. /gold/digital-prod
    goldBasePath: process.env.CASK_GOLD_BASE_PATH || '/gold/digital-dev'
  },

  // IIIF image service the fcrepo-middleware shim's svc:iiif branch proxies
  // to - see docs/PORT-PLAN.md Phase 2. Reached via the legacy
  // urlTemplate convention (services/init/fcrepo/service/iiif.jsonld.json
  // in the old fin-init data: `http://iiif:80/fcgi-bin/iipsrv.fcgi?IIIF=...`),
  // just pointed at CaskFS's resolved on-disk path instead of a gcs-fuse
  // mount.
  iiif: {
    host: process.env.IIIF_HOST || 'http://iiif'
  }
};

let clientPackage = require('./client/public/package.json');

let clientPackageVersion = clientPackage.version;
if( process.env.APP_VERSION ) {
  clientPackageVersion = process.env.APP_VERSION;
}

config.client = {
  // TODO: move this to fcrepo
  title : 'UC Davis Library Digital Collections',
  description : 'UC Davis Digital Collections provide online access to digitized or born-digital materials from the UC Davis Library, with a particular focus on the rare and unique materials in its Archives and Special Collections. These documents, images, audio and video files offer a rich resource for exploration by scholars and the public alike.',

  enableGA4Stats : process.env.GA4_ENABLE_STATS === 'true',
  gaId : process.env.GA4_MEASUREMENT_ID || '',

  appName : process.env.FIN_APP_NAME || 'ucd-lib-client',
  assets : (env === 'prod') ? 'dist' : 'public',
  appRoutes : ['about', 'item', 'search', 'browse', 'collections', 'collection', 'components', 'search-tips'],
  versions : {
    bundle : clientPackageVersion,
    loader : clientPackage.dependencies['@ucd-lib/cork-app-load'].replace(/^\D/, '')
  },

  // latest text fields used for search
  // when we're releasing new versions requiring schema reindexing, we can update this to the latest,
  // and update the overlay .env vars with the current working set of fields, until reindexing is done
  itemTextFields : process.env.ITEM_TEXT_FIELDS || '@graph.text_search_description, name.punctuation_insensitive, name.stem, @graph.identifier, @graph.about, @graph.keywords, @graph.indexableContent',
  collectionTextFields : process.env.COLLECTION_TEXT_FIELDS || '@graph.name.stem, @graph.description.stem, @graph.about.stem, @graph.keywords.stem',

  // when false (default), the date facet queries the legacy scalar yearPublished field.
  // once yearPublishedStart/yearPublishedEnd have been backfilled by reindexing, flip this
  // to true so the date facet/filter switches over to them (needed for circa/range/uncertain
  // dates, which leave yearPublished null). Same env var name used by the models service.
  useDateRangeFields : process.env.USE_DATE_RANGE_FIELDS === 'true',

  env : {
    CLIENT_ENV : env,
    FIN_APP_VERSION : process.env.FIN_APP_VERSION || '',
    FIN_REPO_TAG : process.env.FIN_REPO_TAG || '',
    FIN_BRANCH_NAME : process.env.FIN_BRANCH_NAME || '',
    FIN_SERVER_REPO_HASH : process.env.FIN_SERVER_REPO_HASH || '',
    APP_VERSION : process.env.APP_VERSION || '',
    BUILD_NUM : process.env.BUILD_NUM || '',
    BUILD_DATETIME : process.env.BUILD_DATETIME || '',
    UCD_DAMS_REPO_BRANCH : process.env.UCD_DAMS_REPO_BRANCH || '',
    UCD_DAMS_REPO_TAG : process.env.UCD_DAMS_REPO_TAG || '',
    UCD_DAMS_REPO_SHA : process.env.UCD_DAMS_REPO_SHA || '',
    UCD_DAMS_DEPLOYMENT_SHA : process.env.UCD_DAMS_DEPLOYMENT_SHA || '',
    UCD_DAMS_DEPLOYMENT_BRANCH : process.env.UCD_DAMS_DEPLOYMENT_BRANCH || '',
    UCD_DAMS_DEPLOYMENT_TAG : process.env.UCD_DAMS_DEPLOYMENT_TAG || '',
    FIN_SERVER_IMAGE : process.env.FIN_SERVER_IMAGE || ''
  },
  logger : {
    logLevel : process.env.CLIENT_LOG_LEVEL || 'warn',
    logLevels : process.env.CLIENT_LOG_LEVELS ? JSON.parse(process.env.CLIENT_LOG_LEVELS) : {},
    reportErrors : {
      enabled : process.env.CLIENT_ERROR_REPORTING_ENABLED === 'true',
      url : process.env.CLIENT_ERROR_REPORTING_URL || '',
      key : process.env.CLIENT_ERROR_REPORTING_KEY || '',
      customAttributes : {
        appName : 'dams',
        appOwner : 'digital'
      }
    }
  }
};

module.exports = config;