import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Thunk from 'soya/lib/data/redux/Thunk.js';

// TODO: Figure out how to do polyfill.
// TODO: Figure out how to load client-side libraries like jQuery!
import request from 'superagent';

import { AirportListSegmentId } from './ids.js';

export default class AirportListSegment extends MapSegment {
  static id() {
    return AirportListSegmentId;
  }

  _generateQueryId(query) {
    // We only have one possible query.
    return '*';
  }

  _isLoadQuery() {
    return true;
  }

  _generateThunkFunction(thunk) {
    var queryId = thunk.queryId;
    thunk.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        request.get('http://localhost:8000/api/airport/list').end((err, res) => {
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
}