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
var env = process.env.NODE_ENV || 'dev';

var defaultConfig = require('./legacy-config/default.js');
var config = require('./legacy-config/' + env);

module.exports = {
  frameworkConfig: Object.assign({}, defaultConfig.frameworkConfig, config.frameworkConfig),
  serverConfig: Object.assign({}, defaultConfig.serverConfig, config.serverConfig),
  clientConfig: Object.assign({}, defaultConfig.clientConfig, config.clientConfig)
};
