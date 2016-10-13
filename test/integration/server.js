/**
 * SERVER
 *
 * Main entry file for server application.
 *
 * @SERVER
 */

import server from 'soya/lib/server';
import config from '../../config.js';

import TestList from '../../src/pages/landing/TestList/TestList.js';
import NotFound from '../../src/pages/system/NotFound/NotFound.js';
import LoadComponent from '../../src/pages/compile/LoadComponent/LoadComponent.js';

// // Haven't found a better way to do this yet. So for now, consider page and
// // component directory as non configurable for now.
// // TODO: Separate compilation and actual framework config so that these lines can be configurable from config.js.
// var frameworkConfig = config.frameworkConfig;
// frameworkConfig.absolutePageRequirePath = path.join(frameworkConfig.absoluteProjectDir, 'src/pages');
// frameworkConfig.absoluteComponentRequirePath = path.join(frameworkConfig.absoluteProjectDir, 'src/components');
//
// // Can't place these lines in config since config is run both by our server.js
// // and webpack configuration file. When we first compile for server-side, we
// // don't yet have webpack's require.context. Webpack's dynamic require also
// // requires that we use string literal instead of variables since it does its
// // magic by parsing the arguments.
// // The reason we need to use context is because pages are dynamically referenced
// // using a YAML configuration. Since there are no direct require() call, we'd
// // have to load all pages and all components dynamically using webpack's dynamic
// // require.
// // More info: https://webpack.github.io/docs/context.html
// frameworkConfig.pageRequireContext = require.context('./src/pages', true, /\.js$/);
// frameworkConfig.componentRequireContext = require.context('./src/components', true, /\.js$/);
//
// // Also haven't found a better way to do load custom logger, error handler,
// // and node registration. We need to explicitly require them so that webpack
// // can add it to the server bundle. Consider these as non configurable for now.
// var replacementContext = require.context('./', false, /(nodes|error|logger)\.js$/);
// var nodeRegistrationAbsPath = path.join(frameworkConfig.absoluteProjectDir, './nodes.js');
// var foundArray = replacementContext.keys();
// if (foundArray.indexOf('./error.js') > -1) {
//   frameworkConfig.errorHandlerFactoryFunction = replacementContext('./error.js');
// }
// if (foundArray.indexOf('./logger.js') > -1) {
//   frameworkConfig.errorHandlerFactoryFunction = replacementContext('./logger.js');
// }
// if (foundArray.indexOf('./nodes.js') > -1) {
//   frameworkConfig.routerNodeRegistrationFunction = replacementContext('./nodes.js');
//   frameworkConfig.routerNodeRegistrationAbsolutePath = nodeRegistrationAbsPath;
// }

var pages = {
  'src/pages/landing/TestList/TestList.js': TestList,
  'src/pages/system/NotFound/NotFound.js': NotFound,
  'src/pages/compile/LoadComponent/LoadComponent.js': LoadComponent
};

var components = {
  'test': {
    'PhotoCaption': {
      'thumbnail': 'src/components/common/PhotoCaption/PhotoCaptionThumbView.js',
      'test': null,
      'detail': {
        "vendor": "Test",
        "name": "PhotoCaption",
        "author": "ricky@traveloka.com",
        "thumbnail": "./PhotoCaptionThumbView.js"
      }
    }
  }
};

// Run server.
server(config, pages, components);