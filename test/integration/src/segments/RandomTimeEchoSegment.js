import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Load from 'soya/lib/data/redux/Load';

import RandomTimeEchoService from '../services/RandomTimeEchoService.js';
import { RandomTimeEchoSegmentId } from './ids.js';

export default class RandomTimeEchoSegment extends MapSegment {
  static id() {
    return RandomTimeEchoSegmentId;
  }

  static generateQueryId(query) {
    return query.value;
  }

  static getServiceDependencies() {
    return [RandomTimeEchoService];
  }

  static createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load(RandomTimeEchoSegment.id());
    load.func = (dispatch, queryFunc, services) => {
      var randomTimeEchoService = services[RandomTimeEchoService.id()];
      return new Promise((resolve, reject) => {
        randomTimeEchoService.echoInRandomTime(query.value).then((payload) => {
          dispatch(this.getActionCreator().set(queryId, payload));
          resolve();
        }).catch(reject);
      });
    };
    return load;
  }
}