/**
 * @CLIENT_SERVER
 */
export default class QueryResult {
  /**
   * @type {boolean}
   */
  loaded;

  /**
   * @type {any}
   */
  data;

  static notLoaded() {
    return new QueryResult(false, null);
  }

  static loaded(data) {
    return new QueryResult(true, data);
  }

  /**
   * @param {boolean} loaded
   * @param {any} data
   */
  constructor(loaded, data) {
    this.loaded = loaded;
    this.data = data;
  }
}