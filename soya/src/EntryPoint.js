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
  rootAbsolutePath;

  /**
   * @type {string}
   */
  absolutePathToFile;

  /**
   * @param {string} name
   * @param {string} absolutePathToFile
   */
  constructor(name, absolutePathToFile) {
    this.absolutePathToFile = absolutePathToFile;
    this.name = name;
  }
}
