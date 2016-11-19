import LocalSegment from 'soya/lib/data/redux/segment/local/LocalSegment';
import ActionNameUtil from 'soya/lib/data/redux/segment/ActionNameUtil';

import { LyingSegmentId } from './ids.js';

const INCREMENT_ACTION_TYPE = ActionNameUtil.generate(LyingSegmentId, 'INCREMENT');

const REDUCER = function(state, action) {
  if (state == null) state = 0;
  switch (action.type) {
    case INCREMENT_ACTION_TYPE:
      state = state + action.number;
      break;
  }
  return state;
};

const ACTION_CREATOR = {
  increment: function(number) {
    if (number == null || number == undefined) number = 1;
    return {
      type: INCREMENT_ACTION_TYPE,
      number: number
    }
  }
};

/**
 * @CLIENT_SERVER
 */
export default class LyingSegment extends LocalSegment {
  static id() {
    return LyingSegmentId;
  }

  static getActionCreator() {
    return ACTION_CREATOR;
  }

  static getReducer() {
    return REDUCER;
  }
}