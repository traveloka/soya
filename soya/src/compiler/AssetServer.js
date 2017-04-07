import url from 'url';
import nodePath from 'path';

/**
 * Stores asset in memory. Other implementations may store in file system, etc.
 *
 * @SERVER
 */
export default class AssetServer {
  /**
   * @type {{[key: string]: any}}
   */
  assets;

  /**
   * @type {string}
   */
  domain;

  /**
   * @param {string} domain
   */
  constructor(domain) {
    this.assets = {};
    this.domain = domain;
  }

  /**
   * @param {string} path
   * @param {boolean} isSecure
   * @returns {string}
   */
  toUrl(path, isSecure): string {
    var result = !!isSecure ? 'https://' : 'http://';
    result += this.toUrlWithoutProtocol(path);
    return result;
  }

  /**
   * @param {string} path
   * @returns {string}
   */
  toUrlWithoutProtocol(path) {
    return nodePath.join(this.domain, path);
  }

  /**
   * @param {string} path
   * @param {string} protocol
   * @returns {string}
   */
  toUrlWithProtocol(path, protocol) {
    return protocol + '://' + this.toUrlWithoutProtocol(path);
  }

  /**
   * @param {string} path
   * @param {any} contents
   */
  put(path, contents) {
    this.assets[path] = contents;
  }

  /**
   * @param {ServerHttpRequest} httpRequest
   * @param {httpServerResponse} response
   * @returns {boolean}
   */
  handle(httpRequest, response) {
    var parsedUrl = url.parse(httpRequest.url);
    var content = this.get(parsedUrl.pathname);
    if (content == null) {
      // Not an asset request.
      return false;
    }
    // TODO: Handle content type headers, content size, e-tag, etc.
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end(content);
  }

  /**
   * @param {string} path
   * @returns {{size: number; content: any}}
   */
  get(path) {
    return {
      size: this.assets[path].length,
      content: this.assets[path]
    }
  }
}
