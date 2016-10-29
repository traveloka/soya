import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment.js';
import Thunk from 'soya/lib/data/redux/Thunk.js';
import QueryDependencies from 'soya/lib/data/redux/QueryDependencies';

// TODO: Figure out how to do polyfill.
// TODO: Figure out how to load client-side libraries like jQuery!
import request from 'superagent';

import { FibonacciTotalSegmentId } from './ids.js';
import FibonacciSegment from './FibonacciSegment.js';

export default class FibonacciTotalSegment extends MapSegment {
  static id() {
    return FibonacciTotalSegmentId;
  }

  static getSegmentDependencies() {
    return [FibonacciSegment];
  }

  _generateQueryId(query) {
    return query.number;
  }

  _isLoadQuery() {
    return true;
  }

  _generateThunkFunction(thunk) {
    var query = thunk.query;
    var queryId = thunk.queryId;
    var dependencies = QueryDependencies.serial(Promise);

    dependencies.add('total', FibonacciSegment.id(), query);
    thunk.dependencies = dependencies;
    thunk.func = (dispatch) => {
      var i, total = 0, n, resultArray = dependencies.getResult('total').data.split(' ');
      for (i = 0; i < resultArray.length; i++) {
        n = resultArray[i];
        if (n == '') continue;
        total += parseInt(n, 10);
      }
      var actionObj = this._createSyncLoadActionObject(queryId, total);
      return dispatch(actionObj);
    };
  }
}