import ReverseRouter from '../router/ReverseRouter.js';
import NodeFactory from '../router/NodeFactory.js';
import DomainNode from '../router/DomainNode.js';
import MethodNode from '../router/MethodNode.js';
import PathNode from '../router/PathNode.js';
import ClientHttpRequest from '../http/ClientHttpRequest.js';
import ClientCookieJar from '../http/ClientCookieJar.js';
import Provider from '../Provider.js';

// The reason we use full path is to make webpack's resolve.alias work.
// We need to replace custom node registration with user file so that
// custom nodes can be loaded in both client and server side.
import registerRouterNodes from 'soya/lib/server/registerRouterNodes';

/**
 * Responsible for client runtime.
 *
 * @CLIENT
 */
export default class SoyaClient {
  /**
   * @type {{[key: string]: Page}}
   */
  _pages;

  /**
   * @type {void | string}
   */
  _currentPageName;

  /**
   * @type {void | {httpRequest: ClientHttpRequest; routeArgs: Object; hydratedState: Object}}
   */
  _currentPageArgs;

  /**
   * @type {Function}
   */
  _currentPageDismantle;

  /**
   * @type {Object}
   */
  _clientConfig;

  /**
   * @type {ReverseRouter}
   */
  _reverseRouter;

  /**
   * @type {Provider}
   */
  _provider;

  /**
   * @type {{[key: string]: Store}}
   */
  _storeCache;

  /**
   * @type {ClientCookieJar}
   */
  _cookieJar;

  /**
   * @param {Object} clientConfig
   */
  constructor(clientConfig) {
    this._clientConfig = clientConfig;
    this._cookieJar = new ClientCookieJar();
    var nodeFactory = new NodeFactory();
    nodeFactory.registerNodeType(DomainNode);
    nodeFactory.registerNodeType(MethodNode);
    nodeFactory.registerNodeType(PathNode);
    // TODO: Make sure swapping for custom nodes also work at client side.
    registerRouterNodes(nodeFactory);

    this._reverseRouter = new ReverseRouter(nodeFactory);
    this._provider = new Provider(clientConfig, this._reverseRouter, false);
    this._pages = {};
    this._storeCache = {};
  }

  /**
   * @param {{[key: string]: Array<Array<any>>}} routeConfigMap
   */
  addRouteConfig(routeConfigMap) {
    if (!routeConfigMap) return;
    var routeId;
    for (routeId in routeConfigMap) {
      if (!routeConfigMap.hasOwnProperty(routeId)) continue;
      this._reverseRouter.reg(routeId, routeConfigMap[routeId]);
    }
  }

  /**
   * @param {Function} pageClass
   */
  register(pageClass) {
    // We do overrides just in case there are updates.
    // TODO: Figure out history API navigation.
    this._pages[pageClass.pageName] = pageClass;

    if (this._currentPageName == pageClass.pageName) {
      // If a registration is made for currently active page, it means we're
      // hot-reloading. TODO: Reconcile this with history API navigation later.
      this.refresh();
    }
  }

  /**
   * Re-run rendering for the current page.
   */
  refresh() {
    var pageClass = this._getPageClass(this._currentPageName);
    var pageArgs = this._currentPageArgs;
    if (!pageArgs) {
      throw new Error('Unable to refresh, current page arguments does not exist!');
    }
    this._dismantleCurrentPage();
    this._render(pageClass, pageArgs);
  }

  /**
   * @param {string} name
   * @param {Object} routeArgs
   * @param {?any} hydratedState
   */
  navigate(name, routeArgs, hydratedState) {
    this._currentPageName = name;
    this._currentPageArgs = null;

    var pageClass = this._getPageClass(name);
    var httpRequest = new ClientHttpRequest();
    var pageArgs = {
      httpRequest: httpRequest,
      routeArgs: routeArgs,
      hydratedState: hydratedState
    };
    this._currentPageArgs = pageArgs;
    this._dismantleCurrentPage();
    this._render(pageClass, this._currentPageArgs);
  }

  /**
   * @param {Function} pageClass
   * @param {Object} pageArgs
   */
  _render(pageClass, pageArgs) {
    // Create new page instance - dependencies should be fetched and cached
    // by Provider.
    var page = new pageClass(this._provider, this._cookieJar, false);
    var storeNamespace = this._getPageStoreNamespace(pageClass);

    var store = this._storeCache[storeNamespace];
    if (!store) {
      store = page.createStore(pageArgs.hydratedState);
    }
    var hasStore = !!store;

    if (hasStore) {
      this._storeCache[storeNamespace] = store;
      if (module.hot) {
        store._mayHotReloadSegments();
      }
    }

    page.render(pageArgs.httpRequest, pageArgs.routeArgs,
      store, this._renderCallback.bind(this, store));
  }

  /**
   * Extract state from the currently active store.
   *
   * @return {any}
   */
  _extractState() {
    var store = this._getCurrentStore();
    return store._getState();
  }

  /**
   * @param {any} newState
   */
  _replaceState(newState) {
    var store = this._getCurrentStore();
    store._replaceState(newState);
  }

  /**
   * @param {void | Store} store
   * @param {RenderResult} renderResult
   */
  _renderCallback(store, renderResult) {
    // Start rendering, this also do Segment registrations.
    window.renderResult = renderResult;
    if (store) store._startRender();
    this._currentPageDismantle = renderResult.contentRenderer.render();
    if (store) store._endRender();
  }

  /**
   * @param {string} name
   */
  _getPageClass(name) {
    var pageClass = this._pages[name];
    if (!pageClass) {
      throw new Error('Call to non-existent or non-loaded page: ' + name);
    }
    return pageClass;
  }

  /**
   * @param {Page} pageClass
   * @return {string}
   */
  _getPageStoreNamespace(pageClass) {
    var storeNamespace = '__default';
    if (typeof pageClass.getStoreNamespace == 'function') {
      storeNamespace = pageClass.getStoreNamespace();
    }
    return storeNamespace;
  }

  /**
   * @returns {Store}
   */
  _getCurrentStore() {
    var pageClass = this._getPageClass(this._currentPageName);
    var storeNamespace = this._getPageStoreNamespace(pageClass);
    return this._storeCache[storeNamespace];
  }

  _dismantleCurrentPage() {
    if (this._currentPageDismantle) this._currentPageDismantle();
  }
}
