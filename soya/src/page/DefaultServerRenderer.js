import ContentRenderer from './ContentRenderer.js';

/**
 * Used to render default blank page when we disable server side rendering.
 * It only loads CSS and JS dependencies and runs soya client.
 *
 * @SERVER
 */
export default class DefaultServerRenderer extends ContentRenderer {
  render(routeArgs, routes, clientConfig, hydratedState, pageDependencies) {
    var result = '<html>';
    result += '<head>';
    if (this.head) result += this.head;

    result += '<script type="text/javascript">';
    result += 'var config = ' + JSON.stringify(clientConfig) + ';';
    result += 'var routeArgs = ' + JSON.stringify(routeArgs) + ';';
    result += 'var routes = ' + JSON.stringify(routes) + ';';
    result += 'var hydratedState = ' + JSON.stringify(hydratedState) + ';';
    result += '</script>';

    var i, url;
    for (i = 0; i < pageDependencies.cssDependencies.length; i++) {
      url = pageDependencies.cssDependencies[i];
      result += '<link rel="stylesheet" type="text/css" href="' + url + '">';
    }

    result += '</head>';
    result += '<body><div id="__body"></div>';

    for (i = 0; i < pageDependencies.jsDependencies.length; i++) {
      url = pageDependencies.jsDependencies[i];
      result += '<script type="text/javascript" src="' + url + '"></script>';
    }

    result += '</body>';
    result += '</html>';
    return result;
  }
}