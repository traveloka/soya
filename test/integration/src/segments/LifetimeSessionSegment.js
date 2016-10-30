import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Cookie from 'soya/lib/http/Cookie';
import Load from 'soya/lib/data/redux/Load';

// TODO: Figure out how to do polyfill.
// TODO: Figure out how to load client-side libraries like jQuery!
import request from 'superagent';

import { LifetimeSessionSegmentId } from './ids.js';

var SESSION_COOKIE_NAME = 'session';
var LIFETIME_COOKIE_NAME = 'lifetime';

export default class LifetimeSessionSegment extends MapSegment {
  static id() {
    return LifetimeSessionSegmentId;
  }

  _generateQueryId(query) {
    return 'default';
  }

  _createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load();
    var lifetimeCookie = this._cookieJar.read(LIFETIME_COOKIE_NAME);
    var sessionCookie = this._cookieJar.read(SESSION_COOKIE_NAME);
    if (lifetimeCookie != null && sessionCookie != null) {
      // Just re-use what we already have in cookie.
      load.func = (dispatch) => {
        dispatch(this._createSyncLoadActionObject(queryId, {
          lifetime: lifetimeCookie,
          session: sessionCookie
        }));
        return Promise.resolve(null);
      };
      return;
    }

    load.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        request.get('http://localhost:8000/api/context').end((err, res) => {
          if (res.ok) {
            var payload = JSON.parse(res.text);
            dispatch(this._createSyncLoadActionObject(queryId, payload));
            var sessionCookie = Cookie.createSession(SESSION_COOKIE_NAME, payload.session);
            var lifetimeCookie = Cookie.createExpireInDays(LIFETIME_COOKIE_NAME, payload.lifetime, 10 * 360);
            this._cookieJar.set(sessionCookie);
            this._cookieJar.set(lifetimeCookie);
            resolve();
          } else {
            reject(new Error('Unable to fetch user data!'));
          }
        });
      });
      return result;
    };
    return load;
  }
}