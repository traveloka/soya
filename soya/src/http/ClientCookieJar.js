import CookieJar from './CookieJar.js';
import Cookie from './Cookie.js';

/**
 * @CLIENT
 */
export default class ClientCookieJar extends CookieJar {
  /**
   * @param {string} name
   * @return {?string}
   */
  read(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  /**
   * @param {Cookie} cookie
   */
  set(cookie) {
    var cookieStr = cookie.toDocumentString();
    document.cookie = cookieStr;
  }

  /**
   * @param {string} name
   * @param {string} domain
   * @param {boolean} secure
   * @param {?string} path
   */
  remove(name, domain, secure, path) {
    var removalCookie = Cookie.createRemoval(name, domain, secure, path);
    this.set(removalCookie);
  }
}