/**
 * @CLIENT_SERVER
 */
export default class Hydration {
  /**
   * @type {number}
   */
  _importance;

  /**
   * @type {boolean}
   */
  _hydrateAtServer;

  constructor(importance, hydrateAtServer) {
    this._importance = importance;
    this._hydrateAtServer = hydrateAtServer;
  }

  shouldHydrateAtServer() {
    return this._hydrateAtServer;
  }

  /**
   * Returns the one with more importance.
   *
   * @param {Hydration} hydration
   * @returns {Hydration}
   */
  clash(hydration) {
    if (this._importance >= hydration._importance) {
      return this;
    }
    return hydration;
  }

  static hydrateAtServer(importance) {
    if (importance == null) importance = 1;
    return new Hydration(importance, true);
  }

  static noopAtServer(importance) {
    if (importance == null) importance = 1;
    return new Hydration(importance, false);
  }
}