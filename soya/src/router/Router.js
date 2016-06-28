import RouteResult from './RouteResult.js';
import ServerHttpRequest from '../http/ServerHttpRequest';
import RoutingData from './RoutingData';
import FinalPathNode from './FinalPathNode';

/*
type RouteConfig = {
  page: string;
  nodes: Array<Array<any>>;
};
*/

/**
 * Simple router implementation. You can create your own router implementation.
 * As long as it has the route() and  will do just fine
 *
 * 1) Parses route file and create array of entry points.
 * 2) Holds cache of Page instances and routes request to the Page instance.
 *
 * @SERVER
 */
export default class Router {
  /**
   * @type {{[key: string]: Node}}
   */
  _routeNodes;

  /**
   * @type {Array<Node>}
   */
  _graph;

  /**
   * @type {RouteResult}
   */
  _notFoundRouteResult;

  /**
   * @type {Logger}
   */
  _logger;

  /**
   * @type {NodeFactory}
   */
  _nodeFactory;

  /**
   * @type {Array<Node>}
   */
  _preProcessNodes;

  /**
   * @type {Array<Node>}
   */
  _postProcessNodes;

  /**
   * @param {NodeFactory} nodeFactory
   * @param {Logger} logger
   */
  constructor(logger, nodeFactory) {
    this._logger = logger;
    this._nodeFactory = nodeFactory;
    this._routeNodes = {};
    this._graph = [];
    this._preProcessNodes = [];
    this._postProcessNodes = [];
  }

  /**
   * @return {boolean}
   */
  getNotFoundRouteResult() {
    return this._notFoundRouteResult;
  }

  /**
   * @param {string} pageName
   */
  set404NotFoundPage(pageName) {
    this._notFoundRouteResult = new RouteResult();
    this._notFoundRouteResult.routeId = '__404';
    this._notFoundRouteResult.pageName = pageName;
    this._notFoundRouteResult.routeArgs = {};
  }

  /**
   * @param {string} routeId
   * @param {Object} configObj
   */
  reg(routeId, configObj) {
    if (routeId[0] == '_') {
      throw new Error('Route ID must not start with underscore: ' + routeId);
    }
    if (this._routeNodes.hasOwnProperty(routeId)) {
      throw new Error('Duplicate route ID: ' + routeId);
    }

    // Pages should have already been validated by Routes.
    var pageName = configObj.page;
    var configNodes = configObj.nodes;
    if (!configNodes) {
      // If no nodes specified, then it's an error!
      throw new Error('Error in adding route, no nodes configured: \'' + routeId + '\'.');
    }

    // Create an array of nodes.
    var nodes = this._nodeFactory.createFromConfig(configNodes);
    if (nodes.length < 1) {
      throw new Error('Invalid route, no nodes discovered: ' + routeId);
    }

    // Set nodes for reverse routing.
    this._routeNodes[routeId] = nodes;

    // Find parent node to chain with.
    var i, parentNode;
    for (i = 0; i < this._graph.length; i++) {
      if (this._graph[i].equals(nodes[0])) {
        parentNode = this._graph[i];
        break;
      }
    }

    // If no reusable parent node, add the node to the graph list and start
    // chaining from there.
    if (!parentNode) {
      this._graph.push(nodes[0]);
      parentNode = nodes[0];
    }

    // Start chaining nodes together.
    var curIndex = 1, children, foundEqual;
    while (curIndex < nodes.length) {
      if (!nodes[curIndex].isLeaf()) {
        throw new Error('User given route nodes must be leaf!');
      }

      foundEqual = false;
      children = parentNode.getChildren();
      for (i = 0; i < children.length; i++) {
        if (children[i].equals(nodes[curIndex])) {
          foundEqual = true;
          parentNode = children[i];
          break;
        }
      }
      if (!foundEqual) {
        parentNode.addChild(nodes[curIndex]);
        parentNode = nodes[curIndex];
      }
      curIndex++;
    }

    // Add setter node.
    parentNode.addChild(new FinalPathNode(routeId, pageName));
  }

  /**
   * @param {ServerHttpRequest} httpRequest
   * @return {?RouteResult}
   */
  route(httpRequest) {
    var i, routingData = new RoutingData(httpRequest);

    // Start pre processing. Pre processing may invalidate routes.
    for (i = 0; i < this._preProcessNodes.length; i++) {
      if (this._preProcessNodes[i].evaluate(routingData) !== true) return null;
    }

    // Start state based routing.
    this._routeRecursively(this._graph, routingData);

    // Start post processing. Post processing may invalidate routes.
    for (i = 0; i < this._postProcessNodes.length; i++) {
      if (this._postProcessNodes[i].evaluate(routingData) !== true) return null;
    }

    var routeResult = routingData.createResult();
    if (routeResult == null) {
      this._logger.notice('404 not found -> ', null, [this._logger.prepRequest(httpRequest._httpRequest)]);
      routeResult = this._notFoundRouteResult;
    }
    return routeResult;
  }

  /**
   * @param {Array<Node>} childNodes
   * @param {RoutingData} routingData
   * @returns {boolean}
   */
  _routeRecursively(childNodes, routingData) {
    var i, childResult, found = false;
    for (i = 0; i < childNodes.length; i++) {
      // If the node doesn't match, no need to continue to its children.
      if (childNodes[i].evaluate(routingData) !== true) continue;

      if (childNodes[i].isLeaf()) {
        // If this is already the leaf, then it's a match.
        // Since it is guaranteed that all leaf is a FinalPathNode, this
        // guarantees that routing result is already set. We return true.
        return true;
      }

      // Else we need to recursively check all the children
      // until we reach the leaf.
      childResult = this._routeRecursively(childNodes[i].getChildren(), routingData);
      if (childResult === true) {
        found = true;
        break;
      } else if (childNodes[i].isConsumingSegmentOnMatch()) {
        // If we've recursively checked all the children and found no match,
        // and the the currently matching parent is a PathNode, we need to
        // undo the path consumption.
        routingData.undoConsumeSegment();
      }
    }

    return found;
  }
}