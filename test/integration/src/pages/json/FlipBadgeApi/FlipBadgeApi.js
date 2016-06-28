import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer.js';
import register from 'soya/lib/client/Register';

import badgeJson from '../BadgeJson/data.js';

class FlipBadgeApi extends Page {
  static get pageName() {
    return 'FlipBadgeApi';
  }

  render(httpRequest, routeArgs, store, callback) {
    if (badgeJson.low == 'Newbie') {
      badgeJson.low = 'Low';
      badgeJson.medium = 'Medium';
      badgeJson.high = 'High';
    } else {
      badgeJson.low = 'Newbie';
      badgeJson.medium = 'Lieutenant';
      badgeJson.high = 'Captain';
    }
    var jsonRenderer, renderResult;
    jsonRenderer = new JsonRenderer(true);
    renderResult = new RenderResult(jsonRenderer);

    // Simulate network delay of 3 seconds.
    setTimeout(callback.bind({}, renderResult), 250);
  }
}

register(FlipBadgeApi, __filename);
export default FlipBadgeApi;