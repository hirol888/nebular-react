const nrwlConfig = require('@nrwl/react/plugins/bundle-rollup');
const copy = require('rollup-plugin-copy');

module.exports = (config) => {
  nrwlConfig(config);

  return {
    ...config,
    plugins: [
      ...config.plugins,
      copy({
        targets: [
          {
            src: 'libs/nebular-react/src/theme/**/*.scss',
            dest: 'dist',
            rename: (name, extension, fullPath) => {
              return `${fullPath.replace('src', '')}`;
            }
          }
        ],
        flatten: true
      })
    ]
  };
};
