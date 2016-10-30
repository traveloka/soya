import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Load from 'soya/lib/data/redux/Load';

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

  _createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load();
    load.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        request.get('http://localhost:8000/api/user/badge/list').end((err, res) => {
          if (res.ok) {
            var payload = JSON.parse(res.text);
            dispatch(this._createSetResultAction(queryId, payload));
            resolve();
          } else {
            reject(new Error('Unable to fetch badge data!'));
          }
        });
      });
      return result;
    };
    return load;
  }

  _processRefreshRequests(segmentState, refreshRequests) {
    // Since there is only one API that updates this segment, we can go crazy.
    return ['*']
  }
}