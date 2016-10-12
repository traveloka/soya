import Bucket from '../Bucket.js';

/**
 * Passed around as result object in reverse routing.
 *
 * @CLIENT-SERVER
 */
export default class ReverseRoutingData {
  /**
   * @type {Object}
   */
  routeArgs;

  /**
   * @type {?string}
   */
  protocol;

  /**
   * @type {?string}
   */
  domain;

  /**
   * @type {?number}
   */
  port;

  /**
   * @type {Array<string>}
   */
  pathSegments;

  /**
   * @type {Bucket}
   */
  query;

  /**
   * @type {?string}
   */
  routeId;

  /**
   * @type {?string}
   */
  pageName;

  /**
   * @param {Object} routeArgs
   */
  constructor(routeArgs) {
    this.query = new Bucket();
    this.pathSegments = [];
    this.routeArgs = routeArgs == null ? {} : routeArgs;
  }

  /**
   * @param {?string} fragment
   */
  toUrlString(fragment) {
    var result = '', value, queryData = this.query.getAll(), key, i, first;

    // Domain and protocol. End result: http(s)://domain/
    if (this.domain) {
      if (this.protocol) {
        result += this.protocol;
      } else {
        result += 'http';
      }
      result += `://${this.domain}`;
    }

    // Path.
    for (i = 0; i < this.pathSegments.length; i++) {
      result += '/' +  this.pathSegments[i];
    }

    first = true;
    for (key in queryData) {
      if (first) {
        result += '?';
        first = false;
      }

      if (!queryData.hasOwnProperty(key)) continue;
      value = queryData[key];
      if (typeof value == 'string') {
        result += encodeURIComponent(key) + encodeURIComponent(value) + '&';
        continue;
      }

      // If not string, assume it's array.
      for (i = 0; i < value.length; i++) {
        result += encodeURIComponent(key) + encodeURIComponent(value[i]) + '&';
      }
    }

    if (result[result.length-1] == '&') {
      result = result.substr(0, result.length-1);
    }

    if (fragment) result += `#${fragment}`;
    return result;
  }
}