import Node from './Node';

/**
 * @CLIENT-SERVER
 */
export default class MethodNode extends Node {
  /**
   * @returns {number}
   */
  static get order() {
    return 20;
  }

  /**
   * @returns {string}
   */
  static get nodeName() {
    return 'method';
  }

  /**
   * @param {Array<any>} argArray
   * @returns {Array<Node>}
   */
  static constructFromConfig(argArray) {
    if (argArray.length != 1) {
      throw new Error('Domain node only receives one argument! Got ' + argArray.length + '.');
    }
    return [new MethodNode(argArray[0] + '')];
  }

  /**
   * @type {string}
   */
  _method;

  /**
   * @param {string} method
   */
  constructor(method) {
    super();
    this._method = method;
  }

  /**
   * @param {RoutingData} routingData
   * @returns {boolean}
   */
  evaluate(routingData) {
    return routingData.incomingRequest.getMethod() == this._method;
  }

  /**
   * @param {ReverseRoutingData} reverseRoutingData
   */
  reverseEvaluate(reverseRoutingData) {
    // No-op.
  }

  isConsumingSegmentOnMatch() {
    return false;
  }

  /**
   * @param {Node} node
   * @returns {boolean}
   */
  equals(node) {
    return node instanceof MethodNode && node._method == this._method;
  }
}