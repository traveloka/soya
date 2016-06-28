import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer.js';
import register from 'soya/lib/client/Register';

import userJson from '../UserJson/data.js';

class ResetUserPostApi extends Page {
  static get pageName() {
    return 'ResetUserPostApi';
  }

  render(httpRequest, routeArgs, store, callback) {
    var resetNumber = routeArgs.number;
    var key;
    for (key in userJson) {
      if (!userJson.hasOwnProperty(key)) continue;
      userJson[key].posts = parseInt(resetNumber, 10);
    }
    var jsonRenderer, renderResult;
    jsonRenderer = new JsonRenderer(true);
    renderResult = new RenderResult(jsonRenderer);

    // Simulate network delay of 3 seconds.
    setTimeout(callback.bind({}, renderResult), 250);
  }
}

register(ResetUserPostApi, __filename);
export default ResetUserPostApi;