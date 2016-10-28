/* @flow */

import Store from '../Store.js';
import { SERVER, CLIENT } from '../RenderType.js';
import PromiseUtil from './PromiseUtil.js';
import Thunk from './Thunk.js';
import QueryDependencies from './QueryDependencies.js';

import QueryResult from './QueryResult.js';
import { compose, createStore, applyMiddleware } from 'redux';
import { devTools, persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
import scope from 'soya/lib/scope';

/*

type StoreReference = {
  getState: Function;
  unregister: Function;
};

*/

const SUBSCRIBER_ID = '__soyaReduxStoreSubscriberId';
const REPLACE_STATE = '__soyaReplaceState';

/**
 * Creates and wraps redux store. Responsibilities:
 *
 * TODO: Fix this comment!
 *
 * 1. Creates appropriate redux store, with redux-thunk as middlewares.
 * 1. Wraps redux store's subscribe and dispatch.
 * 2. Listen to store changes, then ask each segment to decides whether to
 *
 *
 *
 * The store's responsibilities are:
 *
 * 1. Accepts Store and Query requirements from components.
 * 2. Does initial state hydration from requirements given by components.
 * 3. Allows contextual components to get state.
 * 4. Allows contextual components to subscribe to state changes.
 * 5. Allows contextual components to dispatch actions.
 * 6. Allows contextual components to get action creators.
 * 7. Orchestrates batching of requests.
 *
 * @CLIENT_SERVER
 */
export default class ReduxStore extends Store {
  /**
   * @type {string}
   */
  _renderType;

  /**
   * @type {number}
   */
  _nextSubscriberId;

  /**
   * @type {{[key: string}: Class<Segment>}
   */
  _segmentClasses;

  /**
   * @type {{[key: string]: Segment}}
   */
  _segments;

  /**
   * <pre>
   *   {
   *     segmentId: {
   *       queryId: {
   *         promise: thenable,
   *         query: any
   *       }
   *     }
   *   }
   * </pre>
   *
   * @type {{[key: string]: {[key: string]: { promise: ?Promise, query: any }}}}
   */
  _queries;

  /**
   * <pre>
   *   {
   *     segmentId: {
   *       queryId: {
   *         [SERVER]: true/false
   *       },
   *       ...
   *     },
   *     ...
   *   }
   * </pre>
   *
   *
   * @type {{[key: string]: {[key: string]: boolean}}}
   */
  _hydrationOptions;

  /**
   * <pre>
   *   {
   *     segmentId: {
   *       queryId: {
   *         subscriberId: subscribeFunc,
   *         subscriberId: subscribeFunc
   *       }
   *     }
   *   }
   * </pre>
   *
   * @type {{[key: string]: {[key: string]: {[key: string]: Function}}}}
   */
  _subscribers;

  /**
   * <pre>
   *   {
   *     segmentId: function() {...},
   *     segmentId: function() {...}
   *   }
   * </pre>
   *
   * @type {{[key: string]: Function}}
   */
  _reducers;

  /**
   * <pre>
   *   {
   *     segmentId: {...},
   *     segmentId: {...}
   *   }
   * </pre>
   *
   * @type {{[key: string]: Object}}
   */
  _actionCreators;

  /**
   * Redux store.
   *
   * @type {any}
   */
  _store;

  /**
   * @type {{state: any; timestamp: number}}
   */
  _previousState;

  /**
   * @type {{[key: string]: boolean}}
   */
  _registeredQueries;

  /**
   * @type {{[key: string]: boolean}}
   */
  _allowOverwriteSegment;

  /**
   * @type {boolean}
   */
  _allowRegisterSegment;

  /**
   * @type {Object}
   */
  _config;

  /**
   * @type {CookieJar}
   */
  _cookieJar;

  /**
   * @type {boolean}
   */
  __isReduxStore;

  /**
   * Receives Promises/A+ implementation. We don't want to load more than 1
   * promise library, so we'll have the user supply it to us. This should be
   * the same library, or a library compatible with the one used at
   * ActionCreator implementations.
   *
   * TODO: Deprecate PromiseImpl
   *
   * @param {Function} PromiseImpl
   * @param {any} initialState
   * @param {Object} config
   * @param {CookieJar} cookieJar
   */
  constructor(PromiseImpl, initialState, config, cookieJar) {
    super();
    this.__isReduxStore = true;
    this._allowRegisterSegment = false;
    this._config = config;
    this._segments = {};
    this._segmentClasses = {};
    this._queries = {};
    this._registeredQueries = {};
    this._reducers = {};
    this._subscribers = {};
    this._nextSubscriberId = 1;
    this._store = this._createStore(initialState);
    this._previousState = {
      state: initialState,
      timestamp: this._getTimestamp()
    };
    this._store.subscribe(this._handleChange.bind(this));
    this._hydrationOptions = {};
    this._actionCreators = {};
    this._allowOverwriteSegment = {};
    this._cookieJar = cookieJar;
  }

  /**
   * @param {RenderType} renderType
   */
  _setRenderType(renderType) {
    this._renderType = renderType;
  }

  /**
   * Only allow Segment registration at render process.
   */
  _startRender() {
    this._allowRegisterSegment = true;
  }

  /**
   * Disable segment registration after render process.
   */
  _endRender() {
    this._allowRegisterSegment = false;
  }

  /**
   * @param {?Object} initialState
   * @returns {Object}
   */
  _createStore(initialState) {
    // TODO: Disable devTools with configuration.
    // TODO: Hot reload reducer/segments?
    let devTool = devTools();
    if (scope.client) {
      // If the user has devTools plugin installed, use it.
      if (window !== null && window.devToolsExtension) {
        devTool = window.devToolsExtension();
      }
    }
    var composedCreateStore = compose(
      applyMiddleware(thunk),
      devTool
    )(createStore);
    return composedCreateStore(this._rootReducer.bind(this), initialState);
  }

  /**
   * Root reducer.
   *
   * @param {void | Object} state
   * @param {any} action
   * @returns {Object}
   * @private
   */
  _rootReducer(state, action) {
    if (state == null) state = {};
    if (action.type === REPLACE_STATE) {
      // Replace state directly.
      return action.state;
    }

    var reducer, segmentName, segment, segmentState, nextSegmentState;
    var nextState = {}, isChanged = false;
    for (segmentName in state) {
      if (!state.hasOwnProperty(segmentName)) continue;
      nextState[segmentName] = state[segmentName];
    }

    for (segmentName in this._reducers) {
      if (!this._reducers.hasOwnProperty(segmentName)) continue;
      if (!this._segments.hasOwnProperty(segmentName)) continue;
      reducer = this._reducers[segmentName];
      segment = this._segments[segmentName];
      segmentState = state[segmentName];
      nextSegmentState = reducer(segmentState, action);
      isChanged = isChanged || !segment._isStateEqual(segmentState, nextSegmentState);
      nextState[segmentName] = nextSegmentState;
    }
    return isChanged ? nextState : state;
  }

  /**
   * We need to watch out because _handleChange() could be recursive. For more
   * information please see _setPreviousState().
   *
   * @private
   */
  _handleChange() {
    if (this._renderType == SERVER) {
      // We don't need to trigger any subscription callback at server. We'll
      // render twice and we're only interested in the HTML string.
      return;
    }

    var timestamp = this._getTimestamp();
    var state = this._store.getState();
    if (this._previousState.state == null) {
      // If no change, no need to trigger callbacks.
      this._setPreviousState(state, timestamp);
      return;
    }

    // Assume comparison is cheaper than re-rendering. We do way more comparison
    // when we compare each piece, with the benefits of not doing unnecessary
    // re-rendering.
    var segmentName, segment, segmentState, prevSegmentState, segmentSubscribers,
        queryId, querySubscribers, subscriberId, segmentPiece, shouldUpdate;
    for (segmentName in this._segments) {
      if (!this._segments.hasOwnProperty(segmentName)) continue;
      segment = this._segments[segmentName];
      segmentSubscribers = this._subscribers[segmentName];
      segmentState = state[segmentName];
      prevSegmentState = this._previousState.state[segmentName];
      for (queryId in segmentSubscribers) {
        if (!segmentSubscribers.hasOwnProperty(queryId)) continue;
        querySubscribers = segmentSubscribers[queryId];
        // If segmentState is previously null, then this is a new query call.
        // First getState() method call should already return the initialized
        // object, so we don't need to call update.
        // TODO: This assumption/design seems to be flawed, null to existence is a change, and we should notify listeners.
        shouldUpdate = false;
        if (prevSegmentState != null) {
          segmentPiece = segment._comparePiece(prevSegmentState, segmentState, queryId);
          shouldUpdate = segmentPiece != null;
        }
        if (shouldUpdate) {
          // Segment piece has changed, call all registered subscribers.
          for (subscriberId in querySubscribers) {
            if (!querySubscribers.hasOwnProperty(subscriberId)) continue;
            querySubscribers[subscriberId](segmentPiece[0]);
          }
        }
      }
    }

    // Update previous state.
    this._setPreviousState(state, timestamp);
  }

  /**
   * Sets previous state for future comparison on _handleChange(). We need
   * to compare timestamp of each state because of these chain of events:
   *
   * 1) _handleChange() is called, it triggers listeners for appropriate
   *    components.
   * 2) One of those components (or its children), upon updating needs to
   *    dispatch another action. This triggers another _handleChange()
   *    before the first one is finished.
   *
   * Recursive handleChange() doesn't seem to have any negative effects,
   * only that we should be careful when setting previous state. It might
   * be that the previous state is already stale.
   *
   * @param {Object} newState
   * @param {number} timestamp
   * @private
   */
  _setPreviousState(newState, timestamp) {
    if (this._previousState.timestamp < timestamp) {
      this._previousState = {
        state: newState,
        timestamp: timestamp
      };
    }
  }

  /**
   * @param {?Object} hydrationOption
   * @return {Object}
   */
  _initHydrationOption(hydrationOption) {
    hydrationOption = hydrationOption ? hydrationOption : {};
    if (hydrationOption[SERVER] === null || hydrationOption[SERVER] === undefined) {
      hydrationOption[SERVER] = true;
    }
    return hydrationOption;
  }

  /**
   * @param {string} segmentId
   * @param {any} query
   * @return {Object}
   */
  _getSegmentPieceWithQuery(segmentId, query) {
    var segment = this._segments[segmentId];
    var queryId = segment._generateQueryId(query);
    return this._getSegmentPiece(segmentId, queryId);
  }

  /**
   * @param {string} segmentId
   * @param {string} queryId
   * @returns {Object}
   */
  _getSegmentPiece(segmentId, queryId) {
    var state = this._store.getState();
    var segmentState = state[segmentId];
    if (!segmentState) return null;
    var pieceObject = this._segments[segmentId]._getPieceObject(segmentState, queryId);
    // We return the real object so that users can do simple equality check to
    // see if the object has changed or not.
    return pieceObject;
  }

  _queryState(segmentId, query, queryId) {
    var state = this._store.getState();
    var segmentState = state[segmentId];
    if (!segmentState) return QueryResult.notLoaded();
    return this._segments[segmentId]._queryState(query, queryId, segmentState);
  }

  /**
   * @param {string} segmentName
   * @param {string} queryId
   * @param {string} subscriberId
   */
  _unsubscribe(segmentName, queryId, subscriberId) {
    // TODO: Might want to keep track of query/segment subscriber count, we might want to call Segment.deactivate().
    delete this._subscribers[segmentName][queryId][subscriberId];
  }

  /**
   * Implements this by creating an allowSegmentOverwrite flag for all segments
   * that has been registered in this instance. If it was a new Segment, we
   * don't care since there won't be any conflict anyway.
   */
  _mayHotReloadSegments() {
    this._allowOverwriteSegment = {};
    var segmentName;
    for (segmentName in this._segments) {
      if (!this._segments.hasOwnProperty(segmentName)) continue;
      this._allowOverwriteSegment[segmentName] = true;
    }
  }

  /**
   * @returns {boolean}
   */
  _shouldRenderBeforeServerHydration() {
    // We need to all segments to be registered first.
    return true;
  }

  /**
   * Runs hydration, depending on rendering type.
   *
   * NOTE: Hydration is only done once per Segment piece (query). It's safe to
   * call this method more than once, anytime - to make sure that all registered
   * state is hydrated.
   *
   * @return {Promise}
   */
  hydrate() {
    var action, segment, segmentClass, segmentId, queryId, queries, hydrationOption;
    var hydrationPromises = [], promise, query;
    for (segmentId in this._hydrationOptions) {
      if (!this._hydrationOptions.hasOwnProperty(segmentId)) continue;
      segmentClass = this._segmentClasses[segmentId];
      if (!segmentClass.shouldHydrate()) {
        // No need to hydrate local segments.
        continue;
      }
      segment = this._segments[segmentId];
      queries = this._hydrationOptions[segmentId];
      for (queryId in queries) {
        if (!queries.hasOwnProperty(queryId)) continue;
        hydrationOption = queries[queryId];
        query = this._queries[segmentId][queryId].query;

        // Don't need to do anything if it's already loaded.
        var queryResult = this._queryState(segmentId, query, queryId);
        if (queryResult.loaded)  
        
        var segmentPiece = this._getSegmentPiece(segmentId, queryId);
        if (segment._isLoaded(queryId, segmentPiece)) continue;

        var shouldLoad = (
          this._renderType == CLIENT ||
          (this._renderType == SERVER && hydrationOption[SERVER])
        );

        if (shouldLoad) {
          action = segment._createLoadAction(query, queryId);
          promise = this.dispatch(action);
          hydrationPromises.push(promise);
        }
      }
    }
    return PromiseUtil.allParallel(Promise, hydrationPromises);
  }

  /**
   * Registers all Segment instances required by the given DataComponent class.
   *
   * @param {Function} DataComponentConstructor
   */
  registerDataComponent(DataComponentConstructor) {
    var i, segments = DataComponentConstructor.getSegmentDependencies();
    for (i = 0; i < segments.length; i++) {
      this.register(segments[i]);
    }
  }

  /**
   * TODO: Update comment!
   *
   * Accepts a segment, specific query, and a subscriber. Each of these elements
   * can be anything depending on the Store implementation.
   *
   * In this method, ReduxStore instance is responsible for:
   *
   * 1) Making sure that only one Segment instance is responsible for
   *    maintaining a top-level key of the store. This means no segment name
   *    clashes, but multiple registrations of the _same_ Segment class is
   *    allowed. If a Segment instance with the same class is already
   *    registered, ReduxStore will ask Segment to *absorb* the other instance.
   *    How each Segment implementation deal with merging queries is their
   *    responsibility.
   * 2) Creating StoreReference, to be used by components.
   *    a) ActionCreator should be the same for each Segment instance.
   *    b) Individual getState() function should be created for each query.
   *       Segment instance can cache getState
   *
   * Only hydrationOption is typed. It determines hydration behavior at server
   * and client render. Default is blocking on server and non-blocking at
   * client.
   *
   * Returns StoreReference, which contains function to get queried state and
   * action creators.
   *
   * The getState() function will only return state queried by the component.
   *
   * Returns a function that can be used to get queried state. It will only
   * return the queried state, this makes it easier to separate concerns and
   * not have one component asking for a state queried by another component.
   *
   * TODO: Handle Segment dependencies!
   *
   * @param {Class<Segment>} SegmentClass
   * @param {?Class<Segment>} SegmentDependencyOwner
   * @return {Object<string, Function>} Action creator.
   */
  register(SegmentClass) {
    // First let's register all dependencies that this Segment class has.
    var i, dependencies = SegmentClass.getSegmentDependencies(),
        dependencyActionCreatorMap = {}, actionCreator;
    for (i = 0; i < dependencies.length; i++) {
      actionCreator = this.register(dependencies[i]);
      dependencyActionCreatorMap[dependencies[i].id()] = actionCreator;
    }

    // Get the segment ID to see if we already have registered the segment.
    var id = SegmentClass.id();
    var registeredSegment = this._segments[id];
    var RegisteredSegmentClass = this._segmentClasses[id];

    if (this._segmentClasses.hasOwnProperty(id)) {
      if (RegisteredSegmentClass === SegmentClass) {
        // Segment already registered.
        return registeredSegment._getActionCreator();
      }  else {
        throw new Error('Segment name clash: ' + id + '.', RegisteredSegmentClass, SegmentClass);
      }
    }

    //if (!this._allowRegisterSegment) {
    //  var isNewSegment = !registeredSegment || SegmentClass !== RegisteredSegmentClass;
    //  if (isNewSegment) {
    //    // We only throw error if it's an attempt to register a new Segment.
    //    throw new Error('Segment registration is only allowed at render process!');
    //  }
    //  // Otherwise, it's a no-op.
    //  return registeredSegment._getActionCreator();
    //}

    // Register segment.
    if (!registeredSegment) {
      registeredSegment = this._initSegment(SegmentClass, dependencyActionCreatorMap);
    }
    else if (SegmentClass !== RegisteredSegmentClass) {
      if (this._allowOverwriteSegment[id]) {
        // TODO: Create a DEBUG flag using webpack so that we can silent logging in production? or..
        // TODO: Make two logger implementation, client and server, then use clientReplace accordingly.
        console.log('Replacing segment.. (this should not happen in production!)', RegisteredSegmentClass, SegmentClass);
        registeredSegment = this._initSegment(SegmentClass, dependencyActionCreatorMap);

        // Nullifies the current segment data. Because we are replacing Segment
        // implementation, state data may differ.
        //var cleanAction = registeredSegment._createSyncCleanAction();
        //this.dispatch(cleanAction);
      } else {
        throw new Error('Segment id clash! Claimed by ' + RegisteredSegmentClass + ' and ' + SegmentClass + ', with id: ' + id + '.');
      }
    }

    // No longer allow segment overwrites for this segment name.
    // We only allow segment overwrites for *first* registration.
    delete this._allowOverwriteSegment[id];

    return registeredSegment._getActionCreator();
  }

  /**
   * Returns the instantiated segment.
   *
   * @param {Class<Segment>} SegmentClass
   * @param {Object} dependencyActionCreatorMap
   * @return {Segment}
   */
  _initSegment(SegmentClass, dependencyActionCreatorMap) {
    var id = SegmentClass.id();
    var segment = new SegmentClass(this._config, this._cookieJar, dependencyActionCreatorMap);
    this._segments[id] = segment;
    this._segmentClasses[id] = SegmentClass;
    this._reducers[id] = segment._getReducer();
    this._hydrationOptions[id] = {};
    this._subscribers[id] = {};
    this._actionCreators[id] = segment._getActionCreator();
    this._registeredQueries[id] = {};
    return segment;
  }

  /**
   * Returns true if the prototypes of Segment and its ActionCreator is the
   * same. Segment implementations are not allowed to have configurations that
   * changes its behavior, so we only need to check implementation.
   *
   * Segment dependencies equality are handled independently, since all of them
   * are going to be registered in the same way.
   *
   * We ensure that no Segment clash will happen without an exception being
   * thrown at server side as long as these assumptions are true:
   *
   * 1) This method is executed at server-side, where we have guaranteed access
   *    to Object.getPrototypeOf().
   * 2) All segment registration is made explicit, even the conditional ones,
   *    and they are all registered at server-side.
   *    a) Segment registration is only allowed at ContentRenderer.render().
   *    b) ContentRenderer.render() is a sync method.
   *
   * @param {Segment} registeredSegment
   * @param {Segment} segment
   * @return {boolean}
   */
  _isSegmentEqual(registeredSegment, segment) {
    if (registeredSegment === segment) {
      return true;
    }

    if (Object.getPrototypeOf) {
      return (
        Object.getPrototypeOf(registeredSegment) === Object.getPrototypeOf(segment) &&
        Object.getPrototypeOf(registeredSegment._getActionCreator()) === Object.getPrototypeOf(segment._getActionCreator())
      );
    }

    // Since everything is already checked at server-side, safely assume
    // that the given Segment implementation is the same. All possible Segment
    // clashes would have already triggered an error at server-side.
    return true;
  }

  /**
   * @param {string} segmentId
   * @param {string} queryId
   * @param {any} query
   * @private
   */
  _initQuery(segmentId, queryId, query) {
    if (!this._queries.hasOwnProperty(segmentId)) {
      this._queries[segmentId] = {};
    }
    if (!this._queries[segmentId].hasOwnProperty(queryId)) {
      this._queries[segmentId][queryId] = {};
    }
    if (!this._queries[segmentId][queryId].hasOwnProperty('query')) {
      this._queries[segmentId][queryId].query = query;
    }
  }

  /**
   * Executes the mutation, returns an object containing the original Mutation
   * promise, and another promise that resolves when all refresh requests is
   * done.
   *
   * @param {Mutation} mutation
   * @return {{mutation: Promise; refresh: Promise}}
   */
  execute(mutation) {
    var mutationPromise = mutation.execute();
    var refreshPromise = new Promise((resolve, reject) => {
      mutationPromise.then((refreshRequestMap) => {
        if (refreshRequestMap == null) resolve();
        var segmentId, i, segment, segmentState, queryList, state = this._getState();
        var promiseList = [];
        for (segmentId in refreshRequestMap) {
          if (!refreshRequestMap.hasOwnProperty(segmentId) ||
              !this._segments.hasOwnProperty(segmentId)) {
            continue;
          }
          segment = this._segments[segmentId];
          segmentState = state[segmentId];
          queryList = segment._processRefreshRequests(
            segmentState, refreshRequestMap[segmentId]);
          for (i = 0; i < queryList.length; i++) {
            promiseList.push(this.query(segmentId, queryList[i], true));
          }
          PromiseUtil.allParallel(Promise, promiseList).then(resolve, reject).catch(function(error) {
            reject(error);
            PromiseUtil.throwError(error);
          });
        }
      }, reject).catch(function(error) {
        reject(error);
        PromiseUtil.throwError(error);
      });
    });
    return {
      mutation: mutationPromise,
      refresh: refreshPromise
    };
  }

  /**
   * @param {string} segmentId
   * @param {any} query
   * @param {Function} callback
   * @param {any} component
   * @param {?{[key: RenderType]: HydrationType}} hydrationOption
   * @return {StoreReference}
   */
  subscribe(segmentId, query, callback, component, hydrationOption) {
    // Determine subscriber ID.
    var subscriberId = component[SUBSCRIBER_ID];
    if (!subscriberId) {
      // Yay for not having to deal with concurrency :)
      subscriberId = this._nextSubscriberId++;
      component[SUBSCRIBER_ID] = subscriberId;
    }

    var registeredSegment = this._segments[segmentId];
    if (!registeredSegment) {
      throw new Error('Cannot subscribe, Segment is not registered: ' + segmentId + '.');
    }

    // Initialize hydration option.
    hydrationOption = this._initHydrationOption(hydrationOption);

    // Register query.
    var queryId = registeredSegment._generateQueryId(query);
    this._initQuery(segmentId, queryId, query);

    // TODO: Move hydration option to _queries property.
    if (!this._hydrationOptions[segmentId][queryId]) {
      this._hydrationOptions[segmentId][queryId] = hydrationOption;
    } else {
      // Merge hydration option. If one of the queries ask for it to be loaded
      // at server-side, load at server-side.
      if (hydrationOption[SERVER]) {
        this._hydrationOptions[segmentId][queryId][SERVER] = hydrationOption[SERVER];
      }
    }

    // Query but ignore if we are at server (we'll use hydrate).
    var subscribePromise = this.query(segmentId, query, false, true);
    subscribePromise.catch(PromiseUtil.throwError);

    // Register subscriber, previous init action is sync, so don't have to worry.
    if (!this._subscribers[segmentId][queryId]) this._subscribers[segmentId][queryId] = {};
    this._subscribers[segmentId][queryId][subscriberId] = callback;

    var result = {
      getState: this._getSegmentPiece.bind(this, segmentId, queryId),
      unsubscribe: this._unsubscribe.bind(this, segmentId, queryId, subscriberId)
    };
    return result;
  }

  /**
   * Creates the load action that fetches data. Returns Promise that resolves
   * with the newly stored Segment piece.
   *
   * @param {string} segmentId
   * @param {any} query
   * @param {?boolean} forceLoad
   * @param {?boolean} ignoreAtServer
   * @return {Promise}
   */
  query(segmentId, query, forceLoad, ignoreAtServer) {
    var segment = this._segments[segmentId];
    if (!segment) {
      throw new Error('Cannot query, Segment is not registered: ' + segmentId + '.');
    }

    var queryId = segment._generateQueryId(query);
    this._initQuery(segmentId, queryId, query);

    // Get the piece (data might already be loaded). Since getSegmentPiece() is
    // supposed to be a fast operation anyway, we can just grab segment piece
    // directly.
    var segmentPiece = this._getSegmentPiece(segmentId, queryId);

    if (segmentPiece == null) {
      // We can't know if the segment piece is supposed to be null or not.

      // This will mean loads and loads of sync init actions even though the
      // stuff has already been loaded.
      // TODO: Remove at a later date.

      // Populate with initial data if not already populated.
      var initAction = segment._createSyncInitAction(queryId);
      if (initAction != null) {
        if (typeof initAction == 'function') {
          throw new Error('Init action must be sync! Please return an action object instead!');
        }
        this.dispatch(initAction);
      }
    }

    // If we are at server, and is told to ignore, return a promise that
    // never resolves. The reason for this is we wanted to ignore queries made
    // server side as we wanted to use hydrate() instead.
    if (ignoreAtServer && this._renderType == SERVER) {
      return new Promise(function() {});
    }

    // Up until this point, segment piece will never be empty.
    // If already loaded, return immediately.
    segmentPiece = this._getSegmentPiece(segmentId, queryId);
    if (segment._isLoaded(queryId, segmentPiece) && !forceLoad) {
      return Promise.resolve(segmentPiece);
    }

    // TODO: We should be able to reuse this get segment piece function.
    var getSegmentPiece = () => {
      return this._getSegmentPiece(segmentId, queryId);
    };

    // Re-use promise from another dispatch to prevent double fetching.
    if (!forceLoad && this._queries[segmentId][queryId].promise) {
      return this._queries[segmentId][queryId].promise.then(getSegmentPiece);
    }

    // Right now either segment isn't loaded yet or this is a force load.
    var loadAction = segment._createLoadAction(query, queryId);
    if (loadAction == null) {
      // If load action is null, then this segment doesn't need to do load
      // actions. We return immediately with previously fetched segment piece.
      return Promise.resolve(segmentPiece);
    }
    return this.dispatch(loadAction).then(getSegmentPiece);
  }

  /**
   * @param {any} component
   */
  unsubscribe(component) {
    var componentSubscriberId = component[SUBSCRIBER_ID];
    var segmentName, queryId, subscriberId;
    var unsubscribeList = [];
    for (segmentName in this._subscribers) {
      if (!this._subscribers.hasOwnProperty(segmentName)) continue;
      for (queryId in this._subscribers[segmentName]) {
        if (!this._subscribers[segmentName].hasOwnProperty(queryId)) continue;
        for (subscriberId in this._subscribers[segmentName][queryId]) {
          if (!this._subscribers[segmentName][queryId].hasOwnProperty(subscriberId)) continue;
          if (subscriberId == componentSubscriberId) {
            unsubscribeList.push([segmentName, queryId, componentSubscriberId]);
          }
        }
      }
    }

    var i;
    for (i = 0; i < unsubscribeList.length; i++) {
      this._unsubscribe(unsubscribeList[i][0], unsubscribeList[i][1], unsubscribeList[i][2]);
    }
  }

  /**
   * Returns a Promise that is resolved when the action is dispatched
   * to all reducers.
   *
   * If the given action is an Object, its dispatch will be sync, so a Promise
   * that resolves immediately is given.
   *
   * If the given action is a thunk function, it will check if the function
   * returns a Promise or not. If not, it will throw an error. Otherwise the
   * Promise is returned.
   *
   * @param {Thunk | Object} action
   * @return {Promise}
   */
  dispatch(action) {
    // No need to do anything if the action is null/undefined. This is a pattern
    // used when Segments don't need to do init or load actions.
    if (action == null) {
      return Promise.resolve(null);
    }

    var result;
    if (action instanceof Thunk) {
      // We initialize the query just in case the user calls dispatch directly
      // using action creator.
      this._initQuery(action.segmentId, action.queryId, action.query);
      // Immediately create a promise so we can ensure no identical fetching
      // can happen at the same time with query() or subscribe().
      return this._queries[action.segmentId][action.queryId].promise = new Promise((resolve, reject) => {
        // Resolve dependencies first.
        var depResolvedPromise = Promise.resolve(null);
        if (action.dependencies instanceof QueryDependencies) {
          depResolvedPromise = action.dependencies._run(this);
        }

        // After dependencies are resolved, run the thunk function. The thunk
        // function should still have reference to QueryDependencies, allowing
        // it to access its dependencies' query results.
        depResolvedPromise.then(() => {
          // TODO: Cache the bound store dispatch.
          result = action.func(this.dispatch.bind(this));
          this._ensurePromise(result);
          result.then(resolve).catch(reject);
        }).catch(reject);
      });
    }

    this._store.dispatch(action);
    return Promise.resolve(null);
  }

  /**
   * @param {Promise} promise
   */
  _ensurePromise(promise) {
    if (promise == null || typeof promise.then != 'function') {
      throw new Error('Expected Promise from async action creator, got this instead: ' + promise + '.');
    }
  }

  /**
   * @returns {any}
   */
  _getState() {
    return this._store.getState();
  }

  /**
   * Can be used to instantly reproducing extracted state. Useful for generating
   * test cases or reproducing customer bugs.
   *
   * IMPORTANT: Calling this method may cause mismatch between redux store and
   * registered segments. You should only call this when you know what you're
   * doing.
   *
   * @param {any} newState
   */
  _replaceState(newState) {
    this._store.dispatch({
      type: REPLACE_STATE,
      state: newState
    });
  }

  /**
   * Returns current timestamp.
   *
   * @returns {number}
   */
  _getTimestamp() {
    return Date.now ? Date.now() : (new Date()).getTime();
  }
}