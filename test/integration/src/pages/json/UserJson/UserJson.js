import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer.js';
import register from 'soya/lib/client/Register';

import userJson from './data.js';
import badgeJson from '../BadgeJson/data.js';

var notFound = {
  error: 'Username does not exist.'
};

class UserJson extends Page {
  static get pageName() {
    return 'UserJson';
  }

  render(httpRequest, routeArgs, store, callback) {
    var username = routeArgs.username, user;
    var jsonRenderer, renderResult;
    if (userJson.hasOwnProperty(username)) {
      user = userJson[username];
      if (user.posts <= 5) {
        user.badge = badgeJson.low;
      } else if (user.posts <= 10) {
        user.badge = badgeJson.medium;
      } else {
        user.badge = badgeJson.high;
      }
      jsonRenderer = new JsonRenderer(userJson[username]);
      renderResult = new RenderResult(jsonRenderer);
    } else {
      jsonRenderer = new JsonRenderer(notFound);
      renderResult = new RenderResult(jsonRenderer);
      renderResult.setStatusCode(404);
    }

    // Simulate network delay of 3 seconds.
    setTimeout(callback.bind({}, renderResult), 3000);
  }
}

register(UserJson, __filename);
export default UserJson;