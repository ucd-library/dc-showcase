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
      ]
    }
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
    host: process.env.OIDC_BASE_URL || 'https://auth.library.ucdavis.edu',
    realm: process.env.OIDC_REALM || 'internal',
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
    user: process.env.CASK_USER || ''
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
  },

  featuredImages : [
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/amerine-menu-d73035.jpg",
      itemName : "B.O.A.C. Dinner Service",
      collectionName : "Amerine (Maynard) Menu Collection",
      itemLink : "/item/ark:/87287/d73035",
      collectionLink : "/collection/ark:/87287/d79c7b"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/amerine-menu-d7r91d.jpg",
      itemName : "Air France - Paris-Washington",
      collectionName : "Amerine (Maynard) Menu Collection",
      itemLink : "/item/ark:/87287/d7r91d",
      collectionLink : "/collection/ark:/87287/d79c7b"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/amerine-menu-d7xp58.jpg",
      itemName : "Comité National des Vins de France: A Tasting of French Red Wines",
      collectionName : "Amerine (Maynard) Menu Collection",
      itemLink : "/item/ark:/87287/d7xp58",
      collectionLink : "/collection/ark:/87287/d79c7b"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/amerine-menu-d7xp6n.jpg",
      itemName : "Japan Air",
      collectionName : "Amerine (Maynard) Menu Collection",
      itemLink : "/item/ark:/87287/d7xp6n",
      collectionLink : "/collection/ark:/87287/d79c7b"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/BioAg-AR_012_1478.jpg",
      itemName : "Early Types Deep Tillage Tools, California",
      collectionName : "Department of Biological and Agricultural Engineering Photographs",
      itemLink : "/item/ark:/87293/d3ns0m251",
      collectionLink : "/collection/ark:/13030/c8154mgs"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/BioAg-AR_012_570.jpg",
      itemName : "General Purpose Barn",
      collectionName : "Department of Biological and Agricultural Engineering Photographs",
      itemLink : "/item/ark:/87293/d3vd6p84d",
      collectionLink : "/collection/ark:/13030/c8154mgs"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/eastman-B-1076.jpg",
      itemName : "Thompson Lake",
      collectionName : "Eastman's Originals Collection",
      itemLink : "/item/ark:/13030/tf1r29n5v8",
      collectionLink : "/collection/ark:/13030/tf6w100646"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/eastman-B-1107.jpg",
      itemName : "Early Day Logging",
      collectionName : "Eastman's Originals Collection",
      itemLink : "/item/ark:/13030/tf7t1nb3p0",
      collectionLink : "/collection/ark:/13030/tf6w100646"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/eastman-C-726.jpg",
      itemName : "Pelicans",
      collectionName : "Eastman's Originals Collection",
      itemLink : "/item/ark:/13030/tf138nb09d",
      collectionLink : "/collection/ark:/13030/tf6w100646"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/eastman-P-0459.jpg",
      itemName : "Logging in 1895",
      collectionName : "Eastman's Originals Collection",
      itemLink : "/item/ark:/13030/tf4p3004rm",
      collectionLink : "/collection/ark:/13030/tf6w100646"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/eastman-T-2094.jpg",
      itemName : "Rodeo + Races",
      collectionName : "Eastman's Originals Collection",
      itemLink : "/item/ark:/13030/tf200003s0",
      collectionLink : "/collection/ark:/13030/tf6w100646"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/greene-D192_7_079.jpg",
      itemName : "Photo album p. 39, Traful River",
      collectionName : "Greene, Henry Dart Papers",
      itemLink : "/item/ark:/87293/d3kj54",
      collectionLink : "/collection/ark:/87287/d7r94j/D-192"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/greene-D192_7_087.jpg",
      itemName : "Photo album p. 42, Mar del Plata",
      collectionName : "Greene, Henry Dart Papers",
      itemLink : "/item/ark:/87293/d3pb50",
      collectionLink : "/collection/ark:/87287/d7r94j/D-192"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/henchey-d3cb3f.jpg",
      itemName : "Hydraulic Mines, Scales, Sierra County, California, SV-1164",
      collectionName : "Henchey (Paul L.) Photographs",
      itemLink : "/item/ark:/87293/d3cb3f",
      collectionLink : "/collection/D-515"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/henchey-d3gm7n.jpg",
      itemName : "Lodge and Cabins built in 1860's",
      collectionName : "Henchey (Paul L.) Photographs",
      itemLink : "/item/ark:/87293/d3gm7n",
      collectionLink : "/collection/D-515"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/hunt-D104_1_13.jpg",
      itemName : "511. Costa Rica: coconut palms near Port Limon",
      collectionName : "Hunt (Thomas Forsyth) Papers",
      itemLink : "/item/ark:/87293/d37t99",
      collectionLink : "/collection/D-104"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/hunt-D104_1_50.jpg",
      itemName : "548. Costa Rica: beneficio at Mata Redonda belonging to Miguel Guisginiani",
      collectionName : "Hunt (Thomas Forsyth) Papers",
      itemLink : "/item/ark:/87293/d3g74q",
      collectionLink : "/collection/D-104"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/irrigation-700-A-a-249.jpg",
      itemName : "Water Pouring Over Sweet Water Dam After Raising about 1911. California.",
      collectionName : "Department of Irrigation Photographs",
      itemLink : "/item/ark:/87293/d37n2x",
      collectionLink : "/collection/AR-058"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/irrigation-700-A-a-329-2.jpg",
      itemName : "Don Pedro Dam, spillway crest (2 neg.)",
      collectionName : "Department of Irrigation Photographs",
      itemLink : "/item/ark:/87293/d3k19g",
      collectionLink : "/collection/AR-058"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/lehmann-d74s4s.jpg",
      itemName : "Christmas Catalog 1969",
      collectionName : "Sherry Lehmann Wine Catalogs",
      itemLink : "/item/ark:/87287/d74s4s",
      collectionLink : "/collection/ark:/13030/c8pc37z3"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/lehmann-d7hg6v.jpg",
      itemName : "Annual Winter Sale 1952",
      collectionName : "Sherry Lehmann Wine Catalogs",
      itemLink : "/item/ark:/87287/d7hg6v",
      collectionLink : "/collection/ark:/13030/c8pc37z3"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/lug-D211_22_43.jpg",
      itemName : "Arden Villa",
      collectionName : "Lug and Can Label Collection",
      itemLink : "/item/ark:/87293/d3tm7240c",
      collectionLink : "/collection/D-211"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/lug-D211_37_3.jpg",
      itemName : "Mariposa",
      collectionName : "Lug and Can Label Collection",
      itemLink : "/item/ark:/87293/d31z41w7c",
      collectionLink : "/collection/D-211"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/lug-D211_38_56.jpg",
      itemName : "BoLo",
      collectionName : "Lug and Can Label Collection",
      itemLink : "/item/ark:/87293/d3mw28h94",
      collectionLink : "/collection/D-211"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/lug-D211_38_68.jpg",
      itemName : "R-C",
      collectionName : "Lug and Can Label Collection",
      itemLink : "/item/ark:/87293/d32v2cd49",
      collectionLink : "/collection/D-211"
    },  


    // TODO fix 'Napa Valley Wine Library Reports' doesn't seem to be on sandbox, so items are missing the collection ark isPartOf ref
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/NVWL_report_spring_1991_page4.jpg",
      itemName : "Napa Valley Wine Library Report, Spring 1991",
      collectionName : "Napa Valley Wine Library Reports",
      itemLink : "/item/ark:/87287/d7mt0z",
      collectionLink : "/collection/nvwl"
    },


    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/NVWL_Slide_24.jpg",
      itemName : "Inglenook Vineyard, Rutherford, Napa County: Napa Valley",
      collectionName : "Wait (Frona Eunice) Lantern Slides of California Wine Country",
      itemLink : "/item/ark:/87293/d34j0b194",
      collectionLink : "/collection/D-694"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/NVWL_Slide_30.jpg",
      itemName : "Inglenook Vineyard, Rutherford, Napa County: Vineyard and Carriage House",
      collectionName : "Wait (Frona Eunice) Lantern Slides of California Wine Country",
      itemLink : "/item/ark:/87293/d3c24qr6h",
      collectionLink : "/collection/D-694"
    },


    // TODO fix 'Pioneering Punjabis Digital Archive' seems to also be missing from sandbox, no isPartOf in items
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/punjabis-d33k6h-1989.jpg",
      itemName : "Vancouver Sikh Parade",
      collectionName : "Pioneering Punjabis Digital Archive",
      itemLink : "/item/ark:/87293/d33k6h",
      collectionLink : "/collection/pioneering-punjabis"
    },
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/punjabis-d3mw2r.jpg",
      itemName : "Birdseye View of Maryville",
      collectionName : "Pioneering Punjabis Digital Archive",
      itemLink : "/item/ark:/87293/d3mw2r",
      collectionLink : "/collection/pioneering-punjabis"
    },


    // TODO not sure if the item/collection links are valid, not on sandbox yet
    {
      imageUrl : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/slater-d3m09f-180.jpg",
      itemName : "France versus United States at Colombes",
      collectionName : "Slater (Colby E. \"Babe\") Collection",
      itemLink : "/item/ark:/87293/d3m09f",
      collectionLink : "/collection/slater"
    },
    {
      "imageUrl" : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/regional-postcard-O-001_01_016.jpg",
      "itemName" : "Hot Air Balloon, Davis, Calif.",
      "collectionName" : "Regional Postcard Collection",
      "itemLink" : "/item/ark:/87293/d3h41jt83",
      "collectionLink" : "/collection/ark:/87293/d3kw57r29"
    },
    {
      "imageUrl" : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/pierce-D-022_09_21.jpg",
      "itemName" : "A-21. Images of almond orchards...",
      "collectionName" : "Pierce Family Papers",
      "itemLink" : "/item/ark:/87293/d3sx64f52",
      "collectionLink" : "/collection/ark:/87293/d3z892n52"
    },
    {
      "imageUrl" : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/davis-covid-87293_d3g528.jpg",
      "itemName" : "Abstract Rainbow Mandala",
      "collectionName" : "Davis Downtown COVID-19 Community Art Project",
      "itemLink" : "/item/ark:/87293/d3g528",
      "collectionLink" : "/collection/ark:/87293/d3sj19z36"
    },
    {
      "imageUrl" : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/nature-printing-butterflyfish-87293_d32j6888m.jpg",
      "itemName" : "Butterflyfishes",
      "collectionName" : "Nature Printing Society Collection",
      "itemLink" : "/item/ark:/87293/d32j6888m",
      "collectionLink" : "/collection/ark:/87293/d3057d056"
    },
    {
      "imageUrl" : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/nature-printing-inkodye-87293_d3901zm5p.jpg",
      "itemName" : "Inkodye-on-Cloth",
      "collectionName" : "Nature Printing Society Collection",
      "itemLink" : "/item/ark:/87293/d3901zm5p",
      "collectionLink" : "/collection/ark:/87293/d3057d056"
    },
    {
      "imageUrl" : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/hours-virgin-87293_d38w3870g.jpg",
      "itemName" : "Hours of the Virgin",
      "collectionName" : "Hours of the Virgin",
      "itemLink" : "/item/ark:/87293/d38w3870g",
      "collectionLink" : "/collection/ark:/87293/d3vd6pc0t"
    },
    {
      "imageUrl" : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/picnic_day-87293_d3t727m3g.jpg",
      "itemName" : "Picnic Day program 1987",
      "collectionName" : "Picnic Day Collection",
      "itemLink" : "/item/ark:/87293/d3t727m3g",
      "collectionLink" : "/collection/ark:/87293/d36q1sq2t"
    },
    {
      "imageUrl" : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/lehmann-87287_d79018.jpg",
      "itemName" : "To A Gay and Festive Summer 1950",
      "collectionName" : "Sherry Lehmann Wine Catalogs",
      "itemLink" : "/item/ark:/87287/d79018",
      "collectionLink" : "/collection/ark:/13030/c8pc37z3"
    },
    {
      "imageUrl" : "/fcrepo/rest/application/ucd-lib-client/default-images/featured/lehmann-87287_d7tg6n.jpg",
      "itemName" : "Season's Greetings (Globe Theater) 1965",
      "collectionName" : "Sherry Lehmann Wine Catalogs",
      "itemLink" : "/item/ark:/87287/d7tg6n",
      "collectionLink" : "/collection/ark:/13030/c8pc37z3"
    }
  ]
};

module.exports = config;