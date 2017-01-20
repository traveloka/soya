import LocalSegment from '../segment/local/LocalSegment';
import ActionNameUtil from '../segment/ActionNameUtil';
import { isStringDuckType, isArray } from '../helper';
import QueryResult from '../QueryResult.js';

import update from 'react-addons-update';

const DEFAULT_FIELD = {
  value: null,
  touched: false,
  errorMessages: [],
  isEnabled: true,
  isValidating: false
};

const ID = 'form';

const SET_DEFAULT_VALUE_ACTION_TYPE = ActionNameUtil.generate(ID, 'SET_DEFAULT_VALUE');
const SET_DEFAULT_VALUES_ACTION_TYPE = ActionNameUtil.generate(ID, 'SET_DEFAULT_VALUES');
const SET_VALUE_ACTION_TYPE = ActionNameUtil.generate(ID, 'SET_VALUE');
const SET_VALUES_ACTION_TYPE = ActionNameUtil.generate(ID, 'SET_VALUES');
const CLEAR_FIELD_ACTION_TYPE = ActionNameUtil.generate(ID, 'CLEAR_FIELD');
const MERGE_FIELDS_ACTION_TYPE = ActionNameUtil.generate(ID, 'MERGE_FIELDS');
const SET_IS_VALIDATION_ACTION_TYPE = ActionNameUtil.generate(ID, 'SET_IS_VALIDATING');
const SET_ERRORS_ACTION_TYPE = ActionNameUtil.generate(ID, 'SET_ERRORS');
const ADD_ERRORS_ACTION_TYPE = ActionNameUtil.generate(ID, 'ADD_ERRORS');
const SET_ENABLED_STATE_ACTION_TYPE = ActionNameUtil.generate(ID, 'SET_ENABLED_STATE');
const CLEAR_FORM_ACTION_TYPE = ActionNameUtil.generate(ID, 'CLEAR_FORM');
const CLEAR_ERRORS_ACTION_TYPE = ActionNameUtil.generate(ID, 'CLEAR_ERRORS');

const ADD_LIST_ITEM_ACTION_TYPE = ActionNameUtil.generate(ID, 'ADD_ITEM');
const ADD_LIST_ITEM_WITH_VALUE_ACTION_TYPE = ActionNameUtil.generate(ID,'ADD_ITEM_WITH_VALUE');
const REMOVE_LIST_ITEM_ACTION_TYPE = ActionNameUtil.generate(ID, 'REMOVE_ITEM');
const REORDER_LIST_ITEM_ACTION_TYPE = ActionNameUtil.generate(ID, 'REORDER_ITEM');
const REORDER_LIST_ITEM_INC_ACTION_TYPE = ActionNameUtil.generate(ID, 'REORDER_ITEM_INC');
const REORDER_LIST_ITEM_DEC_ACTION_TYPE = ActionNameUtil.generate(ID,'REORDER_ITEM_DEC');

