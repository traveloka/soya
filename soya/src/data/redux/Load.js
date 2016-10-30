/**
 * Wraps the user's thunk function so it can have dependencies, and our
 * store can execute the dependencies.
 *
 * @CLIENT_SERVER
 */
export default class Load {
  /**
   * IMPORTANT NOTE: Must return Promise that resolves after fetching and
   * updating segment is done (action is properly processed by root reducer).
   *
   * @type {Function}
   */
  func;

  /**
   * @type {QueryDependencies}
   */
  dependencies;
}