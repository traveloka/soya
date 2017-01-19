import SoyaClient from './SoyaClient';

// Ensures that webpack hot-reload client does not get loaded more than once.
if (module.hot && !window.__hotReload) {
  window.__hotReload = require('webpack-hot-middleware/client');
}

/**
 * @CLIENT
 * @param {Page} pageClass
 */
export default function register(pageClass) {
  // TODO: This won't work on older IEs? Logger for client? Log only when debug framework config is set to true?
  //console.log('[REGISTER] Page register', pageClass);
  if (!window.__soyaClient) {
    //console.log('[REGISTER] Initializing SoyaClient');
    // This follows an implicit contract between renderer and client runtime.
    // Config and RouteArgs must be present as a global variable.
    // Haven't found the better way to do this yet.
    var config = window.config;
    var routeArgs = window.routeArgs;
    var routes = window.routes;
    var hydratedState = window.hydratedState;

    // Start and load the page.
    window.__soyaClient = new SoyaClient(config);
    window.__soyaClient.addRouteConfig(routes);
    window.__soyaClient.register(pageClass);
    window.__soyaClient.navigate(pageClass.pageName, routeArgs, hydratedState);
    return;
  }

  // TODO: Implement History API page navigation!
  window.__soyaClient.register(pageClass);
}