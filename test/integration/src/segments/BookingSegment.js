import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import QueryDependencies from 'soya/lib/data/redux/QueryDependencies';
import Load from 'soya/lib/data/redux/Load';

import { BookingSegmentId } from './ids.js';
import BookingService from '../services/BookingService.js';
import LifetimeSessionSegment from './LifetimeSessionSegment.js';

const CONTEXT = 'c';

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

  static getServiceDependencies() {
    return [BookingService];
  }

  static createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load(BookingSegment.id());
    var dependencies = QueryDependencies.serial(Promise);
    dependencies.add(CONTEXT, LifetimeSessionSegment.id(), null);
    load.dependencies = dependencies;
    load.func = (dispatch, queryFunc, services) => {
      var bookingService = services[BookingService.id()];
      return new Promise((resolve, reject) => {
        var context = dependencies.getResult(CONTEXT);
        bookingService.fetchBooking(query.bookingId, context.lifetime, context.session)
          .then((result) => {
            if (result.success) {
              dispatch(this.getActionCreator().set(queryId, result.payload));
            } else {
              dispatch(this.getActionCreator().set(queryId, null, [result.errorMessage]));
            }
            resolve();
          })
          .catch(reject);
      });
    };
    return load;
  }
}