const ACTION_CREATOR = {
  // Simple field related actions.
  setFormEnabledState(formId, isEnabled) {
    return {
      type: SET_ENABLED_STATE_ACTION_TYPE,
      formId: formId,
      isEnabled: isEnabled
    };
  },
  setIsValidating(formId, map) {
    return {
      type: SET_IS_VALIDATION_ACTION_TYPE,
      formId: formId,
      map: map
    };
  },
  mergeFields(formId, fields) {
    return {
      type: MERGE_FIELDS_ACTION_TYPE,
      formId: formId,
      fields: fields
    };
  },
  setValue(formId, fieldName, value) {
    return {
      type: SET_VALUE_ACTION_TYPE,
      formId: formId,
      fieldName: fieldName,
      value: value
    };
  },
  setValues(formId, values) {
    return {
      type: SET_VALUES_ACTION_TYPE,
      formId: formId,
      values: values
    };
  },
  setDefaultValue(formId, fieldName, value) {
    return {
      type: SET_DEFAULT_VALUE_ACTION_TYPE,
      formId: formId,
      fieldName: fieldName,
      value: value
    }
  },
  setDefaultValues(formId, values) {
    return {
      type: SET_DEFAULT_VALUES_ACTION_TYPE,
      formId: formId,
      values: values
    }
  },
  clearField(formId, fieldName) {
    return {
      type: CLEAR_FIELD_ACTION_TYPE,
      formId: formId,
      fieldName: fieldName
    };
  },
  setErrorMessages(formId, fieldName, errorMessages) {
    return {
      type: SET_ERRORS_ACTION_TYPE,
      formId: formId,
      fieldName: fieldName,
      errorMessages: errorMessages
    };
  },
  addErrorMessages(formId, messages) {
    return {
      type: ADD_ERRORS_ACTION_TYPE,
      formId: formId,
      messages: messages
    };
  },
  clearErrorMessages(formId, fieldNames) {
    return {
      type: CLEAR_ERRORS_ACTION_TYPE,
      formId: formId,
      fieldNames: fieldNames
    }
  },
  clear(formId) {
    return {
      type: CLEAR_FORM_ACTION_TYPE,
      formId: formId
    };
  },

  // Repeatable field related action.
  addListItem(formId, fieldName, minLength, maxLength) {
    return {
      type: ADD_LIST_ITEM_ACTION_TYPE,
      formId: formId,
      fieldName: fieldName,
      minLength: minLength,
      maxLength: maxLength
    };
  },
  // Repeatable field related action.
  addListItemWithValue(formId, fieldName, values) {
    return {
      type: ADD_LIST_ITEM_WITH_VALUE_ACTION_TYPE,
      formId: formId,
      fieldName: fieldName,
      values : values
    };
  },
  removeListItem(formId, fieldName, index) {
    return {
      type: REMOVE_LIST_ITEM_ACTION_TYPE,
      formId: formId,
      fieldName: fieldName,
      index: index
    };
  },
  reorderListItemInc(formId, fieldName, index, amount = 1) {
    return {
      type: REORDER_LIST_ITEM_INC_ACTION_TYPE,
      formId: formId,
      fieldName: fieldName,
      index: index,
      amount: amount
    };
  },
  reorderListItemDec(formId, fieldName, index, amount = 1) {
    return {
      type: REORDER_LIST_ITEM_DEC_ACTION_TYPE,
      formId: formId,
      fieldName: fieldName,
      index: index,
      amount: amount
    }
  },
  reorderListItem(formId, fieldName, index, targetIndex) {
    return {
      type: REORDER_LIST_ITEM_ACTION_TYPE,
      formId: formId,
      fieldName: fieldName,
      index: index,
      targetIndex: targetIndex
    };
  }
};

const REDUCER = function(state, action) {
  if (state == null) state = {};
  switch (action.type) {
    case SET_ENABLED_STATE_ACTION_TYPE:
      return FormSegment._setFormEnabledState(state, action);
      break;
    case SET_IS_VALIDATION_ACTION_TYPE:
      return FormSegment._setIsValidating(state, action);
      break;
    case SET_DEFAULT_VALUE_ACTION_TYPE:
      return FormSegment._setDefaultValue(state, action);
      break;
    case SET_DEFAULT_VALUES_ACTION_TYPE:
      return FormSegment._setDefaultValues(state, action);
      break;
    case SET_VALUE_ACTION_TYPE:
      return FormSegment._setValue(state, action);
      break;
    case SET_VALUES_ACTION_TYPE:
      return FormSegment._setValues(state, action);
      break;
    case CLEAR_FIELD_ACTION_TYPE:
      return FormSegment._clearField(state, action);
    case SET_ERRORS_ACTION_TYPE:
      return FormSegment._setErrorMessages(state, action);
      break;
    case ADD_ERRORS_ACTION_TYPE:
      return FormSegment._addErrorMessages(state, action);
      break;
    case MERGE_FIELDS_ACTION_TYPE:
      return FormSegment._mergeFields(state, action);
      break;
    case CLEAR_FORM_ACTION_TYPE:
      return FormSegment._clearForm(state, action);
      break;
    case CLEAR_ERRORS_ACTION_TYPE:
      return FormSegment._clearErrorMessages(state, action);
      break;
    case ADD_LIST_ITEM_ACTION_TYPE:
      return FormSegment._addListItem(state, action);
      break;
    case ADD_LIST_ITEM_WITH_VALUE_ACTION_TYPE:
      return FormSegment._addListItemWithValue(state, action);
      break;
    case REMOVE_LIST_ITEM_ACTION_TYPE:
      return FormSegment._removeListItem(state, action);
      break;
    case REORDER_LIST_ITEM_INC_ACTION_TYPE:
      return FormSegment._reorderListItemInc(state, action);
      break;
    case REORDER_LIST_ITEM_DEC_ACTION_TYPE:
      return FormSegment._reorderListItemDec(state, action);
      break;
    case REORDER_LIST_ITEM_ACTION_TYPE:
      return FormSegment._reorderListItem(state, action);
      break;
  }
  return state;
};

