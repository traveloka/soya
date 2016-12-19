import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Load from 'soya/lib/data/redux/Load';

import AdditionService from '../services/AdditionService.js';
import { AdditionSegmentId } from './ids.js';

export default class AdditionSegment extends MapSegment {
  static id() {
    return AdditionSegmentId;
  }

  static generateQueryId(query) {
    return query.a + '+' + query.b;
  }
  
  static getServiceDependencies() {
    return [AdditionService];
  }

  static createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load(AdditionSegment.id());
    load.func = (dispatch, queryFunc, services) => {
      var additionService = services[AdditionService.id()];
      var result = new Promise((resolve, reject) => {
        additionService.calculateAddition(query.a, query.b).then((result) => {
          dispatch(this.getActionCreator().set(queryId, result));
          resolve();
        }).catch(reject);
      });
      return result;
    };
    return load;
  }
}