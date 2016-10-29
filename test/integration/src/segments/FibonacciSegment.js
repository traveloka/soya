import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment.js';
import Thunk from 'soya/lib/data/redux/Thunk.js';
import QueryDependencies from 'soya/lib/data/redux/QueryDependencies';

// TODO: Figure out how to do polyfill.
// TODO: Figure out how to load client-side libraries like jQuery!
import request from 'superagent';

import { FibonacciSegmentId } from './ids.js';
import AdditionSegment from './AdditionSegment.js';

export default class FibonacciSegment extends MapSegment {
  static id() {
    return FibonacciSegmentId;
  }

  static getSegmentDependencies() {
    return [AdditionSegment];
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
    var i, dependencies = QueryDependencies.serial(Promise);
    var a = 1, b = 1;

    var func = function(query, dispatch) {
      return query(AdditionSegment.id(), {a: a, b: b}).then(function(value) {
        a = b;
        b = value.data;
        return value;
      });
    };

    for (i = 0; i < query.number; i++) {
      if (i < 2) {
        dependencies.add(i + '', AdditionSegment.id(), {a: 0, b: 1});
        continue;
      }
      dependencies.addFunction(i + '', func);
    }

    thunk.dependencies = dependencies;
    thunk.func = (dispatch) => {
      var resultStr = '';
      for (i = 0; i < query.number; i++) {
        resultStr += dependencies.getResult(i + '').data + ' ';
      }
      var actionObj = this._createSyncLoadActionObject(queryId, resultStr);
      return dispatch(actionObj);
    };
  }
}