/**
 * Schema of the data structure:
 *
 * <pre>
 *   {
 *     formId: {
 *       fields: Object<string, T>,
 *       isEnabled: boolean
 *     },
 *     ...
 *   }
 * </pre>
 *
 * Where T is:
 *
 * <pre>
 *   Field | Object<string, T> | Array<T>
 * </pre>
 *
 * Field is:
 *
 * <pre>
 *   {
 *     touched: boolean,
 *     errorMessages: Array<string>,
 *     isValidating: boolean,
 *     value: ?
 *   }
 * </pre>
 *
 * IMPORTANT NOTE: This segment assumes that you do not name your fields
 * 'touched', 'errorMessages', 'isValidating', or 'value'.
 * TODO: Perform a check in createField for field name?
 *
 * @CLIENT_SERVER
 */
export default class FormSegment extends LocalSegment {
  static id() {
    return ID;
  }

  static getActionCreator() {
    return ACTION_CREATOR;
  }

  static getReducer() {
    return REDUCER;
  }

  static generateQueryId(query) {
    if (!query.hasOwnProperty('formId') || !query.hasOwnProperty('type')) {
      throw new Error('Query must contain formId and type properties.');
    }
    var queryId = query.formId + '-' + query.type;
    if (query.type[0] == 'f' && query.fieldName == null) {
      throw new Error('Field query should contain fieldName property.');
    }

    if (query.fieldName) {
      var stringifiedName = FormSegment._generateStringFieldName(query.fieldName);
      queryId += '-' + stringifiedName;
    }
    return queryId;
  }

  /**
   * Simple field queries:
   *
   * <pre>
   *   {formId: 'formId', type: 'isEnabled'} --> true if form is enabled, false otherwise.
   *   {formId: 'formId', type: '*'} --> get all values as map, but without the error messages.
   *   {formId: 'formId', type: '**'} --> get all values as map with error messages.
   *   {formId: 'formId', type: 'hasErrors'} --> returns true if has errors, false otherwise.
   *   {formId: 'formId', type: 'field', fieldName: 'fieldName'} --> get all properties of field.
   *   {formId: 'formId', type: 'fieldValue', fieldName: 'fieldName'} --> get only the field's value.
   * </pre>
   *
   * Repeatable specific queries:
   *
   * <pre>
   *   {formId: 'formId', type: 'length', fieldName: ['fieldName']}
   * </pre>
   */
  static queryState(query, queryId, segmentState) {
    switch (query.type) {
      case '*':
        if (segmentState == null) return QueryResult.loaded(null);
        return QueryResult.loaded(FormSegment._getAllValues(segmentState, query.formId));
        break;
      case '**':
        if (segmentState == null) return QueryResult.loaded({});
        return QueryResult.loaded(segmentState[query.formId] ? segmentState[query.formId] : {});
        break;
      case 'isEnabled':
        if (segmentState == null) return QueryResult.loaded(true);
        return QueryResult.loaded(segmentState[query.formId] ? segmentState[query.formId].isEnabled : true);
        break;
      case 'hasErrors':
        if (segmentState == null) return QueryResult.loaded(null);
        return QueryResult.loaded(FormSegment._hasErrors(segmentState, query.formId));
        break;
      case 'field':
        if (segmentState == null) return QueryResult.loaded(null);
        return QueryResult.loaded(FormSegment._getField(segmentState, query.formId, query.fieldName));
        break;
      case 'fieldValue':
        if (segmentState == null) return QueryResult.loaded(null);
        return QueryResult.loaded(FormSegment._getFieldValue(segmentState, query.formId, query.fieldName));
        break;
      case 'length':
        if (segmentState == null) return QueryResult.loaded(null);
        return QueryResult.loaded(FormSegment._getLength(segmentState, query.formId, query.fieldName, query.minLength));
        break;
      default:
        throw new Error('Unable to translate query: ' + queryId);
        break;
    }
  }

