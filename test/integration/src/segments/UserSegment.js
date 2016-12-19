import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Load from 'soya/lib/data/redux/Load';

import UserService from '../services/UserService.js';
import { UserSegmentId } from './ids.js';

export default class UserSegment extends MapSegment {
  static id() {
    return UserSegmentId;
  }

  static generateQueryId(query) {
    return query.username;
  }

  static getServiceDependencies() {
    return [UserService];
  }

  static createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load(UserSegment.id());
    load.func = (dispatch, queryFunc, services) => {
      var userService = services[UserService.id()];
      return new Promise((resolve, reject) => {
        userService.fetchUserProfile(query.username).then((payload) => {
          dispatch(this.getActionCreator().set(queryId, payload));
          resolve();
        }).catch(reject);
      });
    };
    return load;
  }

  static processRefreshRequests(segmentState, refreshRequests) {
    var i, result = [];
    if (refreshRequests == '*') {
      // Update all fetched user data.
      for (i in segmentState) {
        if (!segmentState.hasOwnProperty(i)) continue;
        result.push({username: i});
      }
      return result;
    }

    // We expect refresh requests to be an array, if not '*'.
    for (i = 0; i < refreshRequests.length; i++) {
      if (!segmentState.hasOwnProperty(refreshRequests[i])) continue;
      result.push({username: refreshRequests[i]});
    }
    return result;
  }
}