const path = require('path');

let configs = require('@ucd-lib/cork-app-build').dist({
  // root directory, all paths below will be relative to root
  root : path.resolve(__dirname, '..'),
  entry : 'public/elements/admin-ui-ext/dams-collection-import.js',
  // folder where bundle.js and ie-bundle.js will be written
  dist : '../../admin-ui/client/dist/js',
  clientModules : 'public/node_modules',
  outputFile : 'dams-admin-ui-ext.js',
  modern : 'dams-admin-ui-ext.js'
});

if( !Array.isArray(configs) ) configs = [configs];

// add .xml and .csl loading support
configs.forEach((config, index) => {

  config.externals = {
    externalsType: 'window',
    '@ucd-lib/cork-app-utils' : ['FinAdminUiShared', 'corkAppUtils'],
    '@ucd-lib/theme-elements/utils/mixins' : ['FinAdminUiShared', 'ucdLibThemeMixins'],
    'lit' : ['FinAdminUiShared', 'lit']
  }

  config.output.publicPath = '/js/'
  config.output.chunkFilename = '[name]-[chunkhash].'+config.output.filename;
});

module.exports = configs[0];