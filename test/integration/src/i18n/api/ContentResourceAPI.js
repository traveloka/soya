import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import JsonRenderer from 'soya/lib/page/json/JsonRenderer';

const mockData = {
  "en": {
    "Validator": {
      "empty": "Empty",
    },
    "Header": {
      "titleTodos": "Todos",
      "placeholderTodoTextInput": "What needs to be done?"
    },
    "Footer": {
      "buttonTextClearCompleted": "Clear completed",
      "filterActive": "Active",
      "filterCompleted": "Completed",
      "filterAll": "All",
      "todoCount": `
        {activeCount, plural,
          =0 {<strong>No</strong> items}
          =1 {<strong>1</strong> item}
          other {<strong>{activeCount}</strong> items}
        } left
      `
    },
  },
  "id": {
    "Validator": {
      "empty": "Kosong",
    },
    "Header": {
      "titleTodos": "Todos",
      "placeholderTodoTextInput": "Apa yang perlu dilakukan?"
    },
    "Footer": {
      "buttonTextClearCompleted": "Hapus yang selesai",
      "filterActive": "Aktif",
      "filterCompleted": "Selesai",
      "filterAll": "Semua",
      "todoCount": `
        {activeCount, plural,
          =0 {Kosong}
          other {Sisa <strong>{activeCount}</strong>}
        }
      `
    },
  },
};

class ContentResourceAPI extends Page {
  static get pageName() {
    return 'ContentResourceAPI';
  }

  render(req, { locale }, store, callback) {
    req.getBody().then(JSON.parse).then(({ data }) => {
      const jsonRenderer = new JsonRenderer({
        data: Object.keys(data).reduce((cr, name) => ({
          ...cr,
          [name]: data[name].reduce((entries, entryKey) => ({
            ...entries,
            [entryKey]: mockData[locale.language][name][entryKey],
          }), {})
        }), {}),
      });
      setTimeout(callback.bind(null, new RenderResult(jsonRenderer)), Math.random() * 500);
    });
  }
}

export default ContentResourceAPI;
