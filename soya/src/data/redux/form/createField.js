import React from 'react';

import { isEqualShallow, mergeValidationResult, isStringDuckType, isEqualShallowArray } from '../helper.js';
import PromiseUtil from '../PromiseUtil.js';
import FormSegment from './FormSegment.js';
import connect from '../connect.js';

/**
 * Wraps the given InputComponent in a component that links to FormSegment with
 * the following contract:
 *
 * 1) InputComponent must get value from props.value when rendering.
 * 2) InputComponent must run props.handleChange when the value changes.
 * 3) InputComponent may run props.handleAsyncChange if it wants to be able to
 *    run async validation and async change handlers.
 *
 * Accepts the following special props:
 *
 * 1) reduxStore
 * 2) config
 * 3) changeHandlers (array of functions, optional)
 * 4) changeValidators (array of functions, optional)
 * 5) asyncValidators (array of functions, optional)
 * 6) submitValidators (array of functions, optional)
 *
 * Any other props will be passed on to the wrapped input component untouched.
 *
 * @param {React.Component} InputComponent
 * @return {ReactComponent}
 *
 * @CLIENT_SERVER
 */
export default function createField(InputComponent) {
  var type = typeof InputComponent.getQueryType == 'function' ? InputComponent.getQueryType() : 'field';

  // TODO: Move these methods into separate functions above, so that they are reused instead of always recreated.
  class Component extends React.Component {
    __handleChange;
    __handleAsyncValidation;
    __inputChangeValidators;
    __inputAsyncValidators;
    __submitValidators;
    __registerChangeValidators;
    __registerAsyncValidators;
    __registerSubmitValidators;

    /**
     * @returns {string}
     */
    static connectId() {
      return InputComponent.connectId ? InputComponent.connectId() : 'Field Component';
    }

    /**
     * @returns {Array<Segment>}
     */
    static getSegmentDependencies() {
      return [FormSegment];
    }

    static shouldSubscriptionsUpdate(props, nextProps) {
      var isNameString = isStringDuckType(props.name);
      var isNextNameString = isStringDuckType(nextProps.name);
      return (
        props.form !== nextProps.form ||
        isNameString !== isNextNameString ||
        isNameString && props.name !== nextProps.name ||
        !isNameString && !isEqualShallowArray(props.name, nextProps.name)
      );
    }

    static subscribeQueries(props, subscribe) {
      subscribe(FormSegment.id(), {
        formId: props.form.getFormId(),
        type: type,
        fieldName: props.name
      }, 'field');
      subscribe(FormSegment.id(), {
        formId: props.form.getFormId(),
        type: 'isEnabled'
      }, 'isEnabled');
      subscribe(FormSegment.id(), {
        formId: props.form.getFormId(),
        type: 'isSubmitting'
      }, 'isSubmitting');
    }

    constructor(props, context) {
      super(props, context);
      this.__inputChangeValidators = [];
      this.__inputAsyncValidators = [];
      this.__submitValidators = [];
      this.__setDefaultValue = this.setDefaultValue.bind(this);
      this.__handleChange = this.handleChange.bind(this);
      this.__handleAsyncValidation = this.handleAsyncValidation.bind(this);
      this.__registerAsyncValidators = this.registerAsyncValidators.bind(this);
      this.__registerChangeValidators = this.registerChangeValidators.bind(this);
      this.__registerSubmitValidators = this.registerSubmitValidators.bind(this);
    }

    componentWillMount() {
      // TODO: Also do this when component receive new props, since owner component may reassign this component to a new field.
      this.props.form.regField(
        this.props.name, this.handleValidateAll.bind(this));
    }

    componentWillUnmount() {
      this.props.form.unregField(this.props.name);
    }

    shouldComponentUpdate(nextProps, nextState) {
      // We don't use state, so we don't have to check it. But we do have to
      // check for props.
      return !isEqualShallow(nextProps, this.props);
    }

    render() {
      // Pass appropriate props to the InputComponent.
      var key, props = {};
      for (key in this.props) {
        if (!this.props.hasOwnProperty(key)) continue;
        if (key == 'result' || key == 'changeHandlers' || key == 'validators' || key == 'validatorsAsync') continue;
        props[key] = this.props[key];
      }

      if (this.props.result.field) {
        props.value = this.props.result.field.value;
        props.errorMessages = this.props.result.field.errorMessages;
        props.touched = this.props.result.field.touched;
        props.isValidating = this.props.result.field.isValidating;
        props.isFieldEnabled = this.props.result.field.isEnabled;
      } else {
        // TODO: Use default value from FormSegment.
        props.value = null;
        props.errorMessages = [];
        props.touched = false;
        props.isFieldEnabled = true;
        props.isValidating = false;
      }

      if (this.props.result.hasOwnProperty('isEnabled')) {
        props.isFormEnabled = this.props.result.isEnabled;
      } else {
        props.isFormEnabled = true;
      }

      if (this.props.result.hasOwnProperty('isSubmitting')) {
        props.isFormSubmitting = this.props.result.isSubmitting;
      } else {
        props.isFormSubmitting = false;
      }

      props.isDisabled = props.isValidating || !props.isFormEnabled || !props.isFieldEnabled || props.isFormSubmitting;
      props.setDefaultValue = this.__setDefaultValue;
      props.handleChange = this.__handleChange;
      props.handleAsyncValidation = this.__handleAsyncValidation;
      props.registerChangeValidators = this.__registerChangeValidators;
      props.registerAsyncValidators = this.__registerAsyncValidators;
      props.registerSubmitValidators = this.__registerSubmitValidators;

      // For performance optimizations, InputComponent may implement
      // shouldComponentUpdate that checks for changes in props.
      return <InputComponent key="main" {...props} />;
    }

    /**
     * @param {Array<Function>} funcArray
     */
    registerChangeValidators(funcArray) {
      this.__inputChangeValidators = this.__inputChangeValidators.concat(funcArray);
    }

    /**
     * @param {Array<Function>} funcArray
     */
    registerAsyncValidators(funcArray) {
      this.__inputAsyncValidators = this.__inputAsyncValidators.concat(funcArray);
    }

    /**
     * @param {Array<Function>} funcArray
     */
    registerSubmitValidators(funcArray) {
      this.__submitValidators = this.__submitValidators.concat(funcArray);
    }

    setDefaultValue(value) {
      var actions = FormSegment.getActionCreator();
      this.props.getReduxStore().dispatch(actions.setDefaultValue(
        this.props.form.getFormId(), this.props.name, value
      ));
    }

    /**
     * @param {?} value
     */
    handleChange(value) {
      // TODO: Change usage this.props.getActionCreator() to FormSegment.getActionCreator().
      var i, errorMessages = this.validateSync(value);
      var actions = this.props.getActionCreator(FormSegment.id());
      if (errorMessages.length == 0) {
        this.props.getReduxStore().dispatch(actions.setValue(
          this.props.form.getFormId(), this.props.name, value
        ));
      } else {
        this.props.getReduxStore().dispatch(actions.mergeFields(
          this.props.form.getFormId(), [{
            fieldName: this.props.name,
            object: {
              value: value,
              touched: true,
              errorMessages: errorMessages
            }
          }])
        );
      }

      // After dispatching (and closing the loop). Run the change handlers.
      if (this.props.changeHandlers) {
        for (i = 0; i < this.props.changeHandlers.length; i++) {
          this.props.changeHandlers[i](value);
        }
      }
    }

    /**
     * Runs all sync and async validators. Returns a promise that resolves to
     * the following object:
     *
     * <pre>
     *   {
     *     isValid: true/false,
     *     name: (field name),
     *     value: (the value)
     *   }
     * </pre>
     *
     * The promise should reject if there's an error with async validation.
     *
     * @returns {Promise}
     */
    handleValidateAll() {
      var name = this.props.name;
      var value = this.props.result.field ? this.props.result.field.value : null;
      var errorMessages = this.validateSync(value);
      if (errorMessages.length > 0) {
        var actions = this.props.getActionCreator(FormSegment.id());
        this.props.getReduxStore().dispatch(actions.mergeFields(
          this.props.form.getFormId(), [{
            fieldName: this.props.name,
            object: {
              errorMessages: errorMessages
            }
          }]
        ));
        return Promise.resolve({isValid: false, value: value, name: name});
      }

      var asyncPromise, submitPromise;
      var hasAsyncValidation = this.hasAsyncValidation();
      var hasSubmitValidation = this.hasSubmitValidation();
      if (!hasAsyncValidation && !hasSubmitValidation) {
        return Promise.resolve({isValid: true, value: value, name: name});
      }

      if (!hasAsyncValidation) {
        asyncPromise = Promise.resolve(true);
      } else {
        this.lock();
        asyncPromise = this.validateAsync(value);
      }

      if (!hasSubmitValidation) {
        submitPromise = Promise.resolve(true);
      } else {
        submitPromise = this.validateSubmit(value);
      }

      return PromiseUtil.allParallel(Promise, [asyncPromise, submitPromise]).then(
        (results) => {
          this.unlock();
          var isValid = mergeValidationResult(results);
          return {isValid: isValid, value: value, name: name};
        }
      ).catch((error) => {
        this.unlock();
        PromiseUtil.throwError(error);
      });
    }

    /**
     * This handler doesn't update value - we assume that handleChange
     * is already run and thus value in FormSegment is already updated. It's
     * a trigger for asynchronous validation. We assume that:
     *
     * - Asynchronous validation must trigger on a less often triggered event,
     *   like onBlur or a predetermined timeout.
     * - The input component will read isValidating value and appropriately
     *   disables the input when the asynchronous validation is running to
     *   prevent lagging async validation to happen.
     *
     * Returns a promise that resolves to true if the value passes validation,
     * or false if not.
     *
     * @return {?Promise}
     */
    handleAsyncValidation() {
      var value = this.props.result.field ? this.props.result.field.value : null;
      var errorMessages = this.validateSync(value);
      if (errorMessages.length > 0) {
        // No need to continue if sync validation has failed.
        return Promise.resolve(false);
      }

      // No need to run if we have no async validation.
      var hasAsyncValidation = this.hasAsyncValidation();
      if (!hasAsyncValidation) {
        return Promise.resolve(true);
      }

      this.lock();
      var promise = this.validateAsync(value);
      promise.then(this.unlock.bind(this)).catch((error) => {
        this.unlock();
        PromiseUtil.throwError(error);
      });
      return promise;
    }

    /**
     * Runs input and props sync validators on the value and returns the error
     * messages.
     *
     * @param {?} value
     * @return {Array<string>}
     */
    validateSync(value) {
      // Run validation, run user validation first since it may contain the
      // required or optional validator.
      var i, result, errorMessages = [];
      if (this.props.changeValidators) {
        for (i = 0; i < this.props.changeValidators.length; i++) {
          result = this.props.changeValidators[i](value);
          if (!this.pushErrorMessage(result, errorMessages)) return errorMessages;
        }
      }
      for (i = 0; i < this.__inputChangeValidators.length; i++) {
        result = this.__inputChangeValidators[i](value);
        if (!this.pushErrorMessage(result, errorMessages)) return errorMessages;
      }
      return errorMessages;
    }

    /**
     * Returns a promise that resolves to true if value passes validation, or
     * false if not.
     *
     * @param {?} value
     * @returns {Promise}
     */
    validateAsync(value) {
      var i, promises = [];
      for (i = 0; i < this.__inputAsyncValidators.length; i++) {
        promises.push(this.__inputAsyncValidators[i](value));
      }
      if (this.props.asyncValidators) {
        for (i = 0; i < this.props.asyncValidators.length; i++) {
          promises.push(this.props.asyncValidators[i](value));
        }
      }
      return this._createValidatorPromise(promises);
    }

    /**
     * @param {?} value
     * @return {Promise}
     */
    validateSubmit(value) {
      var i, promises = [];
      for (i = 0; i < this.__submitValidators.length; i++) {
        promises.push(Promise.resolve(this.__submitValidators[i](value)));
      }
      if (this.props.submitValidators) {
        for (i = 0; i < this.props.submitValidators.length; i++) {
          promises.push(Promise.resolve(this.props.submitValidators[i](value)));
        }
      }
      return this._createValidatorPromise(promises);
    }

    /**
     * @param {Array<Promise>} promises
     * @returns {Promise}
     * @private
     */
    _createValidatorPromise(promises) {
      var parallelPromise = PromiseUtil.allParallel(Promise, promises);
      var finalPromise = new Promise((resolve, reject) => {
        parallelPromise.then(
          (result) => {
            var i, errorMessages = [];
            var actions = this.props.getActionCreator(FormSegment.id());
            for (i = 0; i < result.length; i++) {
              if (typeof result[i] == 'string') errorMessages.push(result[i]);
            }
            this.props.getReduxStore().dispatch(actions.addErrorMessages(
              this.props.form.getFormId(), [{
                fieldName: this.props.name,
                messages: errorMessages
              }]
            ));
            resolve(errorMessages.length <= 0);
          },
          (error) => {
            reject(error);
          });
      });
      return finalPromise;
    }

    /**
     * @returns {boolean}
     */
    hasAsyncValidation() {
      return (
        this.__inputAsyncValidators.length > 0 ||
        (this.props.asyncValidators && this.props.asyncValidators.length > 0)
      );
    }

    /**
     * @return {boolean}
     */
    hasSubmitValidation() {
      return (
        this.__submitValidators.length > 0 ||
        (this.props.submitValidators && this.props.submitValidators.length > 0)
      );
    }

    /**
     * Locks this field by setting its isValidating flag to true.
     */
    lock() {
      var actions = this.props.getActionCreator(FormSegment.id());
      this.props.getReduxStore().dispatch(actions.setIsValidating(
        this.props.form.getFormId(), { [this.props.name] : true }
      ));
    }

    /**
     * Unlock this field by setting its isValidating flag to false.
     */
    unlock() {
      var actions = this.props.getActionCreator(FormSegment.id());
      this.props.getReduxStore().dispatch(actions.setIsValidating(
        this.props.form.getFormId(), { [this.props.name]: false }
      ));
    }

    /**
     * Returns true if next validator function should be called. Returns false
     * otherwise.
     *
     * @param {string|boolean} result
     * @param {Array<string>} errorMessages
     * @return {boolean}
     */
    pushErrorMessage(result, errorMessages) {
      if (result === null) return false;
      if (typeof result == 'string') errorMessages.push(result);
      return true;
    }
  }

  return connect(Component);
}