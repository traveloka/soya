import React from 'react';

import connect from 'soya/lib/data/redux/connect';
import { isEqualShallow, isReactChildrenEqual } from 'soya/lib/data/redux/helper';

import ModalSegment from '../../../segments/ModalSegment.js';
import style from './style.mod.css';

/**
 * @CLIENT_SERVER
 */
class ModalLayer extends React.Component {
  static connectId() {
    return 'ModalLayer';
  }

  static getSegmentDependencies() {
    return [ModalSegment];
  }

  static subscribeQueries(nextProps, subscribe) {
    subscribe(ModalSegment.id(), '', 'modals');
  }

  static shouldWrapperComponentUpdate(prevProps, nextProps, prevState, nextState) {
    var shouldUpdate = !isEqualShallow(nextState, prevState);
    // For the props, we need to check children differently.
    return shouldUpdate || !isEqualShallow(nextProps, prevProps, {children: isReactChildrenEqual});
  }

  static shouldSubscriptionsUpdate(prevProps, nextProps) {
    // For the props, we need to check children differently.
    return !isEqualShallow(nextProps, prevProps, {children: isReactChildrenEqual});
  }

  clearModal(modalId) {
    var modalActions = this.props.getActionCreator(ModalSegment.id());
    var action = modalActions.remove(modalId);
    this.props.getReduxStore().dispatch(action);
  }

  render() {
    if (this.props.result.modals == null) {
      return null;
    }
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
    for (i = 0; i < this.props.result.modals.length; i++) {
      modal = this.props.result.modals[i];
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

export default connect(ModalLayer);