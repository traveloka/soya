import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Load from 'soya/lib/data/redux/Load';

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

  _createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load();
    load.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        request.get('http://localhost:8000/api/random-time-echo/' + encodeURIComponent(query.value)).end((err, res) => {
          if (res.ok) {
            var payload = JSON.parse(res.text);
            dispatch(this._createSetResultAction(queryId, payload));
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