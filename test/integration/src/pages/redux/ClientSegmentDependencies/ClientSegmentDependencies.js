import React from 'react';
import ReduxPage from 'soya/lib/page/ReduxPage';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer';
import register from 'soya/lib/client/Register';
import RandomTimeEchoString from '../../../components/contextual/RandomTimeEchoString/RandomTimeEchoString.js';
import FibonacciSequence from '../../../components/contextual/FibonacciSequence/FibonacciSequence.js';
import FibonacciTotal from '../../../components/contextual/FibonacciTotal/FibonacciTotal.js';

import style from '../../../shared/sitewide.css';

class Component extends React.Component {
  componentWillMount() {
    this.setState({
      serialStr: 'Fetch Serial',
      parallelStr: 'Fetch Parallel',
      serialClientComponent: null,
      parallelClientComponent: null,
      serialSerialComponent: null,
      serialParallelComponent: null,
      parallelParallelComponent: null,
      parallelSerialComponent: null,
      fibonacciComponent: null,
      fibonacciTotalComponent: null
    });
  }

  render() {
    return <div>
      <h1>Client Segment Dependencies</h1>
      <h3>Serial Dependency</h3>
      <ul>
        <li><a href="javascript:void(0)" onClick={this.addSerialDependencyComponent.bind(this)}>Click this link</a> to send the string '{this.state.serialStr}' to random time echo API, serially.</li>
        <li>The result printed below should be exact string '{this.state.serialStr}', and network requests should be serial.</li>
      </ul>
      {this.state.serialClientComponent}
      <h3>Parallel Dependency</h3>
      <ul>
        <li><a href="javascript:void(0)" onClick={this.addParallelDependencyComponent.bind(this)}>Click this link</a> to send the string '{this.state.parallelStr}' to random time echo API, in parallel.</li>
        <li>The result printed below should be an anagram of '{this.state.parallelStr}' (because of random time response), and network requests should be parallel.</li>
      </ul>
      {this.state.parallelClientComponent}
      <h3>Recursive <code>QueryDependencies</code></h3>
      <ul>
        <li>This tests recursive characteristics of <code>QueryDependencies</code> class.</li>
        <li>Test are organized as <code>[Parent]-[Child]</code>. Letter 's' will be replaced with 'soya' with recursive <code>QueryDependencies</code>.</li>
        <li>If Child is Serial, the string 'soya' should be ordered correctly, otherwise it should be an anagram.</li>
      </ul>
      <h4><a href="javascript:void(0)" onClick={this.addSerialSerialComponent.bind(this)}>Load Serial-Serial</a></h4>
      {this.state.serialSerialComponent}
      <h4><a href="javascript:void(0)" onClick={this.addSerialParallelComponent.bind(this)}>Load Serial-Parallel</a></h4>
      {this.state.serialParallelComponent}
      <h4><a href="javascript:void(0)" onClick={this.addParallelSerialComponent.bind(this)}>Load Parallel-Serial</a></h4>
      {this.state.parallelSerialComponent}
      <h4><a href="javascript:void(0)" onClick={this.addParallelParallelComponent.bind(this)}>Load Parallel-Parallel</a></h4>
      {this.state.parallelParallelComponent}
      <h3>Serial Function Dependencies</h3>
      <ul>
        <li>We have an addition API, and we're going to <a href="javascript:void(0)" onClick={this.addFibonacciComponent.bind(this)}>create a Fibonacci sequence</a> using it.</li>
        <li>Since it's Fibonacci, the next number in the sequence can only be calculated if we know the previous two numbers.</li>
        <li>We expect the Fibonacci sequence is correct, and the AJAX requests are serial.</li>
      </ul>
      {this.state.fibonacciComponent}
      <h3>Recursive Segment Dependencies</h3>
      <ul>
        <li><code>FibonacciTotalSegment -> FibonacciSegment -> AdditionSegment</code></li>
        <li>Returned value should be sum of all numbers in a Fibonacci sequence. Click <a href="javascript:void(0)" onClick={this.addFibonacciTotalComponent.bind(this)}>here to load</a>.</li>
      </ul>
      {this.state.fibonacciTotalComponent}
    </div>;
  }

  addFibonacciComponent() {
    var component = <FibonacciSequence context={this.props.context} number={10} />;
    this.setState({
      fibonacciComponent: component
    });
  }

  addFibonacciTotalComponent() {
    var component = <FibonacciTotal context={this.props.context} number={10} />;
    this.setState({
      fibonacciTotalComponent: component
    });
  }

  addSerialSerialComponent() {
    var component = <RandomTimeEchoString context={this.props.context}
                                          value={'Olsen'} shouldReplace={true} />;
    this.setState({
      serialSerialComponent: component
    });
  }

  addSerialParallelComponent() {
    var component = <RandomTimeEchoString context={this.props.context}
                                          value={'Olsen'} shouldReplace={true}
                                          isReplaceParallel={true} />;
    this.setState({
      serialParallelComponent: component
    });
  }

  addParallelParallelComponent() {
    var component = <RandomTimeEchoString context={this.props.context}
                                          value={'Olsen'} shouldReplace={true}
                                          isParallel={true}
                                          isReplaceParallel={true} />;
    this.setState({
      parallelParallelComponent: component
    });
  }

  addParallelSerialComponent() {
    var component = <RandomTimeEchoString context={this.props.context}
                                          value={'Olsen'} shouldReplace={true}
                                          isParallel={true} />;
    this.setState({
      parallelSerialComponent: component
    });
  }

  addSerialDependencyComponent() {
    var component = <RandomTimeEchoString context={this.props.context}
                                          loadAtClient={true}
                                          value={this.state.serialStr} />;
    this.setState({
      serialClientComponent: component
    });
  }

  addParallelDependencyComponent() {
    var component = <RandomTimeEchoString context={this.props.context}
                                          loadAtClient={true}
                                          value={this.state.parallelStr}
                                          isParallel={true} />;
    this.setState({
      parallelClientComponent: component
    });
  }
}

class ClientSegmentDependencies extends ReduxPage {
  static get pageName() {
    return 'ClientSegmentDependencies';
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Segment Dependencies Test</title>';
    reactRenderer.body = React.createElement(Component, {
      context: this.createContext(store)
    });
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(ClientSegmentDependencies);
export default ClientSegmentDependencies;