  /**
   * @param {Array<string|number>|string} fieldName
   */
  static _generateStringFieldName(fieldName) {
    // This should join all members if the field name is an array or leave it
    // untouched if it's a string.
    return fieldName.toString();
  }

  static _getAllValues(state, formId) {
    var result = {}, currentKey;
    if (state[formId] == null || state[formId].fields == null) return result;
    var fields = state[formId].fields;
    for (currentKey in fields) {
      if (!fields.hasOwnProperty(currentKey)) continue;
      FormSegment.fetchValue(fields[currentKey], currentKey, result);
    }
    return result;
  }

  /**
   * Recursively fill the given container with only values.
   *
   * @param {Object|Array} field
   * @param {string|number} currentKey
   * @param {Object} container
   */
  static fetchValue(field, currentKey, container) {
    var key;
    if (field == null) {
      container[currentKey] = null;
    } else if (isArray(field)) {
      // Its an list of T.
      container[currentKey] = [];
      for (key = 0; key < field.length; key++) {
        FormSegment.fetchValue(field[key], key, container[currentKey]);
      }
    } else if (isArray(field.errorMessages)) {
      // It's a field object.
      container[currentKey] = field.value;
    } else {
      // It's an object of T.
      container[currentKey] = {};
      for (key in field) {
        if (!field.hasOwnProperty(key)) continue;
        FormSegment.fetchValue(field[key], key, container[currentKey]);
      }
    }
  }

  /**
   * @param {Object} state
   * @param {string} formId
   * @param {string|Array<string>} fieldName
   * @param {?number} minLength
   * @return {number}
   */
  static _getLength(state, formId, fieldName, minLength) {
    minLength = minLength == null ? 0 : minLength;
    if (state[formId] == null || state[formId].fields == null) return minLength;
    if (isStringDuckType(fieldName)) {
      if (state[formId].fields[fieldName] == null) return minLength;
      return state[formId].fields[fieldName].length;
    }
    var i, ref = state[formId].fields;
    for (i = 0; i < fieldName.length; i++) {
      if (ref == null || !ref.hasOwnProperty(fieldName[i])) {
        // Field hasn't been initialized yet.
        return minLength;
      }
      ref = ref[fieldName[i]];
    }
    return ref.length;
  }

  static _hasErrors(state, formId) {
    if (state[formId] == null || state[formId].fields == null) return false;
    return FormSegment._fetchHasError(state[formId].fields);
  }

  static _fetchHasError(fields) {
    var i;
    if (isArray(fields.errorMessages)) {
      return fields.errorMessages.length > 0;
    } else if (isArray(fields)) {
      for (i = 0; i < fields.length; i++) {
        if (FormSegment._fetchHasError(fields[i])) return true;
      }
    } else {
      for (i in fields) {
        if (!fields.hasOwnProperty(i)) continue;
        if (FormSegment._fetchHasError(fields[i])) return true;
      }
    }
    return false;
  }

  static _getField(state, formId, fieldName) {
    if (state[formId] == null || state[formId].fields == null) {
      return null;
    }
    if (isStringDuckType(fieldName)) {
      return state[formId].fields[fieldName];
    }
    // If not string, we'll need to loop through the field name.
    var i, ref = state[formId].fields;
    for (i = 0; i < fieldName.length; i++) {
      if (ref == null) {
        // This might happen, since addListItem() will add null array entry.
        return null;
      }
      if (!ref.hasOwnProperty(fieldName[i])) return null;
      ref = ref[fieldName[i]];
    }
    return ref;
  }

  static _getFieldValue(state, formId, fieldName) {
    var field = this._getField(state, formId, fieldName);
    if (field == null) return null;
    return field.value;
  }

  static _setFormEnabledState(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    state = update(state, {
      [action.formId]: {
        isEnabled: {$set: action.isEnabled}
      }
    });
    return state;
  }

