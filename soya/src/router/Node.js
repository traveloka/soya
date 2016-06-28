/**
 * Extend this class or create a custom class that owns the same methods as
 * this one to modify routing behavior.
 *
 * IMPORTANT NOTE: Node classes will be executed in both server and client side.
 * Please ensure that your implementation does not load and use node specific
 * APIs.
 *
 * @CLIENT-SERVER
 */
export default class Node {
  /**
   * @type {Array<Node>}
   */
  _children;

  constructor() {
    this._children = [];
  }

  /**
   * @returns {boolean}
   */
  isLeaf() {
    return this._children.length <= 0;
  }

  /**
   * @param {Node} node
   */
  addChild(node) {
    this._children.push(node);
  }

  /**
   * @returns {Array<Node>}
   */
  getChildren() {
    return this._children;
  }

  /**
   * @return {string}
   */
  getType() {
    throw new Error('Node implementation does not implement this required method.');
  }

  /**
   * Returns true if the current active path segment (or other request specific
   * metadata) matches. If something other than true is returned, the routing
   * will stop and not found route result will be returned.
   *
   * @param {RoutingData} routingData
   * @return {boolean}
   */
  evaluate(routingData) {
    throw new Error('Node implementation does not implement this required method.');
  }

  /**
   * @param {ReverseRoutingData} reverseRoutingData
   */
  reverseEvaluate(reverseRoutingData) {
    throw new Error('Node implementation does not implement this required method.');
  }

  /**
   * Node implementation should return true if this node consumes path on
   * router match.
   *
   * @returns {boolean}
   */
  isConsumingSegmentOnMatch() {
    throw new Error('Node implementation does not implement this required method.');
  }

  /**
   * Check if this node instance is equals to the other node. Allows us to
   * construct graph, so routing can be done faster.
   *
   * @param {Node} node
   * @returns {boolean}
   */
  equals(node) {
    throw new Error('Node implementation does not implement this required method.');
  }
}