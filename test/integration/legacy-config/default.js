const path = require('path');
var dirname = process.cwd();

/**
 * Framework configuration.
 */
var frameworkConfig = {
  port: 3000,
  assetProtocol: 'http',
  assetHostPath: 'localhost:3000/assets/',
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

const apiHost = 'localhost:3000';
const contentApiHost = 'localhost:3000';

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
