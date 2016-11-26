import React from 'react';

/**
 * @param {Array<boolean>} booleanArray
 * @returns {boolean}
 */
export function mergeValidationResult(booleanArray) {
  var i, result = true;
  for (i = 0; i < booleanArray.length; i++) {
    result = result && booleanArray[i];
  }
  return result;
}

/**
 * Returns false if there are differences. Only does reference equality. Useful
 * only for objects that are deemed immutable.
 *
 * @param {Object} objectA
 * @param {Object} objectB
 * @param {?Object<string, Function>} customEqualComparators
 * @return {boolean}
 * @CLIENT_SERVER
 */
export function isEqualShallow(objectA, objectB, customEqualComparators) {
  // Must check: deleted properties, property modification, new properties.
  // Can't use Object.keys - compatibility no. 1 baby!
  if (objectA === objectB) {
    return true;
  }

  // Check nullability.
  if ((objectA == null && objectB != null) || (objectA != null && objectB == null)) {
    return false;
  }

  var key;
  for (key in objectA) {
    if (!objectA.hasOwnProperty(key)) continue; // IE check.
    if (!objectB.hasOwnProperty(key)) return false; // New/deleted properties.

    // Modified properties.
    if (customEqualComparators != null && customEqualComparators.hasOwnProperty(key)) {
      if (!customEqualComparators[key](objectA[key], objectB[key])) return false;
    } else {
      if (objectA[key] !== objectB[key]) return false;
    }
  }
  for (key in objectB) {
    if (!objectB.hasOwnProperty(key)) continue; // IE check.
    if (!objectA.hasOwnProperty(key)) return false; // New/deleted properties.
  }

  return true;
}

/**
 * @param {Array} arrayA
 * @param {Array} arrayB
 * @return {boolean}
 */
export function isEqualShallowArray(arrayA, arrayB) {
  // Check nullability.
  if ((arrayA == null && arrayB != null) || (arrayA != null && arrayB == null)) {
    return false;
  }

  if (arrayA.length != arrayB.length) {
    return false;
  }
  var i;
  for (i = 0; i < arrayA.length; i++) {
    if (arrayA[i] !== arrayB[i]) return false;
  }
  return true;
}

/**
 * Compares equality between two react children property. Only compares the
 * props between the two.
 *
 * @param {?} childrenA
 * @param {?} childrenB
 */
export function isReactChildrenEqual(childrenA, childrenB) {
  // Since order matters in children, we can safely convert them to array and
  // compare the props one by one.
  var i, childA, childB, childrenArrayA = React.Children.toArray(childrenA);
  var childrenArrayB = React.Children.toArray(childrenB);
  if (childrenArrayA.length != childrenArrayB.length) return false;
  for (i = 0; i < childrenArrayA.length; i++) {
    childA = childrenArrayA[i];
    childB = childrenArrayB[i];
    if (childA.type !== childB.type || !isEqualShallow(childA.props, childB.props)) return false;
  }
  return true;
}

/**
 * @param {?} value
 * @return {boolean}
 */
export var isArray = Array.isArray ? Array.isArray : function(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
};

/**
 * @param {?} value
 * @returns {boolean}
 */
export function isStringDuckType(value) {
  return value.substring;
}

/**
 * @param {?} value
 * @returns {boolean}
 */
export function isArrayDuckType(value) {
  return value.splice;
}

/**
 * @param {?} value
 * @returns {boolean}
 */
export function isStringAndNotEmpty(value) {
  return value != null && isStringDuckType(value) && value != '';
}