import LocalSegment from 'soya/lib/data/redux/segment/local/LocalSegment';
import ActionNameUtil from 'soya/lib/data/redux/segment/ActionNameUtil';
import update from 'react-addons-update';

import { ModalSegmentId } from './ids.js';

const addActionType = ActionNameUtil.generate(ModalSegmentId, 'ADD');
const setDataActionType = ActionNameUtil.generate(ModalSegmentId, 'SET_DATA');
const removeActionType = ActionNameUtil.generate(ModalSegmentId, 'REMOVE');
const removeAllActionType = ActionNameUtil.generate(ModalSegmentId, 'REMOVE_ALL');

const ACTION_CREATOR = {
  add(modalType, modalId, data) {
    return {
      type: self._addActionType,
      modalType: modalType,
      modalId: modalId,
      data: data
    }
  },
  update(modalId, commands) {
    return {
      type: self._setDataActionType,
      modalId: modalId,
      commands: commands
    }
  },
  remove(modalId) {
    return {
      type: self._removeActionType,
      modalId: modalId
    };
  },
  removeAll() {
    return {
      type: self._removeAllActionType
    };
  }
};

/**
 * @CLIENT_SERVER
 */
export default class ModalSegment extends LocalSegment {
  _addActionType;
  _setDataActionType;
  _removeActionType;
  _removeAllActionType;
  _actionCreator;

  static id() {
    return ModalSegmentId;
  }

  static createInitialData() {
    return [];
  }

  constructor(config, cookieJar, PromiseImpl) {
    super(config, cookieJar, PromiseImpl);
    var id = ModalSegment.id();

    var self = this;
    this._actionCreator =
  }

  _getActionCreator() {
    return this._actionCreator;
  }

  static getReducer() {
    var self = this;
    return function(state, action) {
      if (state == null) state = ModalSegment.createInitialData();
      switch (action.type) {
        case self._addActionType:
          return self._addModal(state, action);
          break;
        case self._setDataActionType:
          return self._setModalData(state, action);
          break;
        case self._removeActionType:
          return self._removeModal(state, action);
          break;
        case self._removeAllActionType:
          return [];
          break;
      }
      return state;
    };
  }

  _addModal(state, action) {
    state = this._removeModal(state, action);
    return update(state, { $push: [{
      modalId: action.modalId,
      modalType: action.modalType,
      data: action.data
    }]});
  }

  _setModalData(state, action) {
    var index = this._find(state, action.modalId);
    if (index <= -1) {
      return state;
    }
    return update(state, { [index]: { data: { $set:
      action.data
    }}});
  }

  _removeModal(state, action) {
    var index = this._find(state, action.modalId);
    if (index > -1) {
      state = update(state, { $splice: [[index, 1]] });
    }
    return state;
  }

  /**
   * @param {Object} state
   * @param {string} modalId
   * @returns {number}
   */
  _find(state, modalId) {
    // Assuming that in a normal application, your modal window count won't
    // be more than 10, we need no indexes.
    var i, modal;
    for (i = 0; i < state.length; i++) {
      modal = state[i];
      if (modal.modalId == modalId) {
        return i;
      }
    }
    return -1;
  }
}