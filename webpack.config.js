const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add WASM support
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'javascript/auto',
    loader: 'file-loader',
    options: {
      name: 'static/js/[name].[hash:8].[ext]',
    },
  });

  return config;
};