  static _setIsValidating(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    var fieldName, updateObject, tempAction;
    for (fieldName in action.map) {
      if (!action.map.hasOwnProperty(fieldName)) continue;
      tempAction = {formId: action.formId, fieldName: fieldName};
      state = FormSegment._extractField(state, tempAction).state;
      updateObject = FormSegment._createFieldUpdateObject(tempAction, {
        isValidating: {$set: action.map[fieldName]},
        touched: {$set: true}
      });
      state = update(state, updateObject);
    }
    return state;
  }

  static _setDefaultValue(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    var result = FormSegment._extractField(state, action);
    if (result.field != null) {
      // If the field already exists no need to update the state.
      return state;
    }
    state = result.state;
    return this._setValue(state, ACTION_CREATOR.setValue(
      action.formId, action.fieldName, action.value
    ));
  }

  static _setDefaultValues(state, action) {
    var i, value;
    for (i = 0; i < action.values.length; i++) {
      value = action.values[i];
      state = FormSegment._setDefaultValue(state, ACTION_CREATOR.setDefaultValue(
        action.formId, value.fieldName, value.value
      ));
    }
    return state;
  }

  static _setValue(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    var result = FormSegment._extractField(state, action);
    if (result.field != null && result.field.value === action.value) {
      // If we are setting the same value, no need to update the state.
      return state;
    }
    state = result.state;
    var updateObject = FormSegment._createFieldUpdateObject(action, {
      $set: {
        value: action.value,
        touched: true,
        errorMessages: [],
        isValidating: false,
        isEnabled: true
      }
    });
    return update(state, updateObject);
  }

  static _setValues(state, action) {
    var i, value;
    for (i = 0; i < action.values.length; i++) {
      value = action.values[i];
      state = FormSegment._setValue(state, ACTION_CREATOR.setValue(
        action.formId, value.fieldName, value.value
      ));
    }
    return state;
  }

  static _mergeFields(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    var i, updateObject, tempAction = {formId: action.formId};
    for (i = 0; i < action.fields.length; i++) {
      tempAction.fieldName = action.fields[i].fieldName;
      state = FormSegment._extractField(state, tempAction).state;
      updateObject = FormSegment._createFieldUpdateObject(tempAction, {
        $merge: action.fields[i].object
      });
      state = update(state, updateObject);
    }
    return state;
  }

  static _setErrorMessages(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    state = FormSegment._extractField(state, action).state;
    var updateObject = FormSegment._createFieldUpdateObject(action, {
      errorMessages: {$set: action.errorMessages}
    });
    return update(state, updateObject);
  }

  static _addErrorMessages(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    var i, updateObject, tempAction = {formId: action.formId};
    for (i = 0; i < action.messages.length; i++) {
      tempAction.fieldName = action.messages[i].fieldName;
      state = FormSegment._extractField(state, tempAction).state;
      updateObject = FormSegment._createFieldUpdateObject(tempAction, {
        errorMessages: {$push: action.messages[i].messages}
      });
      state = update(state, updateObject);
    }
    return state;
  }

  static _clearForm(state, action) {
    return update(state, {
      [action.formId]: {
        $set: {
          fields: {},
          isEnabled: true
        }
      }
    });
  }

  static _clearErrorMessages(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    var i, fieldName, field, result, updateObject,
        tempAction = {formId: action.formId};
    for (i = 0; i < action.fieldNames.length; i++) {
      fieldName = action.fieldNames[i];
      tempAction.fieldName = fieldName;
      result = FormSegment._extractField(state, tempAction);
      state = result.state;
      field = result.field;
      if (field != null && field.errorMessages.length > 0) {
        updateObject = FormSegment._createFieldUpdateObject(
          {formId: action.formId, fieldName: fieldName},
          { errorMessages: { $set: [] } }
        );
        state = update(state, updateObject);
      }
    }
    return state;
  }

  static _clearField(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    const result = FormSegment._extractField(state, action);
    state = result.state;
    const updateObject = FormSegment._createFieldUpdateObject(action, {
      $set: null
    });
    return update(state, updateObject);
  }

