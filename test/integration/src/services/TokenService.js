import Service from 'soya/lib/data/redux/Service';
import request from 'superagent';
import Cookie from 'soya/lib/http/Cookie';

var SESSION_TOKEN_COOKIE = 'session';
var LIFETIME_TOKEN_COOKIE = 'lifetime';

/**
 * @CLIENT_SERVER
 */
export default class TokenService extends Service {
  static id() {
    return 'token';
  }

  /**
   * @returns {?string}
   */
  fetchLifetimeTokenFromCookie() {
    return this.cookieJar.read(LIFETIME_TOKEN_COOKIE);
  }

  /**
   * @returns {?string}
   */
  fetchSessionTokenFromCookie() {
    return this.cookieJar.read(SESSION_TOKEN_COOKIE);
  }

  /**
   * @return {Promise}
   */
  fetchLifetimeSessionToken() {
    return new Promise((resolve, reject) => {
      request.get(`http://${this.config.apiHost}/api/context`).end((err, res) => {
        if (res.ok) {
          var payload = JSON.parse(res.text);
          var sessionToken = payload.session;
          var lifetimeToken = payload.lifetime;
          var sessionCookie = Cookie.createSession(SESSION_TOKEN_COOKIE, sessionToken);
          var lifetimeCookie = Cookie.createExpireInDays(LIFETIME_TOKEN_COOKIE, lifetimeToken, 10 * 360);
          this.cookieJar.set(sessionCookie);
          this.cookieJar.set(lifetimeCookie);
          resolve(payload);
        } else {
          reject(new Error('Unable to fetch tokens!'));
        }
      });
    });
  }
}