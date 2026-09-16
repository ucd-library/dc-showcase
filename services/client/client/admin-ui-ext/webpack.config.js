const path = require('path');

let configs = require('@ucd-lib/cork-app-build').watch({
  // root directory, all paths below will be relative to root
  root : path.resolve(__dirname, '..'),
  entry : 'public/elements/admin-ui-ext/dams-collection-import.js',
  // entry : 'public/elements/fin-app.js',
  // folder where bundle.js will be written
  preview : '../../admin-ui/client/public/js',
  clientModules : 'public/node_modules',
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
  config.output.chunkFilename = '[name].'+config.output.filename;
});

module.exports = configs[0];