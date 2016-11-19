import Segment from '../../Segment.js';
import ActionNameUtil from '../ActionNameUtil.js';
import QueryResult from '../../QueryResult.js';

import update from 'react-addons-update';

/**
 * Organizes pieces inside its segment as simple key-value map. This means
 * segment piece granularity is limited to top-level values (you cannot
 * query a particular field, for instance).
 *
 * @CLIENT_SERVER
 */
export default class MapSegment extends Segment {
  // We'll cache something at the Segment class. This isn't state, since it's
  // constant for all user Segment classes extending this class and won't
  // ever change.
  static __initialize() {
    const segment = this;
    if (segment.__INITIALIZED) return;
    const id = segment.id();
    const SET_ACTION_TYPE = ActionNameUtil.generate(id, 'SET');
    segment.__ACTION_CREATOR = {
      'set': function(queryId, payload, errors) {
        return {
          type: SET_ACTION_TYPE,
          queryId: queryId,
          payload: {
            data: payload,
            updated: Date.now ? Date.now() : new Date().getTime(),
            errors: errors
          }
        };
      }
    };
    segment.__REDUCER = function(state, action) {
      // If state is undefined, return initial state.
      if (state == null) state = {};
      switch(action.type) {
        case SET_ACTION_TYPE:
          // Replace the map entry with the new loaded one.
          state = update(state, {
            [action.queryId]: {$set: action.payload}
          });
          break;
      }
      return state;
    };
    segment.__INITIALIZED = true;
  }

  /**
   * If you find that you need to override this method, you're better off
   * creating your own Segment class, since overriding this method also means
   * overriding getReducer() and other methods in this class.
   *
   * @return {Object}
   */
  static getActionCreator() {
    this.__initialize();
    return this.__ACTION_CREATOR;
  }

  /**
   * @return {Function}
   */
  static getReducer() {
    this.__initialize();
    return this.__REDUCER;
  }

  static queryState(query, queryId, segmentState) {
    if (segmentState == null) return QueryResult.notLoaded();
    var piece = segmentState[queryId];
    if (piece == null) return QueryResult.notLoaded();
    return QueryResult.loaded(piece);
  }
}