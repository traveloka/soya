import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer.js';
import register from 'soya/lib/client/Register';

class ContextJson extends Page {
  static get pageName() {
    return 'ContextJson';
  }

  render(httpRequest, routeArgs, store, callback) {
    var jsonRenderer = new JsonRenderer({
      lifetime: this.getRandomString(10),
      session: new Date().toGMTString()
    });
    var renderResult = new RenderResult(jsonRenderer);

    // Randomly decide when to return a response.
    setTimeout(callback.bind({}, renderResult), this.getRandomInt(10, 1000));
  }

  getRandomString(length) {
    var i, str = '';
    for (i = 0; i < length; i++) {
      str += String.fromCharCode(this.getRandomInt(65, 122));
    }
    return str;
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

register(ContextJson, __filename);
export default ContextJson;