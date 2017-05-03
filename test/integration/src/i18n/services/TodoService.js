import Service from 'soya/lib/data/redux/Service';
import request from 'superagent';
import { TODO_SERVICE } from '../constants/TodoConstant';

class TodoService extends Service {
  static id() {
    return TODO_SERVICE;
  }

  fetchTodos() {
    return new Promise((resolve, reject) => {
      request
        .get(`http://${this.config.apiHost}/api/todo`)
        .end((err, res) => {
          if (err) {
            reject(err || new Error('Something went wrong'));
          } else {
            resolve(JSON.parse(res.text));
          }
        });
    });
  }
}

export default TodoService;
