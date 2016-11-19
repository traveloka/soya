import CookieJar from './CookieJar.js';
import Cookie from './Cookie.js';

/**
 * @SERVER
 */
export default class ServerCookieJar extends CookieJar {
  /**
   * @type {http.incomingMessage}
   */
  _httpRequest;

  /**
   * @type {{[key: string]: string}}
   */
  _cookies;

  /**
   * @type {{[key: string]: Cookie}}
   */
  _newCookies;

  /**
   * @param {http.incomingMessage} httpRequest
   */
  constructor(httpRequest) {
    super();
    this._httpRequest = httpRequest;
    this._newCookies = {};
  }

  /**
   * TODO: Reading cookie might also need domain?
   *
   * @param {string} name
   * @return {?string}
   */
  read(name) {
    // Get from new cookies first, they represent the *latest* cookie state.
    var newCookie = this._newCookies[name];
    if (newCookie) {
      return newCookie.value;
    }

    // Otherwise try to get it from http request.
    if (this._cookies == null) {
      this._createCache();
    }
    if (this._cookies.hasOwnProperty(name)) {
      return this._cookies[name];
    }
    return null;
  }

  /**
   * @param {Cookie} cookie
   */
  set(cookie) {
    if (!(cookie instanceof Cookie)) {
      throw new Error('Expected cookie, this given instead: ' + cookie);
    }
    this._newCookies[cookie.name] = cookie;
  }

  /**
   * @param {string} name
   * @param {string} domain
   * @param {?string} path
   */
  remove(name, domain, path) {
    var removalCookie = Cookie.createRemoval(name, domain, path);
    this.set(removalCookie);
  }

  /**
   * Generates an array of 'Set-Cookie' header values.
   *
   * @return {Array<string>}
   */
  generateHeaderValues() {
    var key, values = [];
    for (key in this._newCookies) {
      values.push(this._newCookies[key].toHeaderString());
    }
    return values;
  }

  getHttpRequest() {
    return this._httpRequest;
  }

  /**
   * Creates a cache of cookie from http.incomingMessage.
   */
  _createCache() {
    this._cookies = {};
    var cookieString = this._httpRequest.headers.cookie;
    if (cookieString == null || typeof cookieString != 'string') return null;
    var splitCookieStr = cookieString.split(';');
    // TODO: Security risk, parsing cookies here means blocking the event loop. If attacker sends large amount of cookies, it could make our server non-responsive.
    for (var i=0;i < splitCookieStr.length;i++) {
      var cookieSegment = splitCookieStr[i];
      while (cookieSegment.charAt(0) == ' ') {
        cookieSegment = cookieSegment.substring(1, cookieSegment.length);
      }
      // Since request cookies don't change, we can cache it.
      var equalityIndex = cookieSegment.indexOf('=');
      var cookieName = cookieSegment.substring(0, equalityIndex);
      var cookieVal = cookieSegment.substring(equalityIndex+1, cookieSegment.length);
      this._cookies[cookieName] = cookieVal;
    }
  }
}