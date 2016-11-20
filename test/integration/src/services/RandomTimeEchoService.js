import Service from 'soya/lib/data/redux/Service';
import request from 'superagent';

export default class RandomTimeEchoService extends Service {
  static id() {
    return 'echo';
  }

  echoInRandomTime(string) {
    return new Promise((resolve, reject) => {
      request.get(`http://${this.config.apiHost}/api/random-time-echo/` + encodeURIComponent(string)).end((err, res) => {
        if (res.ok) {
          var payload = JSON.parse(res.text);
          resolve(payload);
        } else {
          reject(new Error('Unable to fetch random time echo!'));
        }
      });
    });
  }
}