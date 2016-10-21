import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer.js';
import register from 'soya/lib/client/Register';
import ReduxStore from 'soya/lib/data/redux/ReduxStore.js';
import RandomTimeEchoString from '../../../components/contextual/RandomTimeEchoString/RandomTimeEchoString.js';
import FibonacciSequence from '../../../components/contextual/FibonacciSequence/FibonacciSequence.js';
import FibonacciTotal from '../../../components/contextual/FibonacciTotal/FibonacciTotal.js';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';

// TODO: Figure out how to do promise polyfill.
import style from '../../../shared/sitewide.css';

class Component extends React.Component {
  render() {
    return <div>
      <h1>Client Instant Segment Dependencies</h1>
      <h3>Serial Dependency</h3>
      <ul>
        <li>HTML response should already contain the text 'Quick Fox' fetched serially below.</li>
        <li>Redux store state should already contain letters for 'Quick Fox'.</li>
      </ul>
      <RandomTimeEchoString context={this.props.context} loadAtClient={true} value={'Quick Fox'} />
      <h3>Parallel Dependency</h3>
      <ul>
        <li>HTML response should already contain an anagram of text 'Jumps Over', fetched parallely below.</li>
        <li>Redux store state should already contain letters for 'Jumps Over'.</li>
      </ul>
      <RandomTimeEchoString context={this.props.context} loadAtClient={true} value={'Jumps Over'} isParallel={true} />
      <h3>Recursive <code>QueryDependencies</code></h3>
      <ul>
        <li>This tests recursive characteristics of <code>QueryDependencies</code> class.</li>
        <li>Test are organized as <code>[Parent]-[Child]</code>. Letter 's' will be replaced with 'soya' with recursive <code>QueryDependencies</code>.</li>
        <li>If Child is Serial, the string 'soya' should be ordered correctly, otherwise it should be an anagram.</li>
      </ul>
      <h4>Serial-Serial</h4>
      <RandomTimeEchoString context={this.props.context} loadAtClient={true} value={'Olsen'} shouldReplace={true} />
      <h4>Serial-Parallel</h4>
      <RandomTimeEchoString context={this.props.context} loadAtClient={true} value={'Olsen'} shouldReplace={true} isReplaceParallel={true} />
      <h4>Parallel-Serial</h4>
      <RandomTimeEchoString context={this.props.context} loadAtClient={true} value={'Olsen'} shouldReplace={true} isParallel={true} />
      <h4>Parallel-Parallel</h4>
      <RandomTimeEchoString context={this.props.context} loadAtClient={true} value={'Olsen'} shouldReplace={true} isParallel={true} isReplaceParallel={true} />
      <h3>Serial Function Dependencies</h3>
      <ul>
        <li>We have an addition API, and we're going to create a Fibonacci sequence using it.</li>
        <li>Since it's Fibonacci, the next number in the sequence can only be calculated if we know the previous two numbers.</li>
        <li>We expect the Fibonacci sequence is correct, and it must be present in the HTML.</li>
      </ul>
      <FibonacciSequence context={this.props.context} loadAtClient={true} number={10} />
      <h3>Recursive Segment Dependencies</h3>
      <FibonacciTotal context={this.props.context} loadAtClient={true} number={10} />
      <DebugPanel top right bottom>
        <DevTools store={this.props.context.store._store} monitor={LogMonitor} />
      </DebugPanel>
    </div>;
  }
}

class ClientInstantSegmentDependencies extends Page {
  static get pageName() {
    return 'ClientInstantSegmentDependencies';
  }

  createStore(initialState) {
    var reduxStore = new ReduxStore(Promise, initialState, this.config, this.cookieJar);
    return reduxStore;
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

register(ClientInstantSegmentDependencies);
export default ClientInstantSegmentDependencies;