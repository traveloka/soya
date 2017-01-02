import Segment from 'soya/lib/data/redux/Segment';
import QueryResult from 'soya/lib/data/redux/QueryResult';
import update from 'react-addons-update';

const ID = 'favs';
const SET_ACTION_TYPE = `${ID}.set`;

const actionCreator = {
  'set': function(object) {
    return {
      type: SET_ACTION_TYPE,
      object: object
    };
  }
};

const reducer = function(state, action) {
  if (state == null) state = {};
  switch (action.type) {
    case SET_ACTION_TYPE:
      state = update(state, {
        $merge: action.object
      });
      break;
  }
  return state;
};

export default class FavoritesSegment extends Segment {
  static id() {
    return ID;
  }

  static getReducer() {
    return reducer;
  }

  static getActionCreator() {
    return actionCreator;
  }

  static generateQueryId() {
    return '*';
  }

  static queryState(query, queryId, segmentState) {
    return QueryResult.loaded(segmentState);
  }
}