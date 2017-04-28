import RenderResult from './RenderResult.js';
import ServerHttpRequest from '../http/ServerHttpRequest.js';
import ClientHttpRequest from '../http/ClientHttpRequest.js';
import smokesignals from '../event/smokesignals.js';

/**
 * Represents a web page with URL link. There are three different situations
 * where this class is used:
 *
 * 1. At server side, to generate HTML string.
 * 2. At client side after HTML is loaded, to create the main react element
 *    with the appropriate props so that it can start attaching event handlers.
 * 3. At client side at dynamic page change, to modify <head>, add JS and CSS
 *    dependencies, and render the main react component (history API navigation).
 *
 * NOTE: New instances of Page is created to serve each request. If your Page
 * has dependencies that are not request-specific, you can use Provider to
 * cache it - it should be available to all classes.
 *
 * @CLIENT-SERVER
 */
export default class Page {
  /**
   * @type {Object}
   */
  config;

  /**
   * @type {ReverseRouter}
   */
  router;

  /**
   * @type {boolean}
   */
  inServer;

  /**
   * @type {CookieJar}
   */
  cookieJar;

  /**
   * This method is run in both server and client side. This method should
   * instantiate all dependencies using the given config object and static
   * factories. The logic that it does should be the same since dependency
   * creation is offload to static factories, which are replaced by their
   * client side version at code compilation process.
   *
   * NOTE: Since Page is supposed to be stateless, init method is not given any
   * request context. You are supposed to only instantiate dependencies that
   * are reusable in all requests.
   *
   * @param {Provider} provider
   * @param {CookieJar} cookieJar
   * @param {boolean} isServerInstance
   */
  constructor(provider, cookieJar, isServerInstance) {
    this.config = provider.getConfig();
    this.router = provider.getRouter();
    this.cookieJar = cookieJar;
    this.inServer = isServerInstance;
  }

  /**
   * Returns page name. Page name must be the same as the name of the file and
   * the name of the class.
   *
   * @returns {string}
   */
  static get pageName() {
    throw new Error('Page name not implemented!');
  }

  /**
   * Returns an array of string IDs. This method specifies IDs of routes that
   * this page wanted to use for reverse-routing (URL generation).
   *
   * @optional
   * @returns {Array<string>}
   */
  static getRouteRequirements() {
    return [];
  }

  /**
   * Returns a string that represents the store instance namespace that this
   * page uses. This is useful if your web application pages uses different
   * store namespaces throughout different pages, as this means upon rendering
   * Soya's client code can pass you a cached store instance so you can reuse
   * loaded data.
   *
   * @optional
   * @returns {string}
   */
  static getStoreNamespace() {
    return '__default';
  }

  /**
   * Returns Store instance. Should be overridden if this Page needs to be
   * hydrated. Otherwise return null.
   *
   * The reason this method is separated from render is because we want to
   * reuse Store instance in case of history API navigation or hot-loading.
   * This means that this method may not be called if we already have an
   * instantiated store namespace for that page.
   *
   * @param {Object} initialState
   * @returns {void | Store}
   */
  createStore(initialState) {
    return null;
  }

  /**
   * Create an event emitter that can be used by different components send
   * and receive events between each other.
   *
   * @return {any}
   */
  createEventEmitter() {
    var object = {};
    smokesignals.convert(object);
    return object;
  }

  /**
   * Default context object to be passed down to components that listens to
   * state changes or events. Also contains client configuration and router.
   * Context objects should be created per render.
   *
   * @param {Store} store
   * @param {?Object} otherContext
   * @returns {Object}
   */
  createContext(store, otherContext = {}) {
    return {
      ...otherContext,
      reduxStore: store, // For backwards compatibility, don't use this! Use context.store instead!
      store: store,
      router: this.router,
      config: this.config,
      cookieJar: this.cookieJar,
      emitter: this.createEventEmitter()
    }
  }

  /**
   * This method is also run in both server and client side. On server side,
   * framework code will generate a complete HTML document from RenderResult.
   * On client side, framework will just run the instantiated ReactComponent.
   *
   * NOTE: We need to use callback because we don't want the framework code
   * to depend on third party promise library.
   *
   * @param {ServerHttpRequest | ClientHttpRequest} httpRequest
   * @param {Object} routeArgs
   * @param {void | any} store
   * @param {Function} complete
   */
  render(httpRequest, routeArgs, store, complete) {
    complete(new RenderResult());
  }
}
