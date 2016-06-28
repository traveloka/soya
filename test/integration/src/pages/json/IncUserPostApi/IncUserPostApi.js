import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer.js';
import register from 'soya/lib/client/Register';

import userJson from '../UserJson/data.js';

class IncUserPostApi extends Page {
  static get pageName() {
    return 'IncUserPostApi';
  }

  render(httpRequest, routeArgs, store, callback) {
    var username = routeArgs.username;
    var jsonRenderer, renderResult;
    if (userJson.hasOwnProperty(username)) {
      userJson[username].posts++;
      jsonRenderer = new JsonRenderer(true);
      renderResult = new RenderResult(jsonRenderer);
    } else {
      jsonRenderer = new JsonRenderer(false);
      renderResult = new RenderResult(jsonRenderer);
      renderResult.setStatusCode(404);
    }

    // Simulate network delay of 3 seconds.
    setTimeout(callback.bind({}, renderResult), 250);
  }
}

register(IncUserPostApi, __filename);
export default IncUserPostApi;