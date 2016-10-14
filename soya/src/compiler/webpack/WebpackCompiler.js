import Compiler from '../Compiler';
import CompileResult from '../CompileResult';
import EntryPoint from '../../EntryPoint';
import WebpackAssetServer from './WebpackAssetServer';
import { DEFAULT_FRAMEWORK_CONFIG } from '../../defaultFrameworkConfig.js';

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var COMMONS_ENTRY_NAME = '__commons';
var ExtractTextPlugin  = require("extract-text-webpack-plugin");

const SOURCE_MAP_FILE_REGEX = /\.[a-zA-Z0-9]{1,4}\.map/;
const CSS_FILE_REGEX = /\.css[\?#]?/;
const JS_FILE_REGEX = /\.js[\?#]?/;

/**
 * @SERVER
 */
export default class WebpackCompiler extends Compiler {
  /**
   * @type {{[key: string]: any}}
   */
  _frameworkConfig;

  /**
   * @type {string}
   */
  _absoluteClientBuildDir;

  /**
   * @type {string}
   */
  _assetHostPath;

  /**
   * @type {{[key: string]: string}}
   */
  _clientReplace;

  /**
   * @type {Array<Function>}
   */
  _clientResolve;

  /**
   * @type {WebpackAssetServer}
   */
  _assetServer;

  /**
   * @type {any}
   */
  _react;

  /**
   * @type {any}
   */
  _webpack;

  /**
   * @type {Logger}
   */
  _logger;

  /**
   * @type {?Function}
   */
  _webpackDevMiddleware;

  /**
   * @type {?Function}
   */
  _webpackHotMiddleware;

  /**
   * @type {boolean}
   */
  _firstCompileDone;

  /**
   * @param {Logger} logger
   * @param {Object} frameworkConfig
   * @param {any} webpack
   * @param {any} react
   * @param {Function} webpackDevMiddleware
   * @param {Function} webpackHotMiddleware
   */
  constructor(logger, frameworkConfig, webpack, react,
              webpackDevMiddleware, webpackHotMiddleware) {
    super();
    this._logger = logger;
    this._react = react;
    this._webpack = webpack;
    this._webpackDevMiddleware = webpackDevMiddleware;
    this._webpackHotMiddleware = webpackHotMiddleware;
    this._frameworkConfig = frameworkConfig;
    this._clientReplace = frameworkConfig.clientReplace;
    this._clientResolve = frameworkConfig.clientResolve;
    this._absoluteClientBuildDir = path.join(frameworkConfig.absoluteProjectDir, 'build/client');
    this._assetHostPath = frameworkConfig.assetHostPath;
    this._assetServer = new WebpackAssetServer(this._assetHostPath, this._absoluteClientBuildDir, logger);
    this._firstCompileDone = false;

    if (this._frameworkConfig.hotReload && (!webpackDevMiddleware || !webpackHotMiddleware)) {
      throw new Error('Hot reload flag is true, yet webpack dev/hot middleware is not passed to WebpackCompiler.');
    }

    this._cleanTempDir();
  }

  /**
   * @param {any} webpack
   * @param {Object} frameworkConfig
   * @returns {Object}
   */
  static createServerBuildConfig(webpack, frameworkConfig) {
    frameworkConfig = Object.assign({}, DEFAULT_FRAMEWORK_CONFIG, frameworkConfig);
    var nodeModules = {};
    var absProjectDir = frameworkConfig.absoluteProjectDir;
    var absEntryPointFile = path.join(frameworkConfig.absoluteProjectDir, 'build/precompile/server.js');
    var absBuildTargetDir = path.join(frameworkConfig.absoluteProjectDir, 'build/server');
    fs.readdirSync(path.join(absProjectDir, 'node_modules'))
      .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
      })
      .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
      });

    return {
      entry: absEntryPointFile,
      target: 'node',
      output: {
        path: absBuildTargetDir,
        publicPath: frameworkConfig.assetProtocol + '://' + frameworkConfig.assetHostPath,
        filename: 'index.js'
      },
      node: {
        __dirname: true,
        __filename: true
      },
      devtool: 'source-map',
      module: {
        loaders: [
          WebpackCompiler.getBabelLoaderConfig(),
          WebpackCompiler.getFileLoaderConfig(frameworkConfig),
          { test: /\.css$/, loader: 'css-loader', exclude: /\.mod\.css/ },
          { test: /\.mod\.css$/, loader: 'css-loader?sourceMap&modules' },
          { test: /\.scss$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader'), exclude: /\.mod\.scss/ },
          { test: /\.mod\.scss$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap&modules!sass-loader') },
        ]
      },
      plugins: [
        new webpack.BannerPlugin('require("source-map-support").install();',
          { raw: true, entryOnly: false }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin('css/[name]-[contenthash].css')
      ],
      resolve: WebpackCompiler.generateResolveConfig(frameworkConfig),
      externals: nodeModules
    };
  }

  static generateResolveConfig(frameworkConfig) {
    return {
      alias: {},
      root: [
        frameworkConfig.absoluteProjectDir
      ]
    }
  }

  /**
   * @return {Object}
   */
  static getBabelLoaderConfig() {
    var result = {
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel',
      query: {
        optional: ['runtime', 'es7.decorators'],
        blacklist: [],
        retainLines: true,
        comments: false
      }
    };
    return result;
  };

  /**
   * Only called at client side. Adds babel plugins like react-transform and
   * client resolve operations.
   *
   * @param {Object<string, boolean>} entryPointAbsolutePathMap
   * @return {Object}
   */
  getBabelLoaderExtras(entryPointAbsolutePathMap) {
    var result = {
      plugins: [],
      extra: {}
    };

    if (this._frameworkConfig.hotReload) {
      result.plugins.push({
        transformer: this._createHotModuleAcceptPlugin(entryPointAbsolutePathMap, this._frameworkConfig),
        position: 'before'
      });
    }

    result.plugins.push({
      transformer: this._createResolvePlugin(),
      position: 'after'
    });

    if (this._frameworkConfig.hotReload) {
      result.plugins.push('react-transform');
      result.extra['react-transform'] = {
        transforms: [
          //{
          //  'transform': 'react-transform-hmr',
          //  'imports': ['react'],
          //  'locals':  ['module']
          //},
          //{
          //  'transform': 'react-transform-catch-errors',
          //  'imports': ['react', 'redbox-react']
          //}
        ]
      };
    }
    return result;
  }

  static getFileLoaderConfig(config) {
    var test;
    if (config.staticAssetRegex) {
      test = config.staticAssetRegex;
    } else {
      test = /(\.jpg|\.png|\.jpeg|\.gif|\.ico|\.(eot|ttf|svg|woff(2)?)(\??#[a-zA-Z0-9]+)?)$/;
    }
    return {
      test: test,
      loader: "file-loader?name=[name]-[hash].[ext]"
    };
  }

  /**
   * 1) Create configuration with one common file for webpack.
   * 2) Compile webpack from source to temporary location, with CSS loader
   *    and file loader.
   * 3) Read all files to AssetServer - AssetServer could just read the
   *    files, but cache everything.
   *
   *    TODO: Make babel optional
   *    TODO: Allow user setting of loaders.
   *
   * @param {Array<EntryPoint>} entryPoints
   * @param {Function} updateCompileResultCallback
   * @return {Array<Function>}
   */
  run(entryPoints, updateCompileResultCallback) {
    var i, j, entryPoint, entryPointList = [];
    var configuration = {
      entry: {},
      output: {
        path: this._absoluteClientBuildDir,
        filename: "[name]-[chunkhash].js",
        publicPath: this._frameworkConfig.assetProtocol + '://' + this._assetHostPath
      },
      module: {
        loaders: [
          WebpackCompiler.getBabelLoaderConfig(),
          WebpackCompiler.getFileLoaderConfig(this._frameworkConfig)
        ],
        noParse: /node_modules\/quill\/dist/
      },
      devtool: "source-map",
      resolve: WebpackCompiler.generateResolveConfig(this._frameworkConfig),
      plugins: [
        new this._webpack.optimize.OccurenceOrderPlugin()
      ]
    };

    // Links you need to read to understand this CSS section:
    // - https://webpack.github.io/docs/stylesheets.html
    // - https://github.com/webpack/extract-text-webpack-plugin
    // - https://webpack.github.io/docs/list-of-plugins.html
    // - https://github.com/webpack/css-loader
    // - https://github.com/webpack/style-loader
    var modulesCssLoader = {
      test: /\.mod\.css$/,
      loader: 'style-loader!css-loader?sourceMap&modules'
    };
    var normalCssLoader = {
      test: /\.css$/,
      loader: 'style-loader!css-loader',
      exclude: /\.mod\.css$/
    };
    var modulesScssLoader = {
      test: /\.mod\.scss$/,
      loader: 'style-loader!css-loader?sourceMap&modules!sass-loader'
    };
    var normalSassLoader = {
      test: /\.scss$/,
      loader: 'style-loader!css-loader!sass-loader',
      exclude: /\.mod\.scss$/
    };
    if (!this._frameworkConfig.hotReload) {
      // Enable loading CSS as files.
      modulesCssLoader.loader = ExtractTextPlugin.extract(
        "style-loader",
        "css-loader?sourceMap&modules"
      );
      normalCssLoader.loader = ExtractTextPlugin.extract(
        "style-loader",
        "css-loader"
      );
      modulesScssLoader.loader = ExtractTextPlugin.extract(
        "style-loader",
        "css-loader?sourceMap&modules!sass-loader"
      );
      normalSassLoader.loader = ExtractTextPlugin.extract(
        "style-loader",
        "css-loader!sass-loader"
      );
      configuration.plugins.push(
        new ExtractTextPlugin('css/[name]-[chunkhash].css'));
    }
    configuration.module.loaders.push(modulesCssLoader);
    configuration.module.loaders.push(normalCssLoader);
    configuration.module.loaders.push(modulesScssLoader);
    configuration.module.loaders.push(normalSassLoader);

    for (i in this._clientReplace) {
      if (!this._clientReplace.hasOwnProperty(i)) continue;
      configuration.resolve.alias[i] = this._clientReplace[i];
    }

    if (this._frameworkConfig.hotReload) {
      configuration.plugins.push(new this._webpack.HotModuleReplacementPlugin());
    }

    configuration.plugins.push(new this._webpack.NoErrorsPlugin());
    configuration.plugins.push(new this._webpack.optimize.CommonsChunkPlugin({
      name: COMMONS_ENTRY_NAME,
      filename: 'common-[hash].js',
      minChunks: this._frameworkConfig.commonFileThreshold
    }));

    if (this._frameworkConfig.minifyJs) {
      configuration.plugins.push(new this._webpack.optimize.UglifyJsPlugin({}));
    }

    // Accept env var
    const definePlugin = new this._webpack.DefinePlugin({
      'process.env.NODE_ENV': this._frameworkConfig.NODE_ENV || '"development"'
    });
    configuration.plugins.push(definePlugin);

    var pageToRequire, entryPointAbsolutePathMap = {};
    for (i = 0; i < entryPoints.length; i++) {
      entryPoint = entryPoints[i];
      pageToRequire = path.join(entryPoint.absolutePath);
      entryPointAbsolutePathMap[pageToRequire] = true;
      configuration.entry[entryPoint.name] = pageToRequire;
      entryPointList.push(entryPoint.name);
    }

    // Add babel plugins.
    configuration.babel = this.getBabelLoaderExtras(entryPointAbsolutePathMap);

    var compiler = this._webpack(configuration);
    var self = this;

    compiler.plugin('done', (stats) => {
      if (stats.compilation.errors.length > 0) {
        // Error occured. Print error messages.
        this._printErrorMessages(stats);
        return;
      }

      var key;
      for (key in entryPointAbsolutePathMap) {
        if (!entryPointAbsolutePathMap.hasOwnProperty(key)) continue;
        entryPointAbsolutePathMap[key] = true;
      }

      var i, chunkMap = {};
      for (i = 0; i < stats.compilation.chunks.length; i++) {
        chunkMap[stats.compilation.chunks[i].name] = stats.compilation.chunks[i];
      }
      var commonsChunk = chunkMap[COMMONS_ENTRY_NAME];

      var compileResult = new CompileResult(), entryPointChunk, entryPointName,
          pageDep, depArray;
      for (i = 0; i < entryPointList.length; i++) {
        entryPointName = entryPointList[i];
        if (!chunkMap.hasOwnProperty(entryPointName)) {
          var error = new Error('Unable to determine dependency, entry point ' + entryPointName + ' does not have webpack chunk!');
          if (this._firstCompileDone) {
            // If this is a webpack hot reload compilation, don't throw the
            // error, just log to the user.
            this._logger.error('Hot reload ->', error);
            return;
          }
          throw error;
        }
        entryPointChunk = chunkMap[entryPointName];

        pageDep = {
          cssDependencies: [],
          jsDependencies: []
        };

        for (j = 0; j < commonsChunk.files.length; j++) {
          if (SOURCE_MAP_FILE_REGEX.test(commonsChunk.files[j])) continue;
          depArray = CSS_FILE_REGEX.test(commonsChunk.files[j]) ? pageDep.cssDependencies : pageDep.jsDependencies;
          depArray.push(self._assetServer.toUrlWithProtocol(
            commonsChunk.files[j], this._frameworkConfig.assetProtocol
          ));
        }
        for (j = 0; j < entryPointChunk.files.length; j++) {
          if (SOURCE_MAP_FILE_REGEX.test(entryPointChunk.files[j])) continue;
          depArray = CSS_FILE_REGEX.test(entryPointChunk.files[j]) ? pageDep.cssDependencies : pageDep.jsDependencies;
          depArray.push(self._assetServer.toUrlWithProtocol(
            entryPointChunk.files[j], this._frameworkConfig.assetProtocol
          ));
        }

        compileResult.pages[entryPointName] = pageDep;
      }

      // Sets the flag, we have completed the very first compilation. Next
      // compilation error should not trigger errors.
      this._firstCompileDone = true;

      updateCompileResultCallback(compileResult);
    });

    compiler.plugin('failed', (err) => {
      // Error ocurred. Print error messages.
      this._printErrorMessages(err);
    });

    var middlewares = [];

    if (this._frameworkConfig.hotReload) {
      // Let webpack-dev-middleware handles watching, storing output and serving
      // asset requests. Meanwhile, webpack hot middleware should be accepting
      // connection from the client.
      middlewares.push(this._webpackDevMiddleware(compiler, {
        noInfo: true,
        publicPath: configuration.output.publicPath
      }));
      middlewares.push(this._webpackHotMiddleware(compiler));
    } else {
      // Middleware for regular webpack asset server.
      middlewares.push((request, response, next) => {
        var handledByAssetServer = this._assetServer.handle(request, response);
        if (!handledByAssetServer) {
          next();
        }
      });

      // We only need to run if we are not hot reloading, since
      // webpack-dev-middleware already runs watch() for us.
      compiler.run(function() {
        // No-op. We'll use the above 'done' and 'failed' hook to notify
        // application for successes and failures.
      });
    }

    return middlewares;
  }

  _cleanTempDir() {
    // Remove everything in the directory.
    rimraf.sync(this._absoluteClientBuildDir);

    // Ensure directory exists.
    try {
      fs.mkdirSync(this._absoluteClientBuildDir);
    } catch(e) {
      if (e.code != 'EEXIST') throw e;
    }
  }

  /**
   * @param {any} stats
   */
  _printErrorMessages(stats) {
    if (this._firstCompileDone) {
      // Second compilation is only done when we are using hot reload.
      // We should not stop the server if an exception happens.
      return;
    }
    var error = new Error('Webpack compilation error!');
    this._logger.error('Webpack compilation error -> ', error, [stats.compilation.errors]);
    throw error;
  }


  _createResolvePlugin() {
    var self = this;
    return function({ Plugin, types: t }) {
      return new Plugin("soya-resolve-plugin", {
        visitor: {
          CallExpression(node, parent) {
            if (t.isIdentifier(node.callee, { name: "require" })) {
              var requireValue = node.arguments[0].value;
              if (self._clientResolve) {
                var i, resolved;
                for (i = 0; i < self._clientResolve.length; i++) {
                  // TODO: Pass also the absolute path of currently parsed file.
                  resolved = self._clientResolve[i](requireValue);
                  if (resolved != null) {
                    node.arguments[0].value = resolved;
                    return;
                  }
                }
              }
            }
          }
        }
      });
    };
  }

  /**
   * @param {Object} frameworkConfig
   * @param {Object<string, boolean>} entryPointAbsolutePathMap
   */
  _createHotModuleAcceptPlugin(entryPointAbsolutePathMap, frameworkConfig) {
    var self = this;
    return function({ Plugin, types: t }) {
      return new Plugin("soya-hot-module-accept-plugin", {
        visitor: {
          ClassDeclaration(node, parent) {
            var curFilePath;
            if (frameworkConfig.hotReload) {
              curFilePath = this.scope.hub.file.opts.filename;
              if (entryPointAbsolutePathMap[curFilePath]) {
                entryPointAbsolutePathMap[curFilePath] = false;
                this.insertAfter([
                  t.ifStatement(
                    t.memberExpression(t.identifier('module'), t.identifier('hot')),
                    t.blockStatement([
                      t.expressionStatement(t.callExpression(
                        t.memberExpression(t.memberExpression(t.identifier('module'), t.identifier('hot')), t.identifier('accept')),
                        [
                          t.functionExpression(null, [], t.blockStatement([
                            t.expressionStatement(t.callExpression(
                              t.memberExpression(t.identifier('console'), t.identifier('error')),
                              [t.literal('Unable to accept hot reload module!'), t.identifier('arguments')]
                            ))
                          ]))
                        ]
                      ))
                    ])
                  )
                ]);
              }
            }
          }
        }
      });
    };
  }
}