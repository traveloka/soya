import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Load from 'soya/lib/data/redux/Load';

import TokenService from '../services/TokenService.js';
import { LifetimeSessionSegmentId } from './ids.js';

export default class LifetimeSessionSegment extends MapSegment {
  static id() {
    return LifetimeSessionSegmentId;
  }

  static generateQueryId(query) {
    return 'default';
  }

  static getServiceDependencies() {
    return [TokenService];
  }

  static createLoadFromQuery(query, queryId, segmentState, services) {
    var load = new Load();
    var tokenService = services[TokenService.id()];
    var lifetimeTokenCookie = tokenService.fetchLifetimeTokenFromCookie();
    var sessionTokenCookie = tokenService.fetchSessionTokenFromCookie();
    if (lifetimeTokenCookie != null && sessionTokenCookie != null) {
      // Just re-use what we already have in cookie.
      load.func = (dispatch) => {
        dispatch(this.getActionCreator().set(queryId, {
          lifetime: lifetimeTokenCookie,
          session: sessionTokenCookie
        }));
        return Promise.resolve(null);
      };
      return load;
    }

    load.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        // TODO: Don't re-fetch lifetime token if it already exists.
        tokenService.fetchLifetimeSessionToken().then((payload) => {
          dispatch(this.getActionCreator().set(queryId, payload));
          resolve();
        }).catch(reject);
      });
      return result;
    };
    return load;
  }
}