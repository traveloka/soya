import React from 'react';
import ReduxPage from 'soya/lib/page/ReduxPage';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer';
import register from 'soya/lib/client/Register';
import UserProfile from '../../../components/contextual/UserProfile/UserProfile.js';
import UserSegment from '../../../segments/UserSegment.js';

import style from '../../../shared/sitewide.css';

class Component extends React.Component {
  componentWillMount() {
    this.autoIncrementKey = 0;
    this.props.context.store.register(UserSegment);
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
    components.push(<h3 key={'h' + this.autoIncrementKey++}>Profile {this.state.index}</h3>);
    components.push(<UserProfile key={'up' + this.autoIncrementKey++} context={this.props.context} username={query} />);
    this.setState({
      index: nextIndex,
      components: components
    });

    if (forceLoad) {
      this.props.context.store.query(UserSegment.id(), {username: query}, true);
    }
  }
}

class RuntimeComponent extends ReduxPage {
  static get pageName() {
    return 'RuntimeComponent';
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Runtime Data Component</title>';
    reactRenderer.body = React.createElement(Component, {
      context: this.createContext(store),
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

register(RuntimeComponent);
export default RuntimeComponent;