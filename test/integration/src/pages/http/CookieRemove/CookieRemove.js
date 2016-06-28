import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer.js';
import register from 'soya/lib/client/Register';

import style from '../../../shared/sitewide.css';

class Component extends React.Component {
  render() {
    return <div>
      <h1>Cookie Server-Side Removal</h1>
      <ul>
        <li>Response should clear the 10-years cookie <code>decade</code> and session cookie <code>one-night-stand</code>.</li>
        <li>Cookies should be cleared with response headers.</li>
      </ul>
    </div>;
  }
}

class CookieRemove extends Page {
  static get pageName() {
    return 'CookieRemove';
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Cookie Server Removal</title>';
    reactRenderer.body = React.createElement(Component, {
      config: this.config
    });
    this.cookieJar.remove('decade');
    this.cookieJar.remove('one-night-stand');
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(CookieRemove, __filename);
export default CookieRemove;