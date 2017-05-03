import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer';

class TodoAPI extends Page {
  static get pageName() {
    return 'TodoAPI';
  }

  render(req, routeArgs, store, callback) {
    const jsonRenderer = new JsonRenderer([
      'Use React',
      'Use Create React App',
    ]);
    setTimeout(callback.bind(null, new RenderResult(jsonRenderer)), Math.random() * 500);
  }
}

export default TodoAPI;
