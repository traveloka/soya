# Version 0.0.x

## 0.0.75

- Fix `CookieJar.remove()` and `Cookie.createRemoval()` bug, made `secure` a
  required parameter in removing cookie.

## 0.0.74

- Update `ServerHttpRequest` and `ClientHttpRequest` to have both `getQuery()`
  and `getQueryParams()`.
- Extract query string parser for outside usage.

## 0.0.70

- Upgrade to Babel 6.
- Soya no longer determines babel configuration for your project. You'll need
  to configure it yourself. This allows different files to have multiple babel
  configuration, according to Babel's standard for finding .babelrc.
- Client replace and client resolve no longer working (since nobody uses them,
  will update them as soon as there's a need).
- How to update:
  - Remove all Babel related lines in your package.json into these:
        
        ```
        "babel-core": "^6.4.5",
        "babel-loader": "^6.2.1",
        "babel-preset-es2015": "^6.3.13",
        "babel-preset-react": "^6.3.13",
        "babel-preset-stage-2": "^6.18.0",
        "babel-plugin-transform-export-extensions": "^6.8.0",
        "babel-plugin-transform-object-assign": "^6.8.0",
        ```
        
  - Still in package.json, add the following Babel configuration (you may
    modify them if you wish):
    
        
        "babel": {
            "presets": [
            "es2015",
            "react",
            "stage-2"
          ],
          "plugins": [
            "transform-export-extensions",
            "transform-object-assign"
          ]
        }
        
        
  - Change the contents of `webpack.config.js` into this (you can also copy
    and paste from integration test):
    
        
        var webpack = require('webpack');
        var Precompiler = require('soya/lib/precompile/Precompiler').default;
        var WebpackCompiler = require('soya/lib/compiler/webpack/WebpackCompiler').default;
        var config = require('./config');

        var precompiler = new Precompiler(config.frameworkConfig);
        precompiler.precompile();

        var webpackConfig = WebpackCompiler.createServerBuildConfig(webpack, config.frameworkConfig);
        module.exports = webpackConfig;
        
  
  - Remove `node_modules` folder and do a fresh `npm install`.
- If you're contributing to soya:
  - Fetch the updates.
  - Remove `node_modules` folder and do a fresh `npm install`.

## 0.0.69

- Form submission now doesn't assume that the user wants to disable and
  re-enable the form on submission.
- Users can use `Form.lockSubmission()` and `Form.unlockSubmission()` if they
  would like to lock the form when submitting. User can create buttons that
  listens to this state so it can auto-disable when form is in submission.

## 0.0.68

- Remove unnecessary import to redux-devtools.

## 0.0.67

- Expose webpack root resolve alias into frameworkConfig.defaultImportBase.
- Add fieldValue query to FormSegment.

## 0.0.66

- Updated logic of handleChange(), fixed bug recursive handleChange() bug. The
  new implementation should no longer have inconsistency between redux state
  and view state.
- Added simple test case for recursive handleChange().

## 0.0.65

- Add Form.enableField(), Form.enableFields() helper.
- Add Form.disableField(), Form.disableFields() helper.

## 0.0.64

- Fix isEqualShallowArray helper bug.
- Remove unnecessary logs.

## 0.0.63

- Application now send 'ready' event to tell pm2 that it's online.
  Add "--listen-timeout <delay in ms> --wait-ready" on pm2 start parameter to
  ask pm2 to wait for you app to be ready.

## 0.0.62

- Fix inconsistent server and client side CSS class name when debug is set to
  true and hot reload set to false.

## 0.0.61

- Nullability check in shallow equal helpers.

## 0.0.60

- Helper methods in Form (it's more correct to have users access from Form
  instead of giving them FormSegment's action creator, it should be an
  implementation detail).
  - Form.setValue
  - Form.setValues
  - Form.setDefaultValue
  - Form.setDefaultValues
  - Form.setErrors
  - Form.addErrors
  - Form.clearForm
  - Form.clearErrors

## 0.0.59

- QueryResult.notLoaded() can now provide data.
- ReduxStore will not pass null if QueryResult is not loaded.

## 0.0.58

- FormSegment now has setDefaultValue() and setDefaultValues() action creator.
- createField helper provides setDefaultValue() as props.

## 0.0.57

- ReduxStore.getService(ServiceClass), use this method to get service instance.

## 0.0.56

- Load.func is called with dispatch, query, and service dependencies as
  arguments. This is more natural, since action creators are the ones that need
  services.
- How to update:
  - When instantiating Load(), pass segment ID into the constructor. For
    example:
    ```
    let load = new Load(UserSegment.id());
    ```

## 0.0.55

- Load.func is called with both dispatch and query as arguments.

## 0.0.54

- ReduxStore.getServiceDependencies() is made public.
- If debug flag is set to true, CSS module classes will have identifiers that
  hold hints to the actual file and class name.

## 0.0.53

- Change segment method names and make them static.
- Added Service classes and the concept of service dependencies, allowing
  development of component testing scenarios by mocking services.
- Remove PromiseImpl from ReduxStore constructor.
- How to update:
  - All your pages:
    - Change all pages that uses ReduxStore to extend from ReduxPage instead.
      You'll no longer need to override Page.createStore(), so remove that
      method. If you don't do this all your pages will throw an error.
    - If you instantiate ReduxStore directly, remove the first constructor
      argument (Promise).
    - Use Page.createContext() to create context object instead of creating it
      directly. Please see integration test pages for example.
  - This applies to all your segment classes:
    - Change _generateQueryId() to static generateQueryId().
    - Change _createLoadFromQuery() to static createLoadFromQuery().
    - Change _queryState() to static queryState().
    - Change _isStateEqual() to static isStateEqual().
    - Change _comparePiece() to static comparePiece().
    - Change _getReducer() to static getReducer().
    - Change _getActionCreator() to static getActionCreator().
    - Change _processRefreshRequests() to static processRefreshRequests().
    - Change the usage of _dependencyActionCreatorMap, use
      Segment.getActionCreator() instead.
    - Remove constructor on all of your segments.
      - Move initialization of action types to const declarations above.
      - Move action creator and reducer above the class definitions.
  - Change usage of MapSegment:
    - this._createSetResultAction(...) needs to change into
      this.getActionCreator().set(...).
  - Change usage of LocalSegment:
    - If getActionCreator() is overridden, make sure that getReducer() is also
      overridden.

## 0.0.52

- Fix CookieJar read returning inconsistent return values on server side
  (undefined) and client side (null). Changed server side to return null.
- Fix integration with Redux Dev Tools chrome extension
  (https://github.com/zalmoxisus/redux-devtools-extension).
- ReduxStore now doesn't assume query is not loaded if the segment state is
  null.

## 0.0.51

- Fix ReduxStore not updating component if previous segment state is null.

## 0.0.50

- Fix fetching on server side of non hydrated queries.
- Fix CSS modules resolving as undefined in server.
- Added extra check to ensure that the return value of _queryState() is
  QueryResult, should make it easier to build segment that way.

## 0.0.49

- Fix FormSegment bug.

## 0.0.48

- Rename _createSyncLoadActionObject() to _createSetResultAction().
- How to update:
  - Rename usage of the above method to the new name. Signatures does not
    change.

## 0.0.47

- Rename Thunk object name to Load.
- Remove the need for query, queryId in Load.
- Rename _createLoadAction to _createLoadFromQuery() to make it clearer that
  Load actions can be created without any connection with queries.
- Remove _generateThunkFunction() from MapSegment.
- How to update:
  - Update _generateThunkFunction() into _createLoadFromQuery() method.

## 0.0.46

- Update Thunk constructor to follow (query, queryId) arg convention.

## 0.0.45

- Update MapSegment._generateThunkFunction() interface.

## 0.0.44

- Replace Segment.isLoaded() and Segment.getPieceObject() with
  Segment.queryState().
- Add the passing of segmentState on Segment.createLoadAction() to enable
  saving of states that changes the way we load data from external sources
  in our own segment.
- Redux devTools() now must be enabled with client configuration.
- Better semantics for Query, Load, Hydration, Subscribe.
- How to update:
  - Find '.loaded' string for the usage of MapSegment, instead of checking
    loaded variable, change it into null checking.
  - Create _isLoadQuery() implementation that always returns true.
  - Replace hydration configuration object with new Hydration instance.

## 0.0.43

- Fix MapSegment bug in getting piece directly.
- Deprecates SyncCleanAction and SyncInitAction on ReduxStore.
- Differentiate store namespace for component browser and default value.
- Fix Segment._isLoaded() interface.
- Remove references to PromiseImpl.

## 0.0.42
- Add CmptBrowserListPage only if frameworkConfig.componentBrowser is defined and true.

## 0.0.40

- Added Page.createContext() method to make passing down context objects like
  cookieJar, store, router and config easier.
- Minor update on component browser styling.

## 0.0.39

- Remove author name (distraction, will have to think later on where to place it).
- Remove transition as it's causing some rendering issues.

## 0.0.38

- Updated component browser design, added category, author name, doc component.

## 0.0.37

- server.js becomes automatically generated on server-side compilation.
- Removed the ability to set directory for pages and components. Everything by
  convention must be stored inside $SOYA_PROJECT_DIR/src. However, we also
  remove the double directory convention for pages (pages can be anywhere you
  want).
- Added root resolve configuration on webpack so that we can resolve components
  from $SOYA_PROJECT_DIR.
- Auto generation of component browser list page.
- How to update:
  - Change routes.yml to use relative path instead.
  - Update webpack.config.js.

## 0.0.36

- Built result doesn't contain absolute path anymore. However when running we
  need to specify SOYA_PROJECT_DIR environment variable.

## 0.0.31

- Enable SCSS support.

## 0.0.30

- Fixed common.css file disappearing bug.
- Fixed form-wide validation error messages not clearing.
- From now on, only CSS files with *.mod.css file name will be converted into
  CSS module hashes. This is to prevent unwanted conversion of non-soya
  libraries we load from node_modules.

## 0.0.29

- Moved integration test segment IDs into another package so that mutations can
  refer to these IDs without explicitly declaring dependency to Segment.
- Mutation system implemented and tested.
- Implemented webpack's extract-text-plugin.
  - CSS now delivered as files instead of appended dynamically by javascript
    when hot-reload is turned off. This means no more flash-of-unstyled-content.
  - CSS can also have common.css module.
- Added commonFileThreshold framework configuration to mirror webpack's
  minChunks configuration.

## 0.0.28

- LocalSegment implementation for browser-only redux store state:
  - Checking whether a piece is loaded or not is now relegated to each Segment
    implementation. This means there are no longer contract between ReduxStore
    and Segment implementation on how the segment piece should be structured.
  - Segment implementation now has shouldHydrate() method. If it returns false,
    ReduxStore will not try to hydrate its queries.
  - If Segment.createLoadAction() returns null, it just returns the previous
    segment piece and doesn't do dispatch.
  - Uses react immutability helper.
  - https://bitbucket.org/bentomas/smokesignals.js
  - Create test case: modal windows.
- Decided to include smokesignals as default event emitter library. Other
  libraries uses singleton, which makes hot-reload and history navigation a
  pain to code (you have to manually destroy subscription at component unmount).
- Added isReactChildrenEqual() to redux helpers, compares type and props of
  children.
- Added _replaceState() method to redux store, for testing and reproducing bugs.
- DataComponent now created with wrapper component instead of class inheritance.
  - Added static connectId() method to make log reading easier.
- Form with redux:
  - Added generic FormSegment to contain data for our forms.
  - Added Field wrapper that wraps an input element to a specific field in a form.
  - Form can be enabled and disabled. Added test cases for various input
    elements, including a rather complex autocomplete input.
  - Form can have per-field sync, async and submit validations. It can also have
    form-wide validation that is triggered on submit.
  - Form can have complex structures, including recursive maps and lists.
  - Form can have repeatable structures.
- Added soya/lib/scope for easier server/client conditional.
- Segment can access action creator of its dependencies.
- Added support to redux chrome plugin (hack).

## 0.0.26

- Segment instantiation is now done by ReduxStore.
  - Segment equality check is done by checking the given constructor function.
  - DataComponent returns array of Segment constructor functions.
  - Segment.getName() becomes a static id() method.
  - Remove Segment._activate(), constructor is used instead.
- Removed custom ActionCreator class, Segment becomes the class that is
  responsible for both Reducer and Action Creator of a state tree segment.
  - MapSegment.getActionCreator() now just returns an object with bound
    function.
- Prevent double querying.
  - Separate subscribe and query function.
  - User can do manual query through ReduxStore.query(), which checks segment
    state first.
  - ReduxStore.query() also re-uses Promises cached by dispatch(), ensuring that
    at any given time, there are no more than 1 identical query.
  - User can force load with query() and action creator.
- Removed query registration from Segment, it's now the responsibility of
  ReduxStore.
- Removed query options. They complicate things, cache and poll will be
  implemented without using query options.
- Add clear components and force load link to runtime components test.
- Change _createCleanAction() to _createSyncCleanAction(). Also change other
  method names to signify that they're supposed to be sync.
- Created QueryDependencies, tested serial and parallel segment dependencies.
  - ReduxStore.register() also register Segment dependencies recursively.
  - ReduxStore.dispatch() process QueryDependencies.
  - Recursive QueryDependencies tested to be working.
  - Function based QueryDependencies tested to be working.
  - Recursive SegmentDependencies tested to be working.
- Render context (inServer) is passed to Page.
- Cookies now set with universal CookieJar instance, whose lifecycle is
  maintained by the framework.
- Segments can now store and access cookies universally via CookieJar.
- Made CSS modules configurable.

## 0.0.23

- Access CSS class names no longer with helper function:
  - https://github.com/webpack/style-loader/pull/77#issuecomment-148506208

## 0.0.22

- Change registerSegments() into createSegments(), a static method.
- Create ReduxStore.registerDataComponent() to allow conditional runtime
  creation of DataComponents.
- Move Segment equality check to ReduxStore().

## 0.0.21

- Client resolve functions working again.
- Append module.hot.accept() automatically on Page files.
- Separated Segment registration and query subscription at ReduxStore.
- Hot-reload Segment and ActionCreator now works.
- DataComponent now assumes immutability on props and state, overrides
  shouldComponentUpdate() by default.
- DataComponent now uses componentWillReceiveProps() to update internal state
  with segment pieces.
- DataComponent now has shouldSubscriptionsUpdate() - which determines whether
  we should unsubscribe everything and re-run subscribeQueries() again.
- Simplified RenderType to just CLIENT and SERVER.
- Removed HydrationType, CLIENT subscription now *always* load data, while
  SERVER subscription *never* loads. Server hydration is done explicitly with
  Store.hydrate().
- Added Store._setRenderType(), making ReduxStore behavior different between
  client and server.
  - At SERVER, handleChange *never* triggers callback.
  - At SERVER, subscription doesn't load automatically.

## 0.0.20

- Hot-loading done at Page level without react-hot-loader.
