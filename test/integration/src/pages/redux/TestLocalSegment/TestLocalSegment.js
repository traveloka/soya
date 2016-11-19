import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer';
import register from 'soya/lib/client/Register';
import ReduxStore from 'soya/lib/data/redux/ReduxStore';
import smokesignals from 'soya/lib/event/smokesignals';

import LyingSegment from '../../../segments/LyingSegment.js';
import ModalSegment from '../../../segments/ModalSegment.js';
import ModalLayer from '../../../components/contextual/ModalLayer/ModalLayer.js';
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal.js';

// TODO: Figure out how to do promise polyfill.
import style from '../../../shared/sitewide.css';

var INCREMENT_MODAL_ID = 'handsome';
var MULTIPLE_MODAL_ID = 'multiple';
var MODAL_LAUNCHING_MODAL_ID = 'launch';

class Component extends React.Component {
  componentWillMount() {
    this.lyingActions = this.props.context.store.register(LyingSegment);
    this.modalEmitter = {};
    smokesignals.convert(this.modalEmitter);

    this.setState({
      number: 0
    });

    // Subscribe to lying segment.
    this.props.context.store.subscribe(LyingSegment.id(), '', (newState) => {
      this.setState({
        number: newState
      });
    }, this);

    this.modalActions = this.props.context.store.register(ModalSegment);
    this.modalEmitter.on(ConfirmModal.getConfirmEvent(INCREMENT_MODAL_ID), () => {
      this.props.context.store.dispatch(this.lyingActions.increment());
    });
    this.modalEmitter.on(ConfirmModal.getConfirmEvent(MODAL_LAUNCHING_MODAL_ID), this.addConfirmModal.bind(this));
    var i, createRemovalFunc = (n) => {
      return () => {
        var removeAction = this.modalActions.remove(MULTIPLE_MODAL_ID + n);
        this.props.context.store.dispatch(removeAction);
      };
    };
    for (i = 1; i < 6; i++) {
      this.modalEmitter.on(ConfirmModal.getConfirmEvent(MULTIPLE_MODAL_ID + i), createRemovalFunc(i));
    }
  }

  render() {
    return <div>
      <h1>Local Segment</h1>
      <h3>Modal Window</h3>
      <h3>Number of times you lied: {this.state.number}</h3>
      <ul>
        <li>Default value for modal window segment.</li>
        <li><code>ModalLayer</code> component listens to the local segment and re-renders appropriately.</li>
        <li><a href={'javascript:void(0)'} onClick={this.addConfirmModal.bind(this)}>Click this</a> to add a confirmation modal window to the redux state.</li>
        <li><a href={'javascript:void(0)'} onClick={this.addMultipleConfirmModal.bind(this)}>Click this</a> to add multiple confirmation modal window.</li>
        <li><a href={'javascript:void(0)'} onClick={this.addModalLaunchingModal.bind(this)}>Click this</a> to add modal window that launches another modal window.</li>
      </ul>
      <ModalLayer context={this.props.context}>
        <ConfirmModal emitter={this.modalEmitter} />
      </ModalLayer>
    </div>
  }

  addConfirmModal() {
    var addModalAction = this.modalActions.add(ConfirmModal.modalType, INCREMENT_MODAL_ID, {
      text: 'Are you handsome?'
    });
    this.props.context.store.dispatch(addModalAction);
  }

  addMultipleConfirmModal() {
    var i, addModalAction;
    for (i = 1; i < 6; i++) {
      addModalAction = this.modalActions.add(ConfirmModal.modalType, MULTIPLE_MODAL_ID + i, {
        text: 'Test multiple modal window ' + i + '.'
      });
      this.props.context.store.dispatch(addModalAction);
    }
  }

  addModalLaunchingModal() {
    var addModalAction = this.modalActions.add(ConfirmModal.modalType, MODAL_LAUNCHING_MODAL_ID, {
      text: 'Launch new modal window?'
    });
    this.props.context.store.dispatch(addModalAction);
  }
}

class TestLocalSegment extends Page {
  static get pageName() {
    return 'TestLocalSegment';
  }

  createStore(initialState) {
    var reduxStore = new ReduxStore(Promise, initialState, this.config, this.cookieJar);
    return reduxStore;
  }

  render(httpRequest, routeArgs, store, callback) {
    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Local Segment Test</title>';
    reactRenderer.body = React.createElement(Component, {
      context: this.createContext(store)
    });
    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(TestLocalSegment);
export default TestLocalSegment;