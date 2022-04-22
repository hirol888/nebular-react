const nrwlConfig = require('@nrwl/react/plugins/webpack.js');

module.exports = (config, context) => {
  nrwlConfig(config);

  config.module.rules.push({
    test: /\.(sc|c|sa)ss$/,
    use: [{ loader: 'scoped-css-loader' }]
  });

  return config;
};
