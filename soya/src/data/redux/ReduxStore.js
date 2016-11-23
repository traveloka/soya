/* @flow */

import Store from '../Store.js';
import PromiseUtil from './PromiseUtil.js';
import Load from './Load.js';
import QueryDependencies from './QueryDependencies.js';
import Hydration from './Hydration.js';
import Service from './Service.js';

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
 * 1. Wraps redux store's dispatch, reads special Load object and executes its
 *    associated query dependencies.
 * 2. Wraps redux store's subscribe to makes it easier for components to
 *    'connect' or listen to changes to just a specific part of the state instead
 *    of the entire state.
 * 3. Listen to store changes, then asks each segment to decide whether or not
 *    the state has changed considerably to trigger re-rendering on each
 *    subscription.
 * 4. By separating regular actions and load actions performed during query,
 *    makes it easier to perform server side hydration.
 *
 * @CLIENT_SERVER
 */
export default class ReduxStore extends Store {
  /**
   * @type {boolean}
   */
  _inHydration;

  /**
   * @type {number}
   */
  _nextSubscriberId;

  /**
   * @type {{[key: string]: Class<Segment>}}
   */
  _segmentClasses;

  /**
   * @type {{[key: string]: Service}}
   */
  _services;

  /**
   * @type {{[key: string]: Class<Service>}}
   */
  _serviceClasses;

  /**
   * @type {{[key: string]: Array<Service>}}
   */
  _serviceDependencies;

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
   *         subscriberId: callbackFunc,
   *         subscriberId: callbackFunc
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
  _clientConfig;

  /**
   * @type {CookieJar}
   */
  _cookieJar;

  /**
   * @type {boolean}
   */
  __isReduxStore;

