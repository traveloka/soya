var url = require('url');
import IncomingRequest from '../server/IncomingRequest';

/**
 * @SERVER
 */
export default class ServerWSRequest extends IncomingRequest {

  /**
   * @type {Object}
   */
  _request;

  /**
   * @type {Object}
   */
  _handshake;

  /**
   * @type {Object}
   */
  _parsedNamespace;

  /**
   * @param {io.Socket} socket
   */
  constructor(socket) {
    super();
    this._request = socket.conn.request;
    this._handshake = socket.handshake;

    var strNamespace = decodeURIComponent(socket.handshake.query.namespace);
    this._parsedNamespace = url.parse(strNamespace);
  }

  /**
   * @return {Object}
   */
  getInnerRequest() {
    return this._request;
  }

  /**
   * @return {Object}
   */
  getHandshake() {
    return this._handshake;
  }

  /**
   * @return {string}
   * @override
   */
  getHost() {
    return this._request.headers.host;
  }

  /**
   * @return {string}
   * @override
   */
  getDomain() {
    var hostSplit = this.getHost().split(':');
    return hostSplit[0].trim();
  }

  /**
   * @return {string}
   * @override
   */
  getMethod() {
    return this._request.method;
  }

  /**
   * @return {string}
   * @override
   */
  getPath() {
    return this._parsedNamespace.pathname;
  }

}