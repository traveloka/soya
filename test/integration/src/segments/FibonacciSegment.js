import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import QueryDependencies from 'soya/lib/data/redux/QueryDependencies';
import Load from 'soya/lib/data/redux/Load';

import { FibonacciSegmentId } from './ids.js';
import AdditionSegment from './AdditionSegment.js';

export default class FibonacciSegment extends MapSegment {
  static id() {
    return FibonacciSegmentId;
  }

  static getSegmentDependencies() {
    return [AdditionSegment];
  }

  static generateQueryId(query) {
    return query.number;
  }

  static createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load(FibonacciSegment.id());
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

    load.dependencies = dependencies;
    load.func = (dispatch) => {
      var resultStr = '';
      for (i = 0; i < query.number; i++) {
        resultStr += dependencies.getResult(i + '').data + ' ';
      }
      var actionObj = this.getActionCreator().set(queryId, resultStr);
      return dispatch(actionObj);
    };
    return load;
  }
}