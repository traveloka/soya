import Page from './Page.js';
import ReduxStore from '../data/redux/ReduxStore.js';

/**
 * Useful for react+redux page creation.
 *
 * @CLIENT_SERVER
 */
export default class ReduxPage extends Page {
  createStore(initialState) {
    var reduxStore = new ReduxStore(initialState, this.config, this.cookieJar);
    return reduxStore;
  }
}