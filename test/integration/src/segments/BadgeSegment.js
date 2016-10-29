import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Thunk from 'soya/lib/data/redux/Thunk';

// TODO: Figure out how to do polyfill.
// TODO: Figure out how to load client-side libraries like jQuery!
import request from 'superagent';

import { BadgeSegmentId } from './ids.js';

export default class BadgeSegment extends MapSegment {
  static id() {
    return BadgeSegmentId;
  }

  _generateQueryId(query) {
    return '*';
  }

  _isLoadQuery() {
    return true;
  }

  _generateThunkFunction(thunk) {
    var queryId = thunk.queryId;
    thunk.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        request.get('http://localhost:8000/api/user/badge/list').end((err, res) => {
          if (res.ok) {
            var payload = JSON.parse(res.text);
            dispatch(this._createSyncLoadActionObject(queryId, payload));
            resolve();
          } else {
            reject(new Error('Unable to fetch badge data!'));
          }
        });
      });
      return result;
    };
  }

  _processRefreshRequests(segmentState, refreshRequests) {
    // Since there is only one API that updates this segment, we can go crazy.
    return ['*']
  }
}