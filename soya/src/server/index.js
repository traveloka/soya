import path from 'path';
import yaml from 'js-yaml';
import fs from 'fs';

import webpack from 'webpack';
import React from 'react';

import Router from '../router/Router.js';
import ReverseRouter from '../router/ReverseRouter.js';
import DomainNode from '../router/DomainNode.js';
import MethodNode from '../router/MethodNode.js';
import PathNode from '../router/PathNode.js';
import NodeFactory from '../router/NodeFactory.js';
import ComponentRegister from '../ComponentRegister.js';
import WebpackCompiler from '../compiler/webpack/WebpackCompiler.js';
import { DEFAULT_FRAMEWORK_CONFIG } from '../defaultFrameworkConfig.js';
import Application from '../Application.js';
import Precompiler from '../precompile/Precompiler.js';

// These dependencies can all be overwritten by user.
import registerRouterNodes from 'soya/lib/server/registerRouterNodes';
import defaultCreateLogger from './createLogger.js';
import defaultCreateErrorHandler from './createErrorHandler.js';

/**
 * @param {Object} config
 * @param {Object} pages
 * @param {Object} components
 * @SERVER
 */
export default function server(config, pages) {
  var frameworkConfig = config.frameworkConfig;
  var serverConfig = config.serverConfig;
  var clientConfig = config.clientConfig;
  frameworkConfig = Object.assign({}, DEFAULT_FRAMEWORK_CONFIG, frameworkConfig);

  var createLogger = defaultCreateLogger;
  var createErrorHandler = defaultCreateErrorHandler;

  // Load custom logger and error handler factory.
  if (typeof frameworkConfig.loggerFactoryFunction == 'function') {
    createLogger = frameworkConfig.loggerFactoryFunction;
  }
  if (typeof frameworkConfig.errorHandlerFactoryFunction == 'function') {
    createErrorHandler = frameworkConfig.errorHandlerFactorFunction;
  }

  var logger = createLogger(serverConfig);
  var errorHandler = createErrorHandler(serverConfig, logger);
  var nodeFactory = new NodeFactory();
  var pageName, handlerRegister = new ComponentRegister(logger);

  // Register all pages to handler register.
  for (pageName in pages) {
    handlerRegister.regPage(
      pageName, path.join(frameworkConfig.absoluteProjectDir, pageName),
      pages[pageName]
    );
  }

  // Register default nodes for router.
  nodeFactory.registerNodeType(DomainNode);
  nodeFactory.registerNodeType(MethodNode);
  nodeFactory.registerNodeType(PathNode);

  // Load custom router nodes and create router.
  registerRouterNodes(nodeFactory, serverConfig);
  var router = new Router(logger, nodeFactory, handlerRegister);
  var reverseRouter = new ReverseRouter(nodeFactory);

  if (frameworkConfig.componentBrowser) {
    // Register component browser routes.
    router.reg('CMPT_BROWSER_LIST', {
      page: Precompiler.getCmptBrowserListPageRelativePath(),
      nodes: [
        ['method', 'GET'],
        ['path', '/component-browser']
      ]
    });
  }

  // Load routes.
  var routes = yaml.safeLoad(fs.readFileSync(path.join(config.frameworkConfig.absoluteProjectDir, 'routes.yml'), 'utf8'));
  var routeId;
  for (routeId in routes) {
    router.reg(routeId, routes[routeId]);
    reverseRouter.reg(routeId, routes[routeId]);
  }

  // If not found page is not set up.
  if (!router.getNotFoundRouteResult()) {
    throw new Error('404 not found page not registered! Please create a 404 not found page.');
  }

  var webpackDevMiddleware;
  var webpackHotMiddleware;

  if (frameworkConfig.hotReload) {
    webpackDevMiddleware = require('webpack-dev-middleware');
    webpackHotMiddleware = require('webpack-hot-middleware');
  }

  var compiler = new WebpackCompiler(
    logger, frameworkConfig, webpack, React,
    webpackDevMiddleware, webpackHotMiddleware);

  var application = new Application(logger, handlerRegister, routes, router, reverseRouter, errorHandler, compiler, frameworkConfig, serverConfig, clientConfig);

  // trigger client build without have to start the server as well.
  if (process.env.RUN_MODE && process.env.RUN_MODE === 'buildClient') {
    application.buildClient();
  } else {
    const middlewares = application.start();
    return new Promise(resolve => {
      if (typeof middlewares[0].waitUntilValid !== 'undefined') {
        middlewares[0].waitUntilValid(() => resolve(middlewares));
      } else {
        resolve(middlewares);
      }
    });
  }

  return Promise.resolve(null);
}
