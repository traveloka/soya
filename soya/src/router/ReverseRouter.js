import ReverseRoutingData from './ReverseRoutingData.js';

/**
 * Used for reverse routing.
 *
 * @CLIENT-SERVER
 */
export default class ReverseRouter {
  /**
   * @type {Array<Node>}
   */
  _preProcessNodes;

  /**
   * @type {Array<Node>}
   */
  _postProcessNodes;

  /**
   * @type {{[key: string]: Array<Node>}}
   */
  _routeNodes;

  /**
   * @type {NodeFactory}
   */
  _nodeFactory;

  /**
   * @param {NodeFactory} nodeFactory
   */
  constructor(nodeFactory) {
    this._preProcessNodes = [];
    this._postProcessNodes = [];
    this._routeNodes = {};
    this._nodeFactory = nodeFactory;
  }

  /**
   * @param {string} routeId
   * @param {Array<Array<any>>} configObj
   */
  reg(routeId, configObj) {
    // Don't need to do validation, since this is only used in client anyway,
    // and anything passed on to the client have received validation
    // server-side.
    var configNodes = configObj.nodes;
    if (!configNodes) {
      // Registration for 404 route. Ignore.
      return;
    }

    // Set nodes for reverse routing.
    // TODO: In History API navigation, we will have to take care of variables such as this, that can change when it's cached in client.
    var nodes = this._nodeFactory.createFromConfig(configNodes);
    this._routeNodes[routeId] = nodes;
  }

  /**
   * @param {string} routeId
   * @param {?Object} routeArgs
   * @param {?string} fragment
   * @returns {string}
   */
  reverseRoute(routeId, routeArgs, fragment) {
    var routeNodes = this._routeNodes;
    if (!routeNodes.hasOwnProperty(routeId)) {
      throw new Error(`Reverse routing called for uknown route: '${routeId}'.`);
    }
    var i, nodes = routeNodes[routeId];
    var reverseRoutingData = new ReverseRoutingData(routeArgs);

    // The graph thing is only used to speed routing up.
    // Since this is executed infrequently in client, we don't have to
    // worry about such things, just do reverse evaluation with proper
    // ordering.
    for (i = 0; i < nodes.length; i++) {
      nodes[i].reverseEvaluate(reverseRoutingData);
    }

    return reverseRoutingData.toUrlString(fragment);
  }

  getAllRoutes() {
    var routes = [];
    for (var routeId in this._routeNodes) {
      routes.push(this.reverseRoute(routeId));
    }
    return routes;
  }
}