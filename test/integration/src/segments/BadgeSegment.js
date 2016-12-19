import MapSegment from 'soya/lib/data/redux/segment/map/MapSegment';
import Load from 'soya/lib/data/redux/Load';

import BadgeService from '../services/BadgeService.js';
import { BadgeSegmentId } from './ids.js';

export default class BadgeSegment extends MapSegment {
  static id() {
    return BadgeSegmentId;
  }

  static generateQueryId(query) {
    return '*';
  }

  static getServiceDependencies() {
    return [BadgeService];
  }

  static createLoadFromQuery(query, queryId, segmentState) {
    var load = new Load(BadgeSegment.id())
    load.func = (dispatch, queryFunc, services) => {
      var badgeService = services[BadgeService.id()];
      return new Promise((resolve, reject) => {
        badgeService.fetchBadges().then((payload) => {
          dispatch(this.getActionCreator().set(queryId, payload));
          resolve();
        }).catch(reject);
      });
    };
    return load;
  }

  static processRefreshRequests(segmentState, refreshRequests) {
    // Since there is only one API that updates this segment, we can go crazy.
    return ['*']
  }
}