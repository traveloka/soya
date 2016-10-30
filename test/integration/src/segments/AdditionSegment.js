import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Load from 'soya/lib/data/redux/Load';

// TODO: Figure out how to do polyfill.
// TODO: Figure out how to load client-side libraries like jQuery!
import request from 'superagent';

import { AdditionSegmentId } from './ids.js';

export default class AdditionSegment extends MapSegment {
  static id() {
    return AdditionSegmentId;
  }

  _generateQueryId(query) {
    return query.a + '+' + query.b;
  }

  _createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load();
    load.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        request.get('http://localhost:8000/api/addition/' + encodeURIComponent(query.a) + '/' + encodeURIComponent(query.b)).end((err, res) => {
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
    return load;
  }
}