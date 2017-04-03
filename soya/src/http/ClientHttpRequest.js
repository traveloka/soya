/**
 * TODO: A better abstraction for HttpRequest.
 *
 * @CLIENT
 */
export default class ClientHttpRequest {
  /**
   * @type {Element}
   */
  _element;

  constructor() {
    this._element = document.createElement('A');
    this._element.href = window.location.href;
  }

  /**
   * @param {string} givenHostPath
   * @returns {boolean}
   */
  startsWith(givenHostPath) {
    var hostPath = this._element.host + this._element.pathname;
    return givenHostPath.substr(0, hostPath.length) == hostPath;
  }

  /**
   * @returns {boolean}
   */
  isSecure() {
    return this._element.protocol == 'https:';
  }

  getHeaders() {
    // Page class should not read headers.
    // TODO: Implement a filter system that can add request-and-domain-based arguments reusable in both server and client side. Example usage: authentication filter.
    throw new Error('HttpRequest: getHeaders called in client context.');
  }

  /**
   * @returns {string}
   */
  getDomain() {
    // TODO: Implement.
    return '';
  }

  /**
   * @returns {number}
   */
  getPort() {
    // TODO: Implement.
    return 80;
  }

  /**
   * @returns {string}
   */
  getHost() {
    return this._element.host;
  }

  /**
   * @returns {string}
   */
  getPath() {
    return this._element.pathname;
  }

  /**
   * @returns {string}
   */
  getUrl() {
    return this._element.href;
  }

  /**
   * @returns {string}
   */
  getQuery() {
    return this._element.search.substring(1);
  }

  /**
   * @return {string}
   */
  getHash() {
    let hashString = this._element.hash;
    if (hashString.length > 0 && hashString[0] === '#') {
      return hashString.slice(1, hashString.length);
    }
    return hashString;
  }
}
