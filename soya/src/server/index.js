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
import ComponentFinder from '../ComponentFinder.js';
import PageFinder from '../PageFinder.js';
import WebpackCompiler from '../compiler/webpack/WebpackCompiler.js';
import { DEFAULT_FRAMEWORK_CONFIG } from '../defaultFrameworkConfig.js';
import Application from '../Application.js';

// These dependencies can all be overwritten by user.
import defaultRegisterRouterNodes from './registerRouterNodes.js';
import defaultCreateLogger from './createLogger.js';
import defaultCreateErrorHandler from './createErrorHandler.js';

/**
 * @param {Object} config
 * @SERVER
 */
export default function server(config) {
  var frameworkConfig = config.frameworkConfig;
  var serverConfig = config.serverConfig;
  var clientConfig = config.clientConfig;
  frameworkConfig = Object.assign({}, DEFAULT_FRAMEWORK_CONFIG, frameworkConfig);

  var createLogger = defaultCreateLogger;
  var createErrorHandler = defaultCreateErrorHandler;
  var registerRouterNodes = defaultRegisterRouterNodes;

  // Load custom logger and error handler factory.
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

  // Do component registration.
  var register = new ComponentRegister(logger);
  var componentFinder = new ComponentFinder(logger);
  var pageFinder = new PageFinder(logger);
  var pageRequireContext = frameworkConfig.pageRequireContext;
  var componentRequireContext = frameworkConfig.componentRequireContext;
  var pageRequirePath = frameworkConfig.absolutePageRequirePath;
  var componentRequirePath = frameworkConfig.absoluteComponentRequirePath;

  componentFinder.find(componentRequirePath, function(vendor, name, absDir, relativeDir) {
    register.regComponent(vendor, name, absDir, componentRequireContext('./' + path.join('./', relativeDir, name + '.js')))
  });

  pageFinder.find(pageRequirePath, function(vendor, name, absDir, relativeDir) {
    register.regPage(name, absDir, pageRequireContext('./' + path.join(relativeDir, name + '.js')));
  });

  // Register default nodes for router.
  nodeFactory.registerNodeType(DomainNode);
  nodeFactory.registerNodeType(MethodNode);
  nodeFactory.registerNodeType(PathNode);

  // Load custom router nodes and create router.
  registerRouterNodes(nodeFactory);
  var router = new Router(logger, nodeFactory, register);
  var reverseRouter = new ReverseRouter(nodeFactory);

  // Load routes.
  var routes = yaml.safeLoad(fs.readFileSync(frameworkConfig.routesFilePath, 'utf8'));
  var routeId;
  for (routeId in routes) {
    if (!routes.hasOwnProperty(routeId)) continue;
    router.reg(routeId, routes[routeId]);
    reverseRouter.reg(routeId, routes[routeId]);
  }

  // If not found page is not set up.
  if (!router.getNotFoundRouteResult()) {
    throw new Error('404 not found page not registered! Please create a 404 not found page.');
  }

  // Load websocket routes.
  var websocketOption = null;

  if (frameworkConfig.webSocket.enabled === true) {
    var wsComponentRegister = new ComponentRegister(logger);
    var wsPageRequireContext = frameworkConfig.webSocketPageRequireContext;
    var wsPageRequirePath = frameworkConfig.webSocketAbsolutePageRequirePath;

    finder.find(wsPageRequirePath, function(vendor, name, absDir, relativeDir) {
      wsComponentRegister.regPage(name, absDir, wsPageRequireContext('./' + path.join(relativeDir, name + '.js')));
    });

    // Load custom router nodes and create router.
    var wsRouter = new Router(logger, nodeFactory, wsComponentRegister);
    var wsReverseRouter = new ReverseRouter(nodeFactory);

    // Load routes.
    var wsRoutes = yaml.safeLoad(fs.readFileSync(frameworkConfig.webSocketRoutesFilePath, 'utf8'));
    var wsRouteId;

    for (wsRouteId in wsRoutes) {
      if (!wsRoutes.hasOwnProperty(wsRouteId)) continue;
      wsRouter.reg(wsRouteId, wsRoutes[wsRouteId]);
      wsReverseRouter.reg(wsRouteId, wsRoutes[wsRouteId]);
    }

    // If not found page is not set up.
    if (!router.getNotFoundRouteResult()) {
      throw new Error('404 not found page not registered! Please create a 404 not found page.');
    }

    websocketOption = {
      componentRegister: wsComponentRegister,
      routes: wsRoutes,
      router: wsRouter,
      reverseRouter: wsReverseRouter
    };
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
    logger, register, routes, router, reverseRouter, errorHandler, compiler,
    frameworkConfig, serverConfig, clientConfig, websocketOption
  );
  application.start();
}