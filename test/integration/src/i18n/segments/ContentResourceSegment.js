import Segment from 'soya/lib/data/redux/Segment';
import QueryResult from 'soya/lib/data/redux/QueryResult';
import ContentResourceService from '../services/ContentResourceService';
import * as actions from '../actions/ContentResourceAction';
import reducers from '../reducers/ContentResourceReducer';
import { CONTENT_RESOURCE_SEGMENT } from '../constants/ContentResourceConstant';

class ContentResourceSegment extends Segment {
  static id() {
    return CONTENT_RESOURCE_SEGMENT;
  }

  static generateQueryId({ name, entryKey, locale }) {
    return `${locale}.${name}.${entryKey}`;
  }

  static getActionCreator() {
    return actions;
  }

  static getReducer() {
    return reducers;
  }

  static getServiceDependencies() {
    return [ContentResourceService];
  }

  static queryState({ name, entryKey }, queryId, segmentState) {
    if (segmentState != null && segmentState[name] != null && segmentState[name][entryKey] != null) {
      return QueryResult.loaded(segmentState[name][entryKey]);
    }
    return QueryResult.notLoaded(null);
  }

  static createLoadFromQuery(...args) {
    return this.getActionCreator().load(...args);
  }
}

export default ContentResourceSegment;
