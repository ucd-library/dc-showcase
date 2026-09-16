const webpack = require('webpack');

let configs = require('@ucd-lib/cork-app-build').dist({
  // root directory, all paths below will be relative to root
  root : __dirname,
  entry : 'public/elements/fin-app.js',
  // folder where bundle.js and ie-bundle.js will be written
  dist : 'dist/js',
  preview : 'public/js',
  clientModules : 'public/node_modules'
});

if( !Array.isArray(configs) ) configs = [configs];

// add .xml and .csl loading support
configs.forEach((config, index) => {
  config.module.rules.push({
    test: /\.(xml|csl)$/,
    use: [ 'raw-loader']
  });
  config.module.rules.push({
    test: /\.js$/,
    include: /\@internetarchive/,
    loader: "babel-loader",
    options: {
      rootMode: "upward"
    }
  });

  config['plugins'] = [
    new webpack.ProvidePlugin({
      // Make $ and jQuery available without importing
      $: 'jquery',
      jQuery: 'jquery',
    })
  ];

  config.output.publicPath = '/js/'
  config.output.chunkFilename = '[name]-[chunkhash].'+config.output.filename;
});

// console.log(configs[0])


module.exports = configs[0];