/**
 * Interface for reading and writing cookies. Universal code should read and
 * write cookies only from an implementation of this interface. We need a
 * unified interface for cookie reading because they are retrieved from
 * different sources depending on whether you are on server or client side.
 *
 * @CLIENT_SERVER
 */
export default class CookieJar {
  /**
   * Returns null if there is no cookie with the given name.
   *
   * @param {string} name
   * @return {?string}
   */
  read(name) {

  }

  /**
   * @param {Cookie} cookie
   */
  set(cookie) {

  }

  /**
   * @param {string} name
   * @param {string} domain
   * @param {boolean} secure
   * @param {?string} path
   */
  remove(name, domain, secure, path) {

  }
}