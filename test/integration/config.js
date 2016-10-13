/**
 * CONFIGURATION FILE.
 *
 * Should be able to read environment variables in this file to determine
 * configuration variables. Although this file is only run in server side,
 * the client-side config you create will be sent to browsers - be very
 * careful of what you put there.
 *
 * @SERVER
 * @WEBPACK
 */

var path = require('path');
var dirname = process.env.SOYA_PROJECT_DIR;

/**
 * Framework configuration.
 */
var frameworkConfig = {
  port: 8000,
  assetProtocol: 'http',
  assetHostPath: 'localhost:8000/assets/',
  absoluteProjectDir: dirname,
  absoluteSrcDir: path.join(dirname, 'src'),
  absoluteServerBuildDir: path.join(dirname, 'build/server'),
  absoluteClientBuildDir: path.join(dirname, 'build/client'),
  hotReload: true,
  routesFilePath: path.join(dirname, 'routes.yml'),
  clientResolve: [],
  clientReplace: {},
  debug: true,
  minifyJs: false
};

/**
 * Configuration to instantiate dependencies that needs to be instantiated in
 * both client and server side. Please note that clientConfig is exposed to
 * browser, so you shouldn't put sensitive configuration in there.
 */

var configBase = {
  cookieDomain: 'localhost',
  cookieVersion: '1'
};
module.exports = {
  frameworkConfig: frameworkConfig,
  serverConfig: Object.assign({}, configBase, {
    // Add config specific to server side here.
  }),
  clientConfig: Object.assign({}, configBase, {
    // Add config specific to clients side here.
  })
};