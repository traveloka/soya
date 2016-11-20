import Service from 'soya/lib/data/redux/Service';
import request from 'superagent';

export default class AdditionService extends Service {
  static id() {
    return 'addition';
  }

  calculateAddition(a, b) {
    return new Promise((resolve, reject) => {
      request.get(`http://${this.config.apiHost}/api/addition/` + encodeURIComponent(a) + '/' + encodeURIComponent(b)).end((err, res) => {
        if (res.ok) {
          var result = JSON.parse(res.text);
          resolve(result);
        } else {
          reject(new Error('Unable to fetch user data!'));
        }
      });
    });
  }
}