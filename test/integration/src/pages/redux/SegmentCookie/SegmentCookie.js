import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer.js';
import register from 'soya/lib/client/Register';
import ReduxStore from 'soya/lib/data/redux/ReduxStore.js';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';

// TODO: Figure out how to do promise polyfill.
import style from '../../../shared/sitewide.css';
import BookingBox from '../../../components/contextual/BookingBox/BookingBox.js';

class Component extends React.Component {
  componentWillMount() {
    this.setState({
      clientBookingBox: null,
      clientErrorBookingBox: null
    });
  }

  render() {
    return <div>
      <h1>Segment Cookie</h1>
      <ul>
        <li>Lifetime and session context should be fetched and response should include <code>Set-Cookie</code> header.</li>
        <li>If lifetime and session cookie is already present at request header, response should not have <code>Set-Cookie</code> header.</li>
        <li>Subsequent render of new booking box should not trigger new fetching of context (should reuse cookies/state).</li>
        <li><a href="javascript:void(0)" onClick={this.addBookingBox.bind(this)}>Click here</a> to fetch new booking box.</li>
        <li><a href="javascript:void(0)" onClick={this.addErrorBookingBox.bind(this)}>Click here</a> to fetch an error booking box.</li>
      </ul>
      <BookingBox context={this.props.context} bookingId={29000} />
      {this.state.clientBookingBox}
      {this.state.clientErrorBookingBox}
      <DebugPanel top right bottom>
        <DevTools store={this.props.context.store._store} monitor={LogMonitor} />
      </DebugPanel>
    </div>
  }

  addBookingBox() {
    var component = <BookingBox context={this.props.context} bookingId={29001} />;
    this.setState({
      clientBookingBox: component
    });
  }

  addErrorBookingBox() {
    var component = <BookingBox context={this.props.context} bookingId={28000} />;
    this.setState({
      clientErrorBookingBox: component
    });
  }
}

class SegmentCookie extends Page {
  static get pageName() {
    return 'SegmentCookie';
  }

  createStore(initialState) {
    var reduxStore = new ReduxStore(Promise, initialState, this.config, this.cookieJar);
    return reduxStore;
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Segment With Cookie Test</title>';
    reactRenderer.body = React.createElement(Component, {
      context: this.createContext(store)
    });
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(SegmentCookie);
export default SegmentCookie;