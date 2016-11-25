import Service from 'soya/lib/data/redux/Service';
import request from 'superagent';

export default class UserService extends Service {
  static id() {
    return 'user';
  }

  fetchUserProfile(username) {
    return new Promise((resolve, reject) => {
      var url = `http://${this.config.apiHost}/api/user/` + username;
      request.get(url).end((err, res) => {
        if (res.ok) {
          var payload = JSON.parse(res.text);
          resolve(payload);
        } else {
          console.log(url);
          reject(err);
        }
      });
    });
  }
}