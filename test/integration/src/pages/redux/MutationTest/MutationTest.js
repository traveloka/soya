import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer.js';
import register from 'soya/lib/client/Register';
import ReduxStore from 'soya/lib/data/redux/ReduxStore.js';
import UserProfile from '../../../components/contextual/UserProfile/UserProfile.js';
import BadgeList from '../../../components/contextual/BadgeList/BadgeList.js';
import IncrementUserPostMutation from '../../../mutation/IncrementUserPostMutation.js';
import ResetUserPostMutation from '../../../mutation/ResetUserPostMutation.js';
import FlipBadgeMutation from '../../../mutation/FlipBadgeMutation.js';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';

// TODO: Figure out how to do promise polyfill.
import style from '../../../shared/sitewide.css';

const USERNAME_A = 'rickchristie';
const USERNAME_B = 'willywonka';
const USERNAME_C = 'captainjack';

class Component extends React.Component {
  render() {
    return <div>
      <h1>Mutation Test</h1>
      <ul>
        <li>When you <a href="javascript:void(0)" onClick={this.incrementSingle.bind(this, USERNAME_A)}>click this link</a>, the increment post mutation for <code>{USERNAME_A}</code> will be executed.</li>
        <li>When mutation is successful, the user profile data should be automatically refetched by <code>ReduxStore</code>.</li>
        <li>When you <a href="javascript:void(0)" onClick={this.resetAll.bind(this, 5)}>click this link</a>, reset all posts mutation will be executed, and all user profiles should refresh.</li>
        <li>When you <a href="javascript:void(0)" onClick={this.flipBadge.bind(this)}>click this link</a>, it toggles badge names so not only <code>BadgeSegment</code> should change, but also <code>UserSegment</code>.</li>
      </ul>
      <h3>Username: {USERNAME_A}</h3>
      <UserProfile context={this.props.context} username={USERNAME_A}></UserProfile>
      <h3>Username: {USERNAME_B}</h3>
      <UserProfile context={this.props.context} username={USERNAME_B}></UserProfile>
      <h3>Username: {USERNAME_C}</h3>
      <UserProfile context={this.props.context} username={USERNAME_C}></UserProfile>
      <h3>Badge Names</h3>
      <BadgeList context={this.props.context} />
      <DebugPanel top right bottom>
        <DevTools store={this.props.context.store._store} monitor={LogMonitor} />
      </DebugPanel>
    </div>
  }

  incrementSingle(username) {
    var mutation = new IncrementUserPostMutation(username);
    this.props.context.store.execute(mutation);
  }

  resetAll(number) {
    var mutation = new ResetUserPostMutation(number);
    this.props.context.store.execute(mutation);
  }

  flipBadge() {
    var mutation = new FlipBadgeMutation();
    this.props.context.store.execute(mutation);
  }
}

class MutationTest extends Page {
  static get pageName() {
    return 'MutationTest';
  }

  createStore(initialState) {
    var reduxStore = new ReduxStore(Promise, initialState, this.config, this.cookieJar);
    return reduxStore;
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Mutation Test</title>';
    reactRenderer.body = React.createElement(Component, {
      context: this.createContext(store)
    });
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(MutationTest);
export default MutationTest;