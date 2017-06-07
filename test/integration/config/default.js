const path = require('path');
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
  minifyJs: false,
  defaultImportBase: 'src',
  routerNodeRegistrationAbsolutePath: path.resolve(dirname, './src/i18n/router/registerRouterNodes'),
};

const i18n = {
  defaultLocale: 'id-id',
  locales: [
    'id-id',
    'en-id',
    'en-sg',
  ],
};

const apiHost = 'localhost:8000';
const contentApiHost = 'localhost:8000';

/**
 * Please note that clientConfig is exposed to browser, so you shouldn't put
 * sensitive configuration in there.
 */

var serverConfig = {
  apiHost,
  contentApiHost,
  enableDevTools: true,
  i18n,
};

var clientConfig = {
  apiHost,
  contentApiHost,
  enableDevTools: true,
  i18n,
};

module.exports = {
  frameworkConfig: frameworkConfig,
  serverConfig: serverConfig,
  clientConfig: clientConfig
};
