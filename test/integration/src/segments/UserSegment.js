import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment.js';
import Thunk from 'soya/lib/data/redux/Thunk.js';

// TODO: Figure out how to do polyfill.
// TODO: Figure out how to load client-side libraries like jQuery!
import request from 'superagent';

import { UserSegmentId } from './ids.js';

export default class UserSegment extends MapSegment {
  static id() {
    return UserSegmentId;
  }

  _generateQueryId(query) {
    return query.username;
  }
  
  _isLoadQuery() {
    return true;
  }

  _generateThunkFunction(thunk) {
    var query = thunk.query;
    var queryId = thunk.queryId;
    thunk.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        request.get('http://localhost:8000/api/user/' + query.username).end((err, res) => {
          if (res.ok) {
            var payload = JSON.parse(res.text);
            dispatch(this._createSyncLoadActionObject(queryId, payload));
            resolve();
          } else {
            reject(new Error('Unable to fetch user data!'));
          }
        });
      });
      return result;
    };
  }

  _processRefreshRequests(segmentState, refreshRequests) {
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