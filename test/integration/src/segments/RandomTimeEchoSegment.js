import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment.js';
import Thunk from 'soya/lib/data/redux/Thunk.js';

import { RandomTimeEchoSegmentId } from './ids.js';

// TODO: Figure out how to do polyfill.
// TODO: Figure out how to load client-side libraries like jQuery!
import request from 'superagent';

export default class RandomTimeEchoSegment extends MapSegment {
  static id() {
    return RandomTimeEchoSegmentId;
  }

  _generateQueryId(query) {
    return query.value;
  }

  _isLoadQuery() {
    return true;
  }

  _generateThunkFunction(thunk) {
    var query = thunk.query;
    var queryId = thunk.queryId;
    thunk.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        request.get('http://localhost:8000/api/random-time-echo/' + encodeURIComponent(query.value)).end((err, res) => {
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