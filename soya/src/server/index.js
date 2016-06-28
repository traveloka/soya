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
import WebpackCompiler from '../compiler/webpack/WebpackCompiler.js';
import { DEFAULT_FRAMEWORK_CONFIG } from '../defaultFrameworkConfig.js';
import Application from '../Application.js';

// These dependencies can all be overwritten by user.
import defaultRegisterRouterNodes from './registerRouterNodes.js';
import defaultCreateLogger from './createLogger.js';
import defaultCreateErrorHandler from './createErrorHandler.js';

/**
 * @param {Object} config
 * @param {Routes} routes
 * @SERVER
 */
export default function server(config, routes) {
  var frameworkConfig = config.frameworkConfig;
  var serverConfig = config.serverConfig;
  var clientConfig = config.clientConfig;
  frameworkConfig = Object.assign({}, DEFAULT_FRAMEWORK_CONFIG, frameworkConfig);
  frameworkConfig.absolutePageRequirePath = path.join(frameworkConfig.absoluteProjectDir, 'src/pages');
  frameworkConfig.absoluteComponentRequirePath = path.join(frameworkConfig.absoluteProjectDir, 'src/components');

  var createLogger = defaultCreateLogger;
  var createErrorHandler = defaultCreateErrorHandler;
  var registerRouterNodes = defaultRegisterRouterNodes;

  // Load custom logger and error handler factory.
  // TODO: Fix the way we get customized logger, error handler, and router node registration.
  if (typeof frameworkConfig.loggerFactoryFunction == 'function') {
    createLogger = frameworkConfig.loggerFactoryFunction;
  }
  if (typeof frameworkConfig.errorHandlerFactoryFunction == 'function') {
    createErrorHandler = frameworkConfig.errorHandlerFactorFunction;
  }
  if (typeof frameworkConfig.routerNodeRegistrationFunction == 'function') {
    if (!frameworkConfig.routerNodeRegistrationAbsolutePath) {
      throw new Error('You must set both routerNodeRegistrationFunction and routerNodeRegistrationFilePath to register your custom router nodes.');
    }
    registerRouterNodes = frameworkConfig.routerNodeRegistrationFunction;
  }

  var logger = createLogger(serverConfig);
  var errorHandler = createErrorHandler(serverConfig, logger);
  var nodeFactory = new NodeFactory();

  // Register default nodes for router.
  nodeFactory.registerNodeType(DomainNode);
  nodeFactory.registerNodeType(MethodNode);
  nodeFactory.registerNodeType(PathNode);

  // Load custom router nodes and create router.
  registerRouterNodes(nodeFactory);
  var router = new Router(logger, nodeFactory);
  var reverseRouter = new ReverseRouter(nodeFactory);

  // Load routes.
  routes.register(router, reverseRouter);

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

  var application = new Application(
    logger, routes, router, reverseRouter, errorHandler, compiler,
    frameworkConfig, serverConfig, clientConfig
  );
  application.start();
}