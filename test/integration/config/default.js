var dirname = process.env.SOYA_PROJECT_DIR;

/**
 * Framework configuration.
 */
var frameworkConfig = {
  port: 8000,
  assetProtocol: 'http',
  assetHostPath: 'localhost:8000/assets/',
  absoluteProjectDir: dirname,
  componentBrowser: true,
  hotReload: true,
  clientResolve: [],
  clientReplace: {},
  debug: true,
  minifyJs: false
};

/**
 * Please note that clientConfig is exposed to browser, so you shouldn't put
 * sensitive configuration in there.
 */

var serverConfig = {
  apiHost: 'localhost:8000',
  enableDevTools: true
};

var clientConfig = {
  apiHost: 'localhost:8000',
  enableDevTools: true
};

module.exports = {
  frameworkConfig: frameworkConfig,
  serverConfig: serverConfig,
  clientConfig: clientConfig
};