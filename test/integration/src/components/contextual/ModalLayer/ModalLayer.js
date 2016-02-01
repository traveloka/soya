import React from 'react';
import ReactDOM from 'react-dom';
import DataComponent from 'soya/lib/data/redux/DataComponent';
import { isEqualShallow, isReactChildrenEqual } from 'soya/lib/data/redux/helper';

import ModalSegment from '../../../segments/ModalSegment.js';
import style from './style.css';

/**
 * @CLIENT_SERVER
 */
export default class ModalLayer extends DataComponent {
  static getSegmentDependencies() {
    return [ModalSegment];
  }

  subscribeQueries(nextProps) {
    this.subscribe(ModalSegment.id(), '', 'modals');
  }

  clearModal(modalId) {
    var modalActions = this.getActionCreator(ModalSegment.id());
    var action = modalActions.remove(modalId);
    this.getReduxStore().dispatch(action);
  }

  shouldSubscriptionsUpdate(nextProps) {
    // For the props, we need to check children differently.
    return !isEqualShallow(nextProps, this.props, {children: isReactChildrenEqual});
  }

  shouldComponentUpdate(nextProps, nextState) {
    var shouldUpdate = !isEqualShallow(nextState, this.state);
    // For the props, we need to check children differently.
    return shouldUpdate || !isEqualShallow(nextProps, this.props, {children: isReactChildrenEqual});
  }

  render() {
    var modalWindowTypes = {}, modalWindows = [], modalElement, i;
    var childrenElements = React.Children.toArray(this.props.children);
    for (i = 0; i < childrenElements.length; i++) {
      modalElement = childrenElements[i];
      if (typeof modalElement.type.modalType != 'string') {
        throw new Error('Modal window error found without modalType static property: ' +
          modalElement.type.name);
      }
      modalWindowTypes[modalElement.type.modalType] = modalElement;
    }

    var modal, type, id, data;
    for (i = 0; i < this.state.modals.length; i++) {
      modal = this.state.modals[i];
      type = modal.modalType;
      id = modal.modalId;
      data = modal.data;
      modalElement = modalWindowTypes[type];
      if (modalElement == null) {
        throw new Error('Modal window type is unknown: \'' + type + '\'.');
      }
      modalWindows.push(<div key={id + "overlay"} className={style.modalOverlayTransparent}></div>);
      modalWindows.push(React.cloneElement(modalElement, {
        id: id,
        key: id,
        data: data,
        level: i,
        removeSelf: this.clearModal.bind(this, id)
      }));
    }

    if (modalWindows.length <= 0) {
      return null;
    }

    return <div>
      <div className={style.modalOverlayBlack}></div>
      <div className="modalLayer">{modalWindows}</div>
    </div>;
  }
}