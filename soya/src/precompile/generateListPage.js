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

import style from 'soya/lib/precompile/cmpt.mod.css';
import ComponentListItem from 'soya/lib/precompile/ComponentListItem.js';

var componentMap = ${JSON.stringify(components)};
`;

  var vendor, componentName, i = 0;
  for (vendor in components) {
    for (componentName in components[vendor]) {
      result += `
import Component${i} from '../../${components[vendor][componentName].thumbnail}';`;
      result += `
componentMap[${JSON.stringify(vendor)}][${JSON.stringify(componentName)}].component = Component${i};`;
      i++;
    }
  }

  result += `

class Component extends React.Component {
  render() {
    var vendor, componentName, componentList = [];
    for (vendor in componentMap) {
      for (componentName in componentMap[vendor]) {
        componentList.push(<ComponentListItem context={this.props.context} data={componentMap[vendor][componentName]} />);
      }
    }
    return <div className={style.cbrowser}>
      <nav>
        <h1>Component Browser</h1>
        <input type="text" />
      </nav>
      <div className={style.componentList}>
        {componentList}
      </div>
    </div>;
  }
}

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
    reactRenderer.body = React.createElement(Component, {
      context: {
        reduxStore: store,
        config: this.config
      },
      router: this.router
    });
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(CmptBrowserSearchPage);
export default CmptBrowserSearchPage;`;

  return result;
};