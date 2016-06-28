import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer.js';
import register from 'soya/lib/client/Register';

const phoneRegex = /^021/;

class ValidateApi extends Page {
  static get pageName() {
    return 'ValidateApi';
  }

  render(httpRequest, routeArgs, store, callback) {
    var result = {
      isValid: true,
      message: null
    };
    switch (routeArgs.type) {
      case 'phone':
        if (!phoneRegex.test(routeArgs.value)) {
          result.isValid = false;
          result.message = 'Phone number must contain 021 (Indonesia only!).';
        }
        break;
    }
    var jsonRenderer = new JsonRenderer(result);
    var renderResult = new RenderResult(jsonRenderer);

    // Randomly decide when to return a response.
    setTimeout(callback.bind({}, renderResult), this.getRandomInt(300, 2500));
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

register(ValidateApi, __filename);
export default ValidateApi;