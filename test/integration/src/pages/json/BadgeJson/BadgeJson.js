import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer.js';
import register from 'soya/lib/client/Register';

import badgeJson from './data.js';

class BadgeJson extends Page {
  static get pageName() {
    return 'BadgeJson';
  }

  render(httpRequest, routeArgs, store, callback) {
    var jsonRenderer, renderResult;
    jsonRenderer = new JsonRenderer(badgeJson);
    renderResult = new RenderResult(jsonRenderer);

    // Simulate network delay of 3 seconds.
    setTimeout(callback.bind({}, renderResult), 100);
  }
}

register(BadgeJson, __filename);
export default BadgeJson;