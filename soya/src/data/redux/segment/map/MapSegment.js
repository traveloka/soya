import Segment from '../../Segment.js';
import ActionNameUtil from '../ActionNameUtil.js';
import QueryResult from '../../QueryResult.js';
import Thunk from '../../Thunk.js';

/**
 * Organizes pieces inside its segment as simple key-value map. This means
 * segment piece granularity is limited to top-level values (you cannot
 * query a particular field, for instance).
 *
 * @CLIENT_SERVER
 */
export default class MapSegment extends Segment {
  /**
   * @type {Object}
   */
  _actionCreator;

  /**
   * @type {string}
   */
  _loadActionType;

  /**
   * @type {string}
   */
  _initActionType;

  /**
   * @type {string}
   */
  _cleanActionType;

  /**
   * @type {CookieJar}
   */
  _cookieJar;

  /**
   * @param {Object} config
   * @param {CookieJar} cookieJar
   * @param {Object} dependencyActionCreatorMap
   */
  constructor(config, cookieJar, dependencyActionCreatorMap) {
    super(config, cookieJar, dependencyActionCreatorMap);

    // Since segment name is guaranteed never to clash by ReduxStore, we can
    // safely use segment name as action type.
    var id = this.constructor.id();
    this._loadActionType = ActionNameUtil.generate(id, 'LOAD');
    this._initActionType = ActionNameUtil.generate(id, 'INIT');
    this._cleanActionType = ActionNameUtil.generate(id, 'CLEAN');

    this._actionCreator = {
      load: query => {
        var queryId = this._generateQueryId(query);
        return this._createLoadAction(query, queryId);
      }
    };
  }

  /**
   * Generates a unique string representing the given query. Same query must
   * generate identical strings. Query ID is used by ReduxStore and Segment
   * to recognize identical queries.
   *
   * ABSTRACT: To be overridden by child implementations.
   *
   * @param {any} query
   * @return {string}
   * @private
   */
  _generateQueryId(query) {
    throw new Error('User must override this _generateQueryId method! Instance: ' + this + '.');
  }

  /**
   * Fetches query result from external source, returns a Redux thunk function
   * that may be wrapped with QueryDependencies.
   *
   * IMPORTANT NOTE: The thunk function must do the dispatch, and return a
   * Promise that resolves *after* dispatch is done.
   *
   * ABSTRACT: To be overridden by child implementations.
   *
   * @param {Thunk} thunk
   * @private
   */
  _generateThunkFunction(thunk) {
    throw new Error('User must override _generateThunkFunction method! Instance: ' + this + '.');
  }

  /**
   * @param {any} query
   * @param {string} queryId
   * @return {Object | Thunk}
   */
  _createLoadAction(query, queryId) {
    var thunk = new Thunk(this.constructor.id(), queryId, query);
    this._generateThunkFunction(thunk);
    return thunk;
  }

  /**
   * Creates an action object with the given state payload.
   *
   * IMPORTANT NOTE: Please make sure that you return a *new* object, as redux
   * store states are supposed to be immutable.
   *
   * @param {string} queryId
   * @param {void | any} payload
   * @param {void | Array<any>} errors
   * @return {Object}
   */
  _createSyncLoadActionObject(queryId, payload, errors) {
    return {
      type: this._loadActionType,
      queryId: queryId,
      payload: {
        data: payload,
        updated: Date.now ? Date.now() : new Date().getTime(),
        errors: errors,
        loaded: errors ? false : true
      }
    };
  }

  /**
   * @return {Object}
   */
  _getActionCreator() {
    return this._actionCreator;
  }
  
  _queryState(query, queryId, segmentState) {
    var piece = segmentState[queryId];
    if (piece == null) return QueryResult.notLoaded();
    return QueryResult.loaded(piece);
  }

  /**
   * @return {Function}
   */
  _getReducer() {
    var loadActionType = this._loadActionType;
    var initActionType = this._initActionType;
    var cleanActionType = this._cleanActionType;
    return (state, action) => {
      // If state is undefined, return initial state.
      if (!state) state = {};
      var newState, isUninitialized;
      switch(action.type) {
        case cleanActionType:
          // Nullifies the segment:
          return {};
          break;
        case loadActionType:
          // Replace the map entry with the new loaded one.
          newState = this._createNewStateObj(state);
          newState[action.queryId] = action.payload;
          return newState;
          break;
        case initActionType:
          isUninitialized = (!state[action.queryId] || !state[action.queryId].loaded);
          if (isUninitialized) {
            newState = this._createNewStateObj(state);
            newState[action.queryId] = action.payload;
            return newState;
          }
          break;
      }
      return state;
    };
  }

  /**
   * Create a new object, redux store state is supposed to immutable!
   *
   * @param {Object} state
   * @return {Object}
   */
  _createNewStateObj(state) {
    var newState = {}, queryId;
    for (queryId in state) {
      if (!state.hasOwnProperty(queryId)) continue;
      newState[queryId] = state[queryId];
    }
    return newState;
  }
}