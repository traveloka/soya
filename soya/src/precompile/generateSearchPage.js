/**
 * @param {ComponentBrowserRegister} componentBrowserRegister
 * @return {string}
 */
export default function generateSearchPage(componentBrowserRegister) {
  var result = `import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import register from 'soya/lib/client/Register';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer';

var componentList = [];`;

  var components = componentBrowserRegister.getComponents();
  var vendor, componentName, i = 0;
  for (vendor in components) {
    for (componentName in components[vendor]) {
      result += `
import Component${i} from '${components[vendor][componentName].thumbnail}';`;
      result += `
componentList.push({
   component: Component${i},
   data: ${JSON.stringify(components[vendor][componentName].detail)}
});`;
    }
  }

  result += `
class Component extends React.Component {
  render() {
    return <div>Heyho</div>;
  }
}

class CmptBrowserSearchPage extends Page {
  static get pageName() {
    return 'CmptBrowserSearchPage';
  }
  
  render() {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Component Browser</title>';
    reactRenderer.body = React.createElement(Component, {
      config: this.config,
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