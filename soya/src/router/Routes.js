/**
 * Used to register routes in routes.js file. Would only be run at server-side,
 * only portion of the data would be available for reverse routing at client.
 *
 * @SERVER
 */
class Routes {
  /**
   * @type {Object}
   */
  _routes;

  /**
   * @type {string}
   */
  _notFoundRoutePageName;

  /**
   * @type {Object<string, boolean>}
   */
  _pages;

  constructor() {
    this._routes = {};
    this._pages = {};
  }

  /**
   * @param {string} routeId
   * @return {boolean}
   */
  hasRoute(routeId) {
    return this._routes.hasOwnProperty(routeId);
  }

  /**
   * @param routeId
   * @returns {Object}
   */
  getRoute(routeId) {
    return this._routes[routeId];
  }

  /**
   * @returns {Object<string, boolean>}
   */
  getPages() {
    return this._pages;
  }

  /**
   * @param {string} routeId
   * @param {Function} pageClass
   * @param {Array<Array<any>>} nodes
   */
  add(routeId, pageClass, ...nodes) {
    this._validatePage(routeId, pageClass);
    this._routes[routeId] = {
      page: pageClass.pageName,
      nodes: nodes
    };
  }

  /**
   * Add default page to be returned for requests that can't be routed.
   *
   * @param {Function} pageClass
   */
  addNotFoundPage(pageClass) {
    this._validatePage('__404', pageClass);
    this._notFoundRoutePageName = pageClass.pageName;
  }

  /**
   * @param {Router} router
   * @param {ReverseRouter} reverseRouter
   */
  register(router, reverseRouter) {
    router.set404NotFoundPage(this._notFoundRoutePageName);
    var routeId, route;
    for (routeId in this._routes) {
      route = this._routes[routeId];
      router.reg(routeId, route);
      reverseRouter.reg(routeId, route);
    }
  }

  /**
   * Ensure page is valid and there are no page name clashes.
   *
   * @param {string} routeId
   * @param {Function} clazz
   */
  _validatePage(routeId, clazz) {
    if (typeof clazz != 'function') {
      throw new Error('Unable to load page, not a function. Route ID: \'' + routeId + '\'');
    }
    if (typeof clazz.prototype.render != 'function') {
      throw new Error('Page class doesn\'t implement render(). Route ID: \'' + routeId + '\'.');
    }
    if (!clazz.pageName) {
      throw new Error('Page class doesn\'t have static name property. Route ID: \'' + routeId + '\'.');
    }

    var pageName = clazz.pageName;
    if (!this._pages.hasOwnProperty(pageName)) {
      this._pages[pageName] = clazz;
    } else if (this._pages[pageName] !== clazz) {
      throw new Error('Page name clash for: \'' + pageName + '\'. Class: ' + clazz + ' + and: ' + this._pages[pageName]);
    }
  }
}

var routes = new Routes();
export default routes;