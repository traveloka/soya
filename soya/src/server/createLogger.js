/**
 * LOGGER CONFIGURATION
 *
 * Create and configure your logger here.
 *
 * @SERVER
 */

import Logger from '../logger/Logger';

/**
 * @param {Object} serverConfig Server-side configuration.
 * @returns {Logger}
 */
export default function createLogger(serverConfig) {
  // Ideally you should change logger configuration depending on whether or
  // not we are in production.
  let isProduction = false;
  if (serverConfig && serverConfig.isProduction) {
    isProduction = true;
  }
  return new Logger(isProduction);
};
