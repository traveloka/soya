import Segment from '../../Segment.js';
import ActionNameUtil from '../ActionNameUtil.js';
import QueryResult from '../../QueryResult.js';

import update from 'react-addons-update';

/**
 * You can query LocalSegment by specifying keys separated by dots. Examples:
 * "key", "key.subKey", etc.
 *
 * @CLIENT_SERVER
 */
export default class LocalSegment extends Segment {
  // We'll cache something at the Segment class. This isn't state, since it's
  // constant for all user Segment classes extending this class and won't
  // ever change.
  static __initialize() {
    const segment = this;
    if (segment.__INITIALIZED) return;
    const id = segment.id();
    const UPDATE_ACTION_TYPE = ActionNameUtil.generate(id, 'UPDATE');
    const CLEAN_ACTION_TYPE = ActionNameUtil.generate(id, 'CLEAN');
    segment.__ACTION_CREATOR = {
      createUpdateAction(commands) {
        return {
          type: UPDATE_ACTION_TYPE,
          commands: commands
        }
      }
    };
    segment.__REDUCER = function(state, action) {
      if (state == null) state = segment.createInitialData();
      switch (action.type) {
        case CLEAN_ACTION_TYPE:
          // Since there are no concept of loading in local segment, init and
          // clean does the same thing, which is populating the segment with
          // initial data.
          return segment.createInitialData();
          break;
        case UPDATE_ACTION_TYPE:
          // Update using react immutability helper.
          return update(state, action.commands);
          break;
      }
      return state;
    };
    segment.__INITIALIZED = true;
  }

  static getActionCreator() {
    this.__initialize();
    return this.__ACTION_CREATOR;
  }

  static getReducer() {
    this.__initialize();
    return this.__REDUCER;
  }

  static shouldHydrate() {
    // Since this is local segment, it shouldn't be hydrated at server.
    return false;
  }

  /**
   * This is meant to be overridden by client.
   *
   * @returns {any}
   */
  static createInitialData() {
    return {};
  }

  static generateQueryId(query) {
    if (typeof query != 'string') {
      throw new Error('Local segment query must be string. Found: \'' + query + '\'.');
    }
    return query;
  }

  static queryState(query, queryId, segmentState) {
    if (segmentState == null) return QueryResult.loaded(null);
    if (typeof segmentState == 'object' && typeof queryId == 'string' && queryId != '') {
      var i, segment = segmentState, splitQuery = queryId.split('.');
      for (i = 0; i < splitQuery.length; i++) {
        if (segment.hasOwnProperty(splitQuery[i])) {
          segment = segment[splitQuery[i]];
        } else {
          return QueryResult.loaded(null);
        }
      }
      return QueryResult.loaded(segment);
    }
    return QueryResult.loaded(segmentState);
  }
}