import React from 'react';
import ReduxPage from 'soya/lib/page/ReduxPage';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer';
import register from 'soya/lib/client/Register';
import UserProfile from '../../../components/contextual/UserProfile/UserProfile.js';

import style from '../../../shared/sitewide.css';

class Component extends React.Component {
  componentWillMount() {
    this.setState({
      serverUsername: 'rickchristie',
      clientUsername: 'captainjack'
    });
  }

  render() {
    return <div>
      <h1>Hydration</h1>
      <h3>Server-Side Hydration</h3>
      <ul>
        <li>HTML sent by server must already include user profile data.</li>
        <li>Server rendering is blocked for 5 seconds while fetching user data.</li>
        <li>Initial state from server gets passed to Soya client runtime.</li>
        <li>React client side rendering works without inconsistencies in generated markup.</li>
        <li>UI handlers assigned appropriately. <a href="javascript:void(0)" onClick={this.handleClick}>This link handler</a> must still work.</li>
        <li>Client side re-rendering is triggered when profile tab link is clicked.</li>
        <li>User profile query result should be reused (no requests to switch to already requested profile).</li>
        <li>No re-rendering is done when the same profile badge is clicked.</li>
      </ul>
      <h3>Server Hydrated User Profile Badge:</h3>
      <p>Viewing: <a href="javascript:void(0)" onClick={this.loadAnotherUser.bind(this, 'rickchristie')}>rickchristie</a> | <a href="javascript:void(0)" onClick={this.loadAnotherUser.bind(this, 'meesa')}>meesa</a></p>
      <UserProfile context={this.props.context} username={this.state.serverUsername}></UserProfile>
      <h1>Client-Side Hydration</h1>
      <h3>Specs</h3>
      <ul>
        <li>HTML sent by server doesn't include this user's profile data.</li>
        <li>This user's data is loaded asynchronously with AJAX.</li>
        <li>Upon waiting for the data to load, a loading state is returned by the component.</li>
      </ul>
      <h3>Client Hydrated User Profile Badge:</h3>
      <UserProfile context={this.props.context} username={this.state.clientUsername} loadAtClient={true}></UserProfile>
      <h1>Multiple Server-Side Hydration</h1>
      <h3>Specs</h3>
      <ul>
        <li>All user profile badge below must already be included in user profile data.</li>
      </ul>
      <h3>Profile 1</h3>
      <UserProfile context={this.props.context} username={'jedikiller'}></UserProfile>
      <h3>Profile 2</h3>
      <UserProfile context={this.props.context} username={'willywonka'}></UserProfile>
    </div>
  }

  loadAnotherUser(username) {
    this.setState({
      serverUsername: username
    });
  }

  handleClick() {
    alert('It works!');
  }
}

class Hydration extends ReduxPage {
  static get pageName() {
    return 'Hydration';
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Hydration Test</title>';
    reactRenderer.body = React.createElement(Component, {
      context: this.createContext(store)
    });
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(Hydration);
export default Hydration;