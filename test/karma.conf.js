module.exports = function (config) {
  config.set({
    basePath: '../',
    singleRun: false,
    autoWatch: true,
    frameworks: ['mocha', 'chai', 'sinon'],
    files: [
      // setup
      { pattern: 'test/setup.js', type: 'module' },

      // assets
      { pattern: 'src/assets/**/*.*', included: false, served: true },
      { pattern: 'src/data/**/*.json', included: false, served: true },
      { pattern: 'src/data/**/*.csv', included: false, served: true },
      { pattern: 'src/**/*.js', type: 'module', included: false },

      // test files
      { pattern: 'test/**/*.spec.js', type: 'module' }
    ],
    browsers: ['ChromeHeadless'],
    proxies: {
      '/src': '/base/src'
    },
    reporters: ['mocha'],
    client: {
      mocha: {
        timeout: 4000,
        reporter: 'html'
      }
    }
  });
};
