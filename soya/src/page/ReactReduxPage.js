import Page from './Page.js';
import ReduxStore from '../data/redux/ReduxStore.js';

/**
 * Useful for react+redux page creation.
 *
 * @CLIENT_SERVER
 */
export default class ReactReduxPage extends Page {
  createStore(initialState) {
    var reduxStore = new ReduxStore(Promise, initialState, this.config, this.cookieJar);
    return reduxStore;
  }
}