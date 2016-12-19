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
      type: addActionType,
      modalType: modalType,
      modalId: modalId,
      data: data
    }
  },
  update(modalId, commands) {
    return {
      type: setDataActionType,
      modalId: modalId,
      commands: commands
    }
  },
  remove(modalId) {
    return {
      type: removeActionType,
      modalId: modalId
    };
  },
  removeAll() {
    return {
      type: removeAllActionType
    };
  }
};

const REDUCER = function(state, action) {
  if (state == null) state = [];
  switch (action.type) {
    case addActionType:
      return ModalSegment._addModal(state, action);
      break;
    case setDataActionType:
      return ModalSegment._setModalData(state, action);
      break;
    case removeActionType:
      return ModalSegment._removeModal(state, action);
      break;
    case removeAllActionType:
      return [];
      break;
  }
  return state;
};

/**
 * @CLIENT_SERVER
 */
export default class ModalSegment extends LocalSegment {
  static id() {
    return ModalSegmentId;
  }

  static getActionCreator() {
    return ACTION_CREATOR;
  }

  static getReducer() {
    return REDUCER;
  }

  static _addModal(state, action) {
    state = ModalSegment._removeModal(state, action);
    return update(state, { $push: [{
      modalId: action.modalId,
      modalType: action.modalType,
      data: action.data
    }]});
  }

  static _setModalData(state, action) {
    var index = ModalSegment._find(state, action.modalId);
    if (index <= -1) {
      return state;
    }
    return update(state, { [index]: { data: { $set:
      action.data
    }}});
  }

  static _removeModal(state, action) {
    var index = ModalSegment._find(state, action.modalId);
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
  static _find(state, modalId) {
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