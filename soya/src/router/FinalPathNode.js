import Node from './Node';

/**
 * @CLIENT-SERVER
 */
export default class FinalPathNode extends Node {
  /**
   * @type {string}
   */
  _routeId;

  /**
   * @type {string}
   */
  _pageName;

  /**
   * @param {string} routeId
   * @param {string} pageName
   */
  constructor(routeId, pageName) {
    super();
    this._routeId = routeId;
    this._pageName = pageName;
  }

  /**
   * @param {RoutingData} routingData
   * @returns {boolean}
   */
  evaluate(routingData) {
    if (!routingData.isAllSegmentConsumed()) {
      // We only set routing result if all path is already consumed. Otherwise
      // this node does not match.
      return false;
    }
    routingData.resultPageName = this._pageName;
    routingData.resultRouteId = this._routeId;
    return true;
  }

  /**
   * @param {ReverseRoutingData} reverseRoutingData
   */
  reverseEvaluate(reverseRoutingData) {
    reverseRoutingData.routeId = this._routeId;
    reverseRoutingData.pageName = this._pageName;
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
    return node instanceof FinalPathNode && node._routeId == this._routeId &&
        node._pageName == this._pageName;
  }
}