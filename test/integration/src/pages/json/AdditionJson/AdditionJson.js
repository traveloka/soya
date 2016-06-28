import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer.js';
import register from 'soya/lib/client/Register';

class AdditionJson extends Page {
  static get pageName() {
    return 'AdditionJson';
  }

  render(httpRequest, routeArgs, store, callback) {
    var a = parseInt(routeArgs.a, 10);
    var b = parseInt(routeArgs.b, 10);
    var jsonRenderer = new JsonRenderer(a + b);
    var renderResult = new RenderResult(jsonRenderer);

    // Randomly decide when to return a response.
    setTimeout(callback.bind({}, renderResult), this.getRandomInt(10, 1000));
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

register(AdditionJson, __filename);
export default AdditionJson;