import Service from 'soya/lib/data/redux/Service';
import request from 'superagent';

export default class UserService extends Service {
  static id() {
    return 'user';
  }

  fetchUserProfile(username) {
    return new Promise((resolve, reject) => {
      request.get(`http://${this.config.apiHost}/api/user/` + username).end((err, res) => {
        if (res.ok) {
          var payload = JSON.parse(res.text);
          resolve(payload);
        } else {
          reject(new Error('Unable to fetch user data!'));
        }
      });
    });
  }
}