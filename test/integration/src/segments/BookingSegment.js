import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import QueryDependencies from 'soya/lib/data/redux/QueryDependencies';
import Load from 'soya/lib/data/redux/Load';

// TODO: Figure out how to do polyfill.
// TODO: Figure out how to load client-side libraries like jQuery!
import request from 'superagent';

import { BookingSegmentId } from './ids.js';
import LifetimeSessionSegment from './LifetimeSessionSegment.js';

export default class BookingSegment extends MapSegment {
  static id() {
    return BookingSegmentId;
  }

  static getSegmentDependencies() {
    return [LifetimeSessionSegment];
  }

  static generateQueryId(query) {
    return query.bookingId;
  }

  static createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load();
    var dependencies = QueryDependencies.serial(Promise);
    dependencies.add('context', LifetimeSessionSegment.id(), null);
    load.dependencies = dependencies;
    load.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        // Note: can already use lifetime and session in this request.
        request.get('http://localhost:8000/api/booking/' + encodeURIComponent(query.bookingId)).end((err, res) => {
          var payload = JSON.parse(res.text);
          if (res.ok) {
            dispatch(this.getActionCreator().set(queryId, payload));
            resolve();
          } else if (res.notFound) {
            dispatch(this.getActionCreator().set(queryId, null, [payload.error]));
          }
        });
      });
      return result;
    };
    return load;
  }
}