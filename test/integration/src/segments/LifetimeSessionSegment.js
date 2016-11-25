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

  static createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load(LifetimeSessionSegment.id());
    load.func = (dispatch, queryFunc, services) => {
      return new Promise((resolve, reject) => {
        var tokenService = services[TokenService.id()];

        // Just re-use what we already have in cookie.
        var lifetimeTokenCookie = tokenService.fetchLifetimeTokenFromCookie();
        var sessionTokenCookie = tokenService.fetchSessionTokenFromCookie();
        if (lifetimeTokenCookie != null && sessionTokenCookie != null) {
          dispatch(this.getActionCreator().set(queryId, {
            lifetime: lifetimeTokenCookie,
            session: sessionTokenCookie
          }));
          resolve();
          return;
        }

        // TODO: Don't re-fetch lifetime token if it already exists.
        tokenService.fetchLifetimeSessionToken().then((payload) => {
          dispatch(this.getActionCreator().set(queryId, payload));
          resolve();
        }).catch(reject);
      });


    };
    return load;
  }
}