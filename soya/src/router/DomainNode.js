import Node from './Node';

/**
 * @CLIENT-SERVER
 */
export default class DomainNode extends Node {
  /**
   * @returns {number}
   */
  static get order() {
    return 10;
  }

  /**
   * @returns {string}
   */
  static get nodeName() {
    return 'domain';
  }

  /**
   * @param {Array<any>} argArray
   * @return {Array<Node>}
   */
  static constructFromConfig(argArray) {
    if (argArray.length != 1) {
      throw new Error('Domain node only receives one argument! Got ' + argArray.length + '.');
    }
    return [new DomainNode(argArray[0] + '')];
  }

  /**
   * @type {string}
   */
  _domain;

  /**
   * @param {string} domain
   */
  constructor(domain) {
    super();
    this._domain = domain;
  }

  /**
   * @param {RoutingData} routingData
   * @returns {boolean}
   */
  evaluate(routingData) {
    return routingData.incomingRequest.getDomain() == this._domain;
  }

  /**
   * @param {ReverseRoutingData} reverseRoutingData
   */
  reverseEvaluate(reverseRoutingData) {
    reverseRoutingData.domain = this._domain;
  }

  /**
   * @returns {boolean}
   */
  isConsumingSegmentOnMatch() {
    return false;
  }

  /**
   * @param {Node} node
   * @returns {boolean}
   */
  equals(node) {
    return node instanceof DomainNode && node._domain == this._domain;
  }
}