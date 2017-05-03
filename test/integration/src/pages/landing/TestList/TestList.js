import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import register from 'soya/lib/client/Register';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer.js';

import style from 'shared/sitewide.css';

class Component extends React.Component {
  render() {
    return <div>
      <h1>Integration Tests</h1>
      <p>Significant effort should be made to make these integration tests automate-able.</p>
      <h2>Compilation</h2>
      <p>Web assets compilation and page generation. Enables user to code in terms of distinct components, without worrying about dependencies and performance optimizations.</p>
      <ul>
        <li><a href={this.props.context.router.reverseRoute('LOAD_COMPONENT')}>Load Component</a></li>
        <li>(TODO) <a href="">Client File Switching</a>.</li>
      </ul>
      <h2>HTTP</h2>
      <p>Support for HTTP features like cookies, headers, upload, request methods, etc.</p>
      <ul>
        <li><a href={this.props.context.router.reverseRoute('COOKIE_SET')}>Cookies</a></li>
      </ul>
      <h2>Redux</h2>
      <p>Integration with Redux alongside data-fetching capabilities. Enables the <code>&lt;Context/&gt;</code> part of user interface components.</p>
      <ul>
        <li><a href={this.props.context.router.reverseRoute('HYDRATION')}>Hydration Test</a> (~3 seconds)</li>
        <li><a href={this.props.context.router.reverseRoute('RUNTIME_COMPONENT')}>Runtime Components</a></li>
        <li><a href={this.props.context.router.reverseRoute('RECURSIVE_HANDLE_CHANGE')}>Recursive change handler</a></li>
        <li><a href={this.props.context.router.reverseRoute('SERVER_SEGMENT_DEPENDENCIES')}>Segment Dependencies (Server-Side)</a> (~5 seconds).</li>
        <li><a href={this.props.context.router.reverseRoute('CLIENT_SEGMENT_DEPENDENCIES')}>Segment Dependencies (Client-Side)</a>.</li>
        <li><a href={this.props.context.router.reverseRoute('CLIENT_INSTANT_SEGMENT_DEPENDENCIES')}>Segment Dependencies (Client-Side, Instant Load)</a></li>
        <li><a href={this.props.context.router.reverseRoute('SEGMENT_COOKIE')}>Segment Cookie</a></li>
        <li><a href={this.props.context.router.reverseRoute('SEGMENT_COOKIE_CLIENT')}>Segment Cookie (Client Side)</a></li>
        <li><a href={this.props.context.router.reverseRoute('TEST_LOCAL_SEGMENT')}>Local Segment</a></li>
        <li><a href={this.props.context.router.reverseRoute('MUTATION_TEST')}>Mutation Test</a></li>
      </ul>
      <h3>Form With Redux</h3>
      <ul>
        <li><a href={this.props.context.router.reverseRoute('SIMPLE_FORM')}>Simple Form</a></li>
        <li><a href={this.props.context.router.reverseRoute('REPEATABLE_FORM')}>Repeatable Form</a></li>
      </ul>
      <h2>Internationalization</h2>
      <ul>
        <li><a href={this.props.context.router.reverseRoute('TODO_APP')}>Todo App</a></li>
      </ul>
    </div>;
  }
}

class TestList extends Page {
  static get pageName() {
    return 'TestList';
  }

  static getRouteRequirements() {
    return [
      'HYDRATION',
      'RUNTIME_COMPONENT',
      'SERVER_SEGMENT_DEPENDENCIES',
      'CLIENT_SEGMENT_DEPENDENCIES',
      'CLIENT_INSTANT_SEGMENT_DEPENDENCIES',
      'SEGMENT_COOKIE',
      'SEGMENT_COOKIE_CLIENT',
      'LOAD_COMPONENT',
      'TEST_LOCAL_SEGMENT',
      'SIMPLE_FORM',
      'REPEATABLE_FORM',
      'COOKIE_SET',
      'MUTATION_TEST',
      'RECURSIVE_HANDLE_CHANGE',
      'TODO_APP',
    ];
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Integration Tests</title>';
    reactRenderer.body = React.createElement(Component, {
      context: this.createContext(store),
      search: httpRequest.getQuery(),
      qp: httpRequest.getQueryParams()
    });
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(TestList);
export default TestList;
