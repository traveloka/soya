import Service from 'soya/lib/data/redux/Service';
import request from 'superagent';

export default class BadgeService extends Service {
  static id() {
    return 'badges';
  }

  fetchBadges() {
    return new Promise((resolve, reject) => {
      request.get(`http://${this.config.apiHost}/api/user/badge/list`).end((err, res) => {
        if (res.ok) {
          var payload = JSON.parse(res.text);
          resolve(payload);
        } else {
          reject(new Error('Unable to fetch badge data!'));
        }
      });
    });
  }
}