  /**
   * @param {any} initialState
   * @param {Object} clientConfig
   * @param {CookieJar} cookieJar
   */
  constructor(initialState, clientConfig, cookieJar) {
    super();
    this.__isReduxStore = true;
    this._inHydration = false;
    this._allowRegisterSegment = false;
    this._clientConfig = clientConfig;
    this._segmentClasses = {};
    this._queries = {};
    this._services = {};
    this._serviceClasses = {};
    this._serviceDependencies = {};
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
    this._actionCreators = {};
    this._allowOverwriteSegment = {};
    this._cookieJar = cookieJar;
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
    // https://github.com/zalmoxisus/redux-devtools-extension
    // TODO: Probably should be framework config instead of client config?
    let composeEnhancers = compose;
    if (this._clientConfig.enableDevTools && scope.client) {
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    }

    var composedCreateStore = composeEnhancers(
      applyMiddleware(thunk)
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
      if (!this._segmentClasses.hasOwnProperty(segmentName)) continue;
      reducer = this._reducers[segmentName];
      segment = this._segmentClasses[segmentName];
      segmentState = state[segmentName];
      nextSegmentState = reducer(segmentState, action);
      isChanged = isChanged || !segment.isStateEqual(segmentState, nextSegmentState);
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
    if (scope.server) {
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
    var segmentId, segment, segmentState, prevSegmentState, segmentSubscribers,
        queryId, querySubscribers, subscriberId, segmentPiece, shouldUpdate, query;
    for (segmentId in this._segmentClasses) {
      if (!this._segmentClasses.hasOwnProperty(segmentId)) continue;
      segment = this._segmentClasses[segmentId];
      segmentSubscribers = this._subscribers[segmentId];
      segmentState = state[segmentId];
      prevSegmentState = this._previousState.state[segmentId];
      for (queryId in segmentSubscribers) {
        if (!segmentSubscribers.hasOwnProperty(queryId)) continue;
        querySubscribers = segmentSubscribers[queryId];
        // If segmentState is previously null, then this is a new query call.
        // First getState() method call should already return the initialized
        // object, so we don't need to call update.
        // TODO: This assumption/design seems to be flawed, null to existence is a change, and we should notify listeners.
        shouldUpdate = false;
        query = this._queries[segmentId][queryId].query;
        segmentPiece = segment.comparePiece(prevSegmentState, segmentState, query, queryId);
        shouldUpdate = segmentPiece != null;
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
   * be that when we are done with handling the change and wish to set previous
   * state, the previous state we own is already stale.
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
   * @param {?Hydration} hydration
   * @return {Hydration}
   */
  _initHydrationOption(hydration) {
    if (hydration == null) return Hydration.hydrateAtServer(0);
    return hydration;
  }

  /**
   * @param {string} segmentId
   * @param {any} query
   * @param {string} queryId
   * @returns {Object}
   */
  _getSegmentPiece(segmentId, query, queryId) {
    var queryResult = this._queryState(segmentId, query, queryId);
    if (!queryResult.loaded) return null;
    return queryResult.data;
  }

  /**
   * @param {string} segmentId
   * @param {any} query
   * @param {string} queryId
   * @returns {QueryResult}
   */
  _queryState(segmentId, query, queryId) {
    var state = this._store.getState();
    var segmentState = state[segmentId];
    var queryResult = this._segmentClasses[segmentId].queryState(query, queryId, segmentState);
    if (queryResult.constructor != QueryResult) throw new Error('Segment.queryState must return instance of QueryResult! queryId: ' + queryId);
    return queryResult;
  }

  /**
   * @param {string} segmentName
   * @param {string} queryId
   * @param {string} subscriberId
   */
  _unsubscribe(segmentName, queryId, subscriberId) {
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
    for (segmentName in this._segmentClasses) {
      if (!this._segmentClasses.hasOwnProperty(segmentName)) continue;
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
   * Runs hydration, depending on rendering type and hydration option. This
   * method is run twice, at server and at client side. Server side hydration
   * carries over to client side, so when we reinitialize everything at client
   * side, we'll run this method again to load queries that was specified to
   * only not to hydrate at server side.
   *
   * NOTE: Hydration is only done once per subscription. It's safe to call this
   * method more than once, anytime - to make sure that all registered state is
   * hydrated.
   *
   * @return {Promise}
   */
  hydrate() {
    this._inHydration = true;
    var segment, segmentId, queryId, queries, hydration;
    var hydrationPromises = [], promise, query;
    for (segmentId in this._queries) {
      if (!this._queries.hasOwnProperty(segmentId)) continue;
      segment = this._segmentClasses[segmentId];
      if (!segment.shouldHydrate()) {
        // No need to hydrate local segments.
        continue;
      }
      queries = this._queries[segmentId];
      for (queryId in queries) {
        if (!queries.hasOwnProperty(queryId)) continue;
        hydration = queries[queryId].hydration;
        query = queries[queryId].query;

        // Don't need to do anything if it's already loaded.
        var queryResult = this._queryState(segmentId, query, queryId);
        if (queryResult.loaded) continue;

        var shouldLoad = (
          scope.client ||
          (scope.server && hydration.shouldHydrateAtServer())
        );

        if (shouldLoad) {
          promise = this._query(segment, segmentId, query, queryId, false);
          hydrationPromises.push(promise);
        }
      }
    }
    return PromiseUtil.allParallel(Promise, hydrationPromises);
  }

  /**
   * Registers Segment to ReduxStore. ReduxStore splits the single state of
   * redux into multiple 'segments', each with their own action creator and
   * reducer. This is because when you use an action creator to create actions,
   * almost all of the time you also need the reducer that can process that
   * action. Since Segment encompasses both action creator and reducer of a
   * specific part of the state, you can say that one Segment is responsible for
   * a part, or a 'segment' of the state, and nothing else.
   *
   * In this method, we:
   *
   * 1) Make sure that there's no Segment id clash. We split redux state using
   *    the segment id as keys, so if there are clashes of segment names we
   *    can end up having corrupt state because two reducers will be trying to
   *    update the same object.
   * 2) Allow multiple registration of the same Segment class. Since we enforce
   *    subscribing components to declare their segment dependencies, we'll have
   *    multiple components registering the same segments.
   * 3) Returning a StoreReference object that can be used by components. It
   *    contains the action creator for this Segment.
   * 4) Since Segment can have dependencies, this method will also registers
   *    the dependencies of the given Segment recursively.
   *
   * @param {Class<Segment>} SegmentClass
   * @return {Object<string, Function>} Action creator.
   */
  register(SegmentClass) {
    // First let's register all dependencies that this Segment class has.
    var i, dependencies = SegmentClass.getSegmentDependencies();
    for (i = 0; i < dependencies.length; i++) {
      this.register(dependencies[i]);
    }

    // Get the segment ID to see if we already have registered the segment.
    var id = SegmentClass.id();
    var RegisteredSegmentClass = this._segmentClasses[id];

    if (this._segmentClasses.hasOwnProperty(id)) {
      if (RegisteredSegmentClass === SegmentClass) {
        // Segment already registered.
        return RegisteredSegmentClass.getActionCreator();
      } else {
        throw new Error('Segment name clash: ' + id + '.', RegisteredSegmentClass, SegmentClass);
      }
    }

    // Register segment.
    if (!RegisteredSegmentClass) {
      this._initSegment(SegmentClass);
      RegisteredSegmentClass = SegmentClass;
    }
    else if (SegmentClass !== RegisteredSegmentClass) {
      if (this._allowOverwriteSegment[id]) {
        // TODO: Create a DEBUG flag using webpack so that we can silent logging in production? or..
        // TODO: Make two logger implementation, client and server, then use clientReplace accordingly.
        console.log('Replacing segment.. (this should not happen in production!)', RegisteredSegmentClass, SegmentClass);
        this._initSegment(SegmentClass);
        RegisteredSegmentClass = SegmentClass;
      } else {
        throw new Error('Segment id clash! Claimed by ' + RegisteredSegmentClass + ' and ' + SegmentClass + ', with id: ' + id + '.');
      }
    }

    // No longer allow segment overwrites for this segment name.
    // We only allow segment overwrites for *first* registration.
    delete this._allowOverwriteSegment[id];

    return RegisteredSegmentClass.getActionCreator();
  }

  /**
   * @param {Class<Segment>} SegmentClass
   */
  _initSegment(SegmentClass) {
    var id = SegmentClass.id();
    this._segmentClasses[id] = SegmentClass;
    this._reducers[id] = SegmentClass.getReducer();
    this._subscribers[id] = {};
    this._actionCreators[id] = SegmentClass.getActionCreator();
    this._registeredQueries[id] = {};
    this._serviceDependencies[id] = {};

    var i, serviceId, serviceClass, service,
      serviceDeps = SegmentClass.getServiceDependencies();
    for (i = 0; i < serviceDeps.length; i++) {
      serviceClass = serviceDeps[i];
      serviceId = serviceClass.id();
      if (typeof serviceId != 'string') {
        throw new Error('Service dependencies must extend Service:' + serviceClass);
      }
      if (this._serviceClasses.hasOwnProperty(serviceId)) {
        if (this._serviceClasses[serviceId] === serviceClass) {
          service = this._services[serviceId];
        } else {
          // TODO: Find a way to make this hot-reload-able.
          throw new Error(`Service id clash: ${serviceId}, between classes: ${serviceClass} and ${this._serviceClasses[serviceId]}`);
        }
      } else {
        service = new serviceClass(this._clientConfig, this._cookieJar);
        this._serviceClasses[serviceId] = serviceClass;
        this._services[serviceId] = service;
      }
      this._serviceDependencies[id][serviceId] = service;
    }
  }

  /**
   * @param {string} segmentId
   * @return {{[key: string]: Service}}
   */
  getServiceDependencies(segmentId) {
    return this._serviceDependencies[segmentId];
  }

  /**
   * @param {string} segmentId
   * @param {string} queryId
   * @param {any} query
   * @param {Hydration} hydration
   */
  _initQuery(segmentId, queryId, query, hydration) {
    hydration = this._initHydrationOption(hydration);
    if (!this._queries.hasOwnProperty(segmentId)) {
      this._queries[segmentId] = {};
    }
    if (!this._queries[segmentId].hasOwnProperty(queryId)) {
      this._queries[segmentId][queryId] = {};
    }
    if (!this._queries[segmentId][queryId].hasOwnProperty('query')) {
      this._queries[segmentId][queryId].query = query;
    }
    if (this._queries[segmentId][queryId].hasOwnProperty('hydration')) {
      hydration = this._queries[segmentId][queryId].hydration.clash(hydration);
    }
    this._queries[segmentId][queryId].hydration = hydration;
  }

  /**
   * Executes the mutation, returns an object containing the original Mutation
   * promise, and another promise that resolves when all refresh requests is
   * done.
   *
   * Mutation works by having each Segment define their own refresh requests.
   * Since we don't want to refresh anything if there's nothing loaded in the
   * segment state, we ask the Segment, providing their current segment state,
   * to tell us which query we need to re-run.
   *
   * TODO: Need to figure out how to handle mutation at server side.
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
              !this._segmentClasses.hasOwnProperty(segmentId)) {
            continue;
          }
          segment = this._segmentClasses[segmentId];
          segmentState = state[segmentId];
          queryList = segment.processRefreshRequests(
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
   * Subscribes the given callback against the a specific query to a specific
   * segment. When the state changes, ReduxStore will ask the Segment to
   * determine if the query result has changed. If the query result has changed,
   * the callback will be run.
   *
   * Hydration option
   *
   * @param {string} segmentId
   * @param {any} query
   * @param {Function} callback
   * @param {any} component
   * @param {?Hydration} hydration
   * @return {StoreReference}
   */
  subscribe(segmentId, query, callback, component, hydration) {
    // Determine subscriber ID.
    var subscriberId = component[SUBSCRIBER_ID];
    if (!subscriberId) {
      // Yay for not having to deal with concurrency :)
      subscriberId = this._nextSubscriberId++;
      component[SUBSCRIBER_ID] = subscriberId;
    }

    var segment = this._segmentClasses[segmentId];
    if (!segment) {
      throw new Error('Cannot subscribe, Segment is not registered: ' + segmentId + '.');
    }

    // TODO: We call generateQueryId twice on subscribe, fix.
    var queryId = segment.generateQueryId(query);

    // Runs the query (if we're at server, the query won't actually be run).
    // Server side queries will be run through hydrate() method.
    var subscribePromise = this.query(segmentId, query, false, hydration);
    subscribePromise.catch(PromiseUtil.throwError);

    // Register subscriber.
    if (!this._subscribers[segmentId][queryId]) this._subscribers[segmentId][queryId] = {};
    this._subscribers[segmentId][queryId][subscriberId] = callback;

    var result = {
      getState: this._getSegmentPiece.bind(this, segmentId, query, queryId),
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
   * @param {?Hydration} hydration
   * @return {Promise}
   */
  query(segmentId, query, forceLoad, hydration) {
    var segment = this._segmentClasses[segmentId];
    if (!segment) {
      throw new Error('Cannot query, Segment is not registered: ' + segmentId + '.');
    }

    // TODO: When we turn on history navigation, this._queries map will pile up, causing memory leak. Fix.
    var queryId = segment.generateQueryId(query);
    this._initQuery(segmentId, queryId, query, hydration);
    hydration = this._queries[segmentId][queryId].hydration;

    if ((scope.server && !this._inHydration) ||
        (scope.server && !hydration.shouldHydrateAtServer())) {
      // If at server, returns a promise that never resolves. Querying in server
      // will be done via an explicit hydrate() method. This reduces unnecessary
      // execution of code at our server, ensuring no surprises when dealing
      // with configuration option.
      return new Promise(function() {});
    }

    return this._query(segment, segmentId, query, queryId, forceLoad);
  }

  _query(segment, segmentId, query, queryId, forceLoad) {
    // If already loaded, return immediately.
    var queryResult = this._queryState(segmentId, query, queryId);
    if (queryResult.loaded && !forceLoad) {
      return Promise.resolve(queryResult.data);
    }

    // TODO: We should be able to reuse this get segment piece function.
    var getSegmentPiece = () => {
      return this._getSegmentPiece(segmentId, query, queryId);
    };

    // Re-use promise from another dispatch to prevent double fetching.
    if (!forceLoad && this._queries[segmentId][queryId].promise) {
      return this._queries[segmentId][queryId].promise.then(getSegmentPiece);
    }

    // Right now either segment isn't loaded yet or this is a force load.
    // So we ask Segment to load the query.
    var state = this._store.getState();
    var segmentState = state[segmentId];
    var services = this.getServiceDependencies(segmentId);
    var loadAction = segment.createLoadFromQuery(query, queryId, segmentState, services);
    if (loadAction == null) {
      // If load action is null, then this segment doesn't need to do load
      // actions. We return immediately with previously fetched segment piece.
      return Promise.resolve(queryResult.data);
    }

    // Cache the load promise so multiple same queries will only result in
    // one load action, saving user's bandwidth. If the user dispatches the
    // load action directly, the promise won't get cached, so make sure to
    // mention to the user to use query to load data whenever possible.
    var loadPromise = this.dispatch(loadAction);
    this._queries[segmentId][queryId].promise = loadPromise;

    // Return a promise that resolves with the segment piece.
    return loadPromise.then(getSegmentPiece);
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
   * @param {Load | Object} action
   * @return {Promise}
   */
  dispatch(action) {
    // No need to do anything if the action is null/undefined. This is a pattern
    // used when Segments don't need to do init or load actions.
    if (action == null) {
      return Promise.resolve(null);
    }

    var result;
    if (action instanceof Load) {
      // Immediately create a promise so we can ensure no identical fetching
      // can happen at the same time with query() or subscribe().
      return new Promise((resolve, reject) => {
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