import url from 'url';

/**
 * A Base-class for Websocket page
 * notes:
 * - PUBLISH : send message to other process / servers
 * - BROADCAST : send message to all connected client.
 * @SERVER
 */
export default class WSPage {

  /**
   * @type {string}
   * @private
   */
  _channel;

  /**
   * @type {function(string, string, string)}
   * @private
   */
  _publishCallback;

  /**
   * @type {Socket}
   * @protected
   */
  _socket;

  /**
   * @constructor
   */
  constructor() { }

  /**
   * Returns namespace name. Namespace name must be the same as the name of the file and
   * the name of the class.
   *
   * @returns {string}
   */
  static get pageName() {
    throw new Error('Namespace name not implemented!');
  }

  /**
   * @param {io.Socket} socket
   * @param {Object} args
   */
  render(socket, routeArgs, channel, publishCallback) {
    this._channel = channel;
    this._publishCallback = publishCallback;

    this._socket = socket;
    this._socket.on('disconnect', () => {
      console.log('[Socket Server] A Socket connection has been disconnected. @Channel: '+ this._channel);
      // TODO do publish to redish
    });
    this.bindEvent(routeArgs);
  }

  /**
   * @param {string} event
   * @param {string} message
   */
  eventDispatcher(event, message) {
    console.log('[Socket Server] Dispatch Event: '+ event +', message: '+ message +', @Channel: '+ this._channel);
  }

  /**
   * @protected
   */
  bindEvent(routeArgs) { }

  /**
   * A wrapper method to publish event
   * @param {string} event
   * @param {string} message
   * @protected
   */
  _publish(event, message) {
    this._publishCallback(this._channel, event, message);
  }

}