/**
 * Generates component browser search page.
 *
 * @param {Object} components
 * @return {string}
 * @SERVER
 */
export default function generateSearchPage(components) {
  var result = `import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import register from 'soya/lib/client/Register';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer';
import ReduxStore from 'soya/lib/data/redux/ReduxStore.js';

import ListPageComponent from 'soya/lib/browser/ListPageComponent.js';
var componentMap = ${JSON.stringify(components)};
`;

  var vendor, componentName, i = 0;
  for (vendor in components) {
    for (componentName in components[vendor]) {
      result += `
import Component${i} from '../../${components[vendor][componentName].thumbnail}';`;
      if (components[vendor][componentName].doc) {
        result += `
import Doc${i} from '../../${components[vendor][componentName].doc}';
componentMap[${JSON.stringify(vendor)}][${JSON.stringify(componentName)}].doc = Doc${i};`;
      }
      result += `
componentMap[${JSON.stringify(vendor)}][${JSON.stringify(componentName)}].thumbnail = Component${i};`;
      i++;
    }
  }

  result += `

class CmptBrowserSearchPage extends Page {
  static get pageName() {
    return 'CmptBrowserSearchPage';
  }
  
  // TODO: Major abstraction leakage, how come we can know that the user is using ReduxStore?
  createStore(initialState) {
    var reduxStore = new ReduxStore(Promise, initialState, this.config, this.cookieJar);
    return reduxStore;
  }
  
  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Component Browser</title>';
    reactRenderer.body = React.createElement(ListPageComponent, {
      context: {
        reduxStore: store,
        config: this.config
      },
      router: this.router,
      componentMap: componentMap
    });
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(CmptBrowserSearchPage);
export default CmptBrowserSearchPage;`;

  return result;
};