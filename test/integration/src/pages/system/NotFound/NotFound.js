import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer';
import register from 'soya/lib/client/Register';
import React from 'react';

// Pages can have its own separate components.
import NotFoundReactComponent from './NotFoundReactComponent.js';

// We can also import using ES6 style.
import '../../../shared/sitewide.css';

class NotFound extends Page {
  static get pageName() {
    return 'NotFound';
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Oops, not found!</title>';
    reactRenderer.body = React.createElement(NotFoundReactComponent, {});
    var renderResult = new RenderResult(reactRenderer);
    renderResult.setStatusCode(404);
    callback(renderResult);
  }
}

register(NotFound, __filename);
export default NotFound;