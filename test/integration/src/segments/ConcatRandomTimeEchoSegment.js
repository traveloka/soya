import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import QueryDependencies from 'soya/lib/data/redux/QueryDependencies';
import Load from 'soya/lib/data/redux/Load';

import { ConcatRandomTimeEchoSegmentId } from './ids.js';
import RandomTimeEchoSegment from './RandomTimeEchoSegment.js';

export default class ConcatRandomTimeEchoSegment extends MapSegment {
  static id() {
    return ConcatRandomTimeEchoSegmentId;
  }

  static getSegmentDependencies() {
    return [RandomTimeEchoSegment];
  }

  static generateQueryId(query) {
    return query.value + (query.isParallel ? '$p' : '$s') +
      (query.isReplaceParallel ? '$p' : '$s') +
      (query.shouldReplace ? '$r' : '');
  }

  static createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load();
    var dependencies, recursiveDependencies, RecursiveQueryCtor, i, val;

    dependencies = query.isParallel ?
      QueryDependencies.parallel(Promise) : QueryDependencies.serial(Promise);
    RecursiveQueryCtor = query.isReplaceParallel ?
      QueryDependencies.parallel : QueryDependencies.serial;

    for (i = 0; i < query.value.length; i++) {
      val = query.value[i];
      if (query.shouldReplace && val == 's') {
        recursiveDependencies = new RecursiveQueryCtor(Promise);
        recursiveDependencies.add('s', RandomTimeEchoSegment.id(), {value: 's'}, true);
        recursiveDependencies.add('o', RandomTimeEchoSegment.id(), {value: 'o'}, true);
        recursiveDependencies.add('y', RandomTimeEchoSegment.id(), {value: 'y'}, true);
        recursiveDependencies.add('a', RandomTimeEchoSegment.id(), {value: 'a'}, true);
        dependencies.addRecursive(i + '', recursiveDependencies);
        continue;
      }

      // Always do force load so that response time is always random.
      dependencies.add(i + '', RandomTimeEchoSegment.id(), {value: val}, true);
    }

    load.dependencies = dependencies;
    load.func = (dispatch) => {
      // Put results to array, we're going to sort them by the time they arrive.
      var i, result, resultArray = [];
      for (i = 0; i < query.value.length; i++) {
        result = dependencies.getResult(i + '');
        if (result instanceof QueryDependencies) {
          resultArray.push(result.getResult('s'));
          resultArray.push(result.getResult('o'));
          resultArray.push(result.getResult('y'));
          resultArray.push(result.getResult('a'));
          continue;
        }
        resultArray.push(result);
      }
      resultArray.sort(function(a, b) {
        if (a.updated == b.updated) return 0;
        return a.updated > b.updated ? 1 : -1;
      });

      // Join fetched target, parallel fetch should have inconsistencies while
      // serial fetch should have no inconsistencies.
      var resultStr = '', segmentPiece;
      for (i = 0; i < resultArray.length; i++) {
        segmentPiece = resultArray[i];
        resultStr += segmentPiece != null ? segmentPiece.data : '?';
      }
      return dispatch(this.getActionCreator().set(queryId, resultStr));
    };
    return load;
  }
}