import Segment from 'soya/lib/data/redux/Segment';
import QueryResult from 'soya/lib/data/redux/QueryResult';
import * as actions from '../actions/TodoAction';
import { TODO_SEGMENT } from '../constants/TodoConstant';
import reducers from '../reducers/TodoReducer';
import TodoService from '../services/TodoService';

class TodoSegment extends Segment {
  // used for redux state key
  static id() {
    return TODO_SEGMENT;
  }

  static generateQueryId() {
    return '*';
  }

  static getActionCreator() {
    return actions;
  }

  static getReducer() {
    return reducers;
  }

  static getServiceDependencies() {
    return [TodoService];
  }

  static queryState(query, queryId, segmentState) {
    if (segmentState != null && segmentState.length > 0) {
      return QueryResult.loaded(segmentState);
    }
    return QueryResult.notLoaded(null);
  }

  static createLoadFromQuery() {
    return this.getActionCreator().load();
  }
}

export default TodoSegment;