  static _addListItemWithValue(state, action){
    state = FormSegment._ensureFormExistence(state, action);
    var result = FormSegment._extractField(state, action, []);
    var fieldLength = result.field != null ? result.field.length : 0, fieldName = action.fieldName, value, i;
    var parentFieldName;
    if (fieldName instanceof Array) {
      parentFieldName = fieldName.concat(fieldLength);
    } else {
      parentFieldName = [fieldName, fieldLength];
    }
    state = result.state;
    for (i = 0; i < action.values.length; i++) {
      value = action.values[i];
      state = FormSegment._setValue(state, ACTION_CREATOR.setValue(
        action.formId, parentFieldName.concat(value.fieldName), value.value
      ));
    }
    return state;
  }

  static _addListItem(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    var result = FormSegment._extractField(state, action, []);
    var fieldLength = result.field != null ? result.field.length : 0, addition = [], i,
        minLength = action.minLength == null ? 0 : action.minLength,
        maxLength = action.maxLength != null ? action.maxLength : null;
    state = result.state;
    var numberToAdd = 1;
    if (fieldLength < minLength) {
      numberToAdd += minLength - fieldLength;
    }
    if (maxLength != null && fieldLength + numberToAdd > maxLength) {
      // If more than max length, do not change.
      return state;
    }
    for (i = 0; i < numberToAdd; i++) {
      addition.push(null);
    }
    var updateObject = FormSegment._createFieldUpdateObject(action, {
      $push: addition
    });
    return update(state, updateObject);
  }

  static _removeListItem(state, action) {
    state = FormSegment._ensureFormExistence(state, action);
    state = FormSegment._extractField(state, action, []).state;
    var updateObject = FormSegment._createFieldUpdateObject(action, {
      $splice: [[action.index, 1]]
    });
    return update(state, updateObject);
  }

  static _reorderListItemInc(state, action) {
    return FormSegment._reorderListItem(state, ACTION_CREATOR.reorderListItem(
      action.formId, action.fieldName, action.index, action.index + action.amount
    ));
  }

  static _reorderListItemDec(state, action) {
    return FormSegment._reorderListItem(state, ACTION_CREATOR.reorderListItem(
      action.formId, action.fieldName, action.index, action.index - action.amount
    ));
  }

  static _reorderListItem(state, action) {
    if (action.targetIndex < 0) {
      // No need to do anything
      return state;
    }
    state = FormSegment._ensureFormExistence(state, action);
    var item, result = FormSegment._extractField(state, action, []);
    state = result.state;
    if (result.field == null || !isArray(result.field)) {
      // If the field is non-existent or of the wrong type, there's no need to
      // do anything, just return the initialized field state.
      return state;
    }
    item = result.field[action.index];

    // First remove the item that we want to reorder, then we add the item
    // we just removed to the target index.
    var updateObject = FormSegment._createFieldUpdateObject(action, {
      $splice: [[action.index, 1], [action.targetIndex, 0, item]]
    });
    return update(state, updateObject);
  }

  /**
   * Ensures that the given form exists in the state. Returns the new state
   * object with the initialized form.
   *
   * @param {Object} state
   * @param {Object} action
   * @returns {Object}
   */
  static _ensureFormExistence(state, action) {
    var form = state[action.formId];
    if (form == null) {
      state = update(state, {[action.formId]: {$set: {
        fields: {},
        isEnabled: true
      }}});
    }
    return state;
  }

