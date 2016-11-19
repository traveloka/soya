import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import QueryDependencies from 'soya/lib/data/redux/QueryDependencies';
import Load from 'soya/lib/data/redux/Load';

import { FibonacciTotalSegmentId } from './ids.js';
import FibonacciSegment from './FibonacciSegment.js';

export default class FibonacciTotalSegment extends MapSegment {
  static id() {
    return FibonacciTotalSegmentId;
  }

  static getSegmentDependencies() {
    return [FibonacciSegment];
  }

  static generateQueryId(query) {
    return query.number;
  }

  static createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load();
    var dependencies = QueryDependencies.serial(Promise);

    dependencies.add('total', FibonacciSegment.id(), query);
    load.dependencies = dependencies;
    load.func = (dispatch) => {
      var i, total = 0, n, resultArray = dependencies.getResult('total').data.split(' ');
      for (i = 0; i < resultArray.length; i++) {
        n = resultArray[i];
        if (n == '') continue;
        total += parseInt(n, 10);
      }
      var actionObj = this.getActionCreator().set(queryId, total);
      return dispatch(actionObj);
    };
    return load;
  }
}