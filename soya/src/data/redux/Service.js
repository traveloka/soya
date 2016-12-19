/**
 * All services must implement this interface. Services are objects that
 * Segments use to access
 *
 * @CLIENT_SERVER
 */
export default class Service {
  /**
   * @type {Object}
   */
  config;

  /**
   * @type {CookieJar}
   */
  cookieJar;

  /**
   * @return {string}
   */
  static id() {
    throw new Error('Service must implement static id(): ' + this);
  }

  /**
   * @param {Object} config
   * @param {CookieJar} cookieJar
   */
  constructor(config, cookieJar) {
    this.config = config;
    this.cookieJar = cookieJar;
  }
}