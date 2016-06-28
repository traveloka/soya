import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer.js'
import ReduxStore from 'soya/lib/data/redux/ReduxStore.js';
import register from 'soya/lib/client/Register';
import UserProfile from '../../../components/contextual/UserProfile/UserProfile.js';
import UserSegment from '../../../segments/UserSegment.js';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';

// TODO: Figure out how to do promise polyfill.
import style from '../../../shared/sitewide.css';

class Component extends React.Component {
  componentWillMount() {
    this.props.context.reduxStore.registerDataComponent(UserProfile);
    this.props.context.reduxStore.register(UserSegment);
    this.setState({
      index: 0,
      components: []
    });
  }

  render() {
    return <div>
      <h1>Runtime Data Components</h1>
      <h3>Specs</h3>
      <ul>
        <li>Each time <a href="javascript:void(0)" onClick={this.addProfile.bind(this)}>this link</a> is clicked, a new <code>DataComponent</code> should appear.</li>
        <li>Queries of the created <code>DataComponent</code> should run automatically.</li>
        <li>There are {this.props.queries.length} distinct query(s) available. Queries will loop back to the first one.</li>
        <li>Data should not be fetched more than once for each query.</li>
        <li>You can <a href="javascript:void(0)" onClick={this.clearProfiles.bind(this)}>clear spawned components</a> for clarity.</li>
        <li>You can <a href="javascript:void(0)" onClick={this.addProfile.bind(this, true)}>add a component and force re-load</a> the query.</li>
      </ul>
      {this.state.components}
      <DebugPanel top right bottom>
        <DevTools store={this.props.context.reduxStore._store} monitor={LogMonitor} />
      </DebugPanel>
    </div>;
  }

  clearProfiles() {
    this.setState({
      index: 0,
      components: []
    });
  }

  addProfile(event, id, realEvent, forceLoad) {
    if (this.props.queries.length == 0) {
      alert('No queries defined in test case!');
      return;
    }

    var nextIndex = this.state.index + 1;
    if (nextIndex >= this.props.queries.length) {
      nextIndex = 0;
    }
    var query = this.props.queries[this.state.index];
    var components = this.state.components;
    components.push(<h3>Profile {this.state.index}</h3>);
    components.push(<UserProfile context={this.props.context} username={query} />);
    this.setState({
      index: nextIndex,
      components: components
    });

    if (forceLoad) {
      this.props.context.reduxStore.query(UserSegment.id(), {username: query}, true);
    }
  }
}

class RuntimeComponent extends Page {
  static get pageName() {
    return 'RuntimeComponent';
  }

  createStore(initialState) {
    var reduxStore = new ReduxStore(Promise, initialState, this.config, this.cookieJar);
    return reduxStore;
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Runtime Data Component</title>';
    reactRenderer.body = React.createElement(Component, {
      context: {
        reduxStore: store,
        config: this.config
      },
      queries: [
        'rickchristie',
        'willywonka',
        'captainjack',
        'jedikiller',
        'meesa'
      ]
    });
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(RuntimeComponent, __filename);
export default RuntimeComponent;