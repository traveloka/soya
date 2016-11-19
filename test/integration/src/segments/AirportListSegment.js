import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Load from 'soya/lib/data/redux/Load';

import AirportListService from '../services/AirportListService.js';
import { AirportListSegmentId } from './ids.js';

export default class AirportListSegment extends MapSegment {
  static id() {
    return AirportListSegmentId;
  }

  static generateQueryId(query) {
    // We only have one possible query.
    return '*';
  }

  static getServiceDependencies() {
    return [AirportListService];
  }

  static createLoadFromQuery(query, queryId, segmentState, services) {
    var load = new Load();
    var airportListService = services[AirportListService.id()];
    load.func = (dispatch) => {
      var result = new Promise((resolve, reject) => {
        airportListService.fetchAirportList().then((payload) => {
          dispatch(this.getActionCreator().set(queryId, payload));
          resolve();
        }).catch(reject);
      });
      return result;
    };
    return load;
  }
}