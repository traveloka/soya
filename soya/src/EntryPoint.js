/**
 * @SERVER
 */
export default class EntryPoint {
  /**
   * @type {string}
   */
  name;

  /**
   * @type {string}
   */
  absolutePath;

  /**
   * @param {string} name
   * @param {string} absolutePath
   */
  constructor(name, absolutePath) {
    this.absolutePath = absolutePath;
    this.name = name;
  }
}