  /**
   * Extract field from state, while also initializing the field. Returns the
   * newly initialized state and the extracted field (may be null).
   *
   * IMPORTANT NOTE: It is assumed that this method is only called for fields,
   * not arrays/objects containing fields.
   *
   * @param {Object} state
   * @param {Object} action
   * @param {Object|Array|?} defaultFinalValue
   * @returns {{state: state, field: ?Object}}
   */
  static _extractField(state, action, defaultFinalValue) {
    defaultFinalValue = defaultFinalValue || DEFAULT_FIELD;
    var fieldName = action.fieldName, result = state[action.formId].fields;
    if (isStringDuckType(fieldName)) {
      // Field name is string, piece of cake.
      if (result[action.fieldName] == null) {
        state = update(state, {
          [action.formId]: {
            fields: {
              [action.fieldName]: {
                $set: defaultFinalValue
              }
            }
          }
        });
      }
      return {
        state: state,
        field: result[action.fieldName]
      };
    }

    // Field name is array, now we need to loop.
    var i, j, namePiece, finalPieceIdx = fieldName.length - 1;
    var updateObject = {[action.formId]: {fields: {}}}, fieldExists = true;
    var updateObjectFields = updateObject[action.formId].fields, hasUpdated = false;
    var isNextFieldStr, isCurrentResultArray;
    for (i = 0; i < fieldName.length; i++) {
      namePiece = fieldName[i];
      // Field only exists if they are not null. This allows us to add item to
      // repeatable list by adding null entry. The length of the list increases,
      // prompting the repeatable component to render additional field set. We
      // don't need to know the structure of the item to be added. Next time
      // a value setting action is triggered, this method will initialize the
      // structure for us.
      fieldExists = fieldExists && result.hasOwnProperty(namePiece) && result[namePiece] != null;
      if (fieldExists) {
        // If name piece still exists, just continue looping.
        result = result[namePiece];

        // Do type checking to tell users that they are being inconsistent.
        if (i != finalPieceIdx) {
          isNextFieldStr = isStringDuckType(fieldName[i+1]);
          isCurrentResultArray = isArray(result);
          // If next name is number, current object must be an array. If next
          // name is string, current object must be an map.
          if (isNextFieldStr === isCurrentResultArray) {
            var fieldNameStr = FormSegment._generateStringFieldName(fieldName);
            throw new Error('Inconsistency in field, some expected array, other expected map: \'' + fieldNameStr + '\'.');
          }
        }

        updateObjectFields[namePiece] = {};
        updateObjectFields = updateObjectFields[namePiece];
        continue;
      }

      // If name piece does not exist, we'll need to initialize default values.
      // This would be empty object/array or the default field value.
      if (!hasUpdated) {
        // If we haven't run update(), run it first to replace this state with
        // a new one.
        if (i == finalPieceIdx) {
          updateObjectFields[namePiece] = {$set: defaultFinalValue};
        } else if (isStringDuckType(fieldName[i+1])) {
          // The next name piece is a string, so this name piece is an object.
          updateObjectFields[namePiece] = {$set: {}};
        } else {
          // The next name piece is an number, so this name piece is an array.
          updateObjectFields[namePiece] = {$set: []};
        }
        state = update(state, updateObject);
        updateObjectFields[namePiece] = {};
        updateObjectFields = updateObjectFields[namePiece];
        hasUpdated = true;

        // Create a new result reference.
        result = state[action.formId].fields;
        for (j = 0; j <= i; j++) {
          result = result[fieldName[j]];
        }
      } else {
        // If we have run update() once, we don't need to do it again.
        // We can assign values directly.
        if (i == finalPieceIdx) {
          result[namePiece] = defaultFinalValue;
        } else if (isStringDuckType(fieldName[i+1])) {
          result[namePiece] = {};
        } else {
          result[namePiece] = [];
        }
        result = result[namePiece];
      }
    }
    return {
      state: state,
      field: fieldExists ? result : null
    };
  }

  /**
   * Accepts an action object and a react-addons-update object, creating a ready
   * to use object for the update() method.
   *
   * Example output:
   *
   * <pre>
   *   {
   *     formId: {
   *       fields: {
   *         a: {
   *           b: {
   *             3: {
   *               $set: {...}
   *             }
   *           }
   *         }
   *       }
   *     }
   *   }
   * </pre>
   *
   * @param {Object} action
   * @param {Object} updateObject
   * @returns {Object}
   */
  static _createFieldUpdateObject(action, updateObject) {
    var i, result = {}, ref = result, fieldName = action.fieldName;
    if (isStringDuckType(fieldName)) {
      return {[action.formId]: {fields: {[fieldName]: updateObject}}};
    }
    var finalLength = fieldName.length - 1;
    for (i = 0; i < fieldName.length; i++) {
      if (i == finalLength) {
        ref[fieldName[i]] = updateObject;
      } else {
        ref[fieldName[i]] = {};
        ref = ref[fieldName[i]];
      }
    }
    result = {[action.formId]: {fields: result}};
    return result;
  }
}
