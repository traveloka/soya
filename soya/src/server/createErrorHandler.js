/**
 * ERROR HANDLER CONFIGURATION
 *
 * Create and configure your server-side error handler here.
 *
 * @SERVER
 */

import ErrorHandler from '../ErrorHandler';

/**
 * @param {Object} config Server-side configuration.
 * @param {Logger} logger
 * @returns {ErrorHandler}
 */
export default function createErrorHandler(config, logger) {
  // Ideally you'd return a different error handler depending on whether or not
  // we are in production.
  return new ErrorHandler(logger);
};