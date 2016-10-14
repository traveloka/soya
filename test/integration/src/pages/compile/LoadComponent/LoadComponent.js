import register from 'soya/lib/client/Register';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer';
import Page from 'soya/lib/page/Page';
import React from 'react';

// Import the reusable component.
import PhotoCaption from 'src/components/common/PhotoCaption/PhotoCaption.js';

// Load sitewide, shared resource.
require('../../../shared/sitewide.css');

// Get image that belong only to this page.
var url = require('./mountains.jpg');

class Component extends React.Component {
  render() {
    return <div>
      <h1>Load Component</h1>
      <h3>Load Component With CSS</h3>
      <ul>
        <li>User can load <code>PhotoCaption</code> component, without needing to inspect its dependencies.</li>
        <li><strong>TODO:</strong> Test that behavior specified in loaded component still works.</li>
        <li><strong>TODO:</strong> Test Compilation?</li>
        <li>CSS is applied to this page.</li>
      </ul>
      <h3>Mountains</h3>
      <PhotoCaption url={url} caption={"Photo by Brandon Lam"} width={300} />
    </div>;
  }
}

class LoadComponent extends Page {
  static get pageName() {
    return 'LoadComponent';
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Load Component</title>';
    reactRenderer.body = React.createElement(Component, {router: this.router});
    var renderResult = new RenderResult(reactRenderer);
    renderResult.httpHeaders.set('X-Foo', 'soya-ftw');
    callback(renderResult);
  }
}

register(LoadComponent);
export default LoadComponent;