/**
 * A Base-class for Websocket page
 * @SERVER
 */
export default class WSPage {

  constructor() {

  }

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
   * @param {Socket} socket
   */
  render(socket) {

  }
}