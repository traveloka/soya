/**
 * @SERVER
 */
export default class IncomingRequest {

  /**
   * @return {*}
   */
  getInnerRequest() { throw new Error('Class not implemented!'); }

  /**
   * @return {string}
   */
  getHost() { throw new Error('Class not implemented!'); }

  /**
   * @return {string}
   */
  getDomain() { throw new Error('Class not implemented!'); }

  /**
   * @return {string}
   */
  getMethod() { throw new Error('Class not implemented!'); }

  /**
   * @return {string}
   */
  getPath() { throw new Error('Class not implemented!'); }

}