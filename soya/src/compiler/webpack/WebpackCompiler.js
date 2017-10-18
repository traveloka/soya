import Compiler from '../Compiler';
import CompileResult from '../CompileResult';
import EntryPoint from '../../EntryPoint';
import WebpackAssetServer from './WebpackAssetServer';
import { DEFAULT_FRAMEWORK_CONFIG } from '../../defaultFrameworkConfig.js';

import config from 'config';
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';

var COMMONS_ENTRY_NAME = '__commons';

const SOURCE_MAP_FILE_REGEX = /\.[a-zA-Z0-9]{1,4}\.map/;
const CSS_FILE_REGEX = /\.css[\?#]?/;
const JS_FILE_REGEX = /\.js[\?#]?/;
const soyaNodeModulesDir = path.join(__dirname, '..', '..', '..', 'node_modules');
const routerNodeRegistrationAbsolutePath = path.join(__dirname, '..', '..', 'server', 'registerRouterNodes.js');
const browserConfigJs = path.join(__dirname, '..', '..', 'config', 'browser.js');

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

    // Only clean client build dir when precompileClient is not true
    if (!this._frameworkConfig.precompileClient) {
      this._cleanTempDir();
    }

    // This will take the config based on the current NODE_ENV and save it to 'node_modules/lib/config/browser-config.json'
    fs.writeFileSync(path.resolve(__dirname, '../../config/browser-config.json'), JSON.stringify(config))
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

    var resolve = WebpackCompiler.generateResolveConfig(frameworkConfig);

    return {
      entry: absEntryPointFile,
      target: 'node',
      output: {
        path: absBuildTargetDir,
        publicPath: frameworkConfig.assetProtocol + '://' + frameworkConfig.assetHostPath,
        filename: 'index.js',
        library: "SoyaV1",
        libraryTarget: "commonjs2"
      },
      node: {
        __dirname: true,
        __filename: true
      },
      devtool: 'source-map',
      module: {
        rules: [
          WebpackCompiler.getBabelLoaderConfig(),
          WebpackCompiler.getFileLoaderConfig(frameworkConfig),
          {
            test: /\.css$/,
            loader: 'css-loader/locals',
            exclude: /\.mod\.css$/,
          },
          {
            test: /\.mod\.css$/,
            loader: 'css-loader/locals',
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: frameworkConfig.debug ? '[name]_[local]_[hash:base64:3]' : '[hash:base64]',
            },
          },
          {
            test: /\.scss$/,
            use: [
              {
                loader: 'css-loader/locals',
                options: {
                  importLoaders: 1,
                },
              },
              'sass-loader',
            ],
            exclude: /\.mod\.scss$/,
          },
          {
            test: /\.mod\.scss$/,
            use: [
              {
                loader: 'css-loader/locals',
                options: {
                  sourceMap: true,
                  modules: true,
                  localIdentName: frameworkConfig.debug ? '[name]_[local]_[hash:base64:3]' : '[hash:base64]',
                  importLoaders: 1,
                },
              },
              'sass-loader',
            ],
          }
        ]
      },
      plugins: [
        new webpack.BannerPlugin({
          banner: 'require("source-map-support").install();',
          raw: true,
          entryOnly: false
        }),
        new webpack.NoEmitOnErrorsPlugin()
      ],
      resolve: resolve,
      resolveLoader: {
        modules: [
          soyaNodeModulesDir,
          'node_modules',
        ],
      },
      externals: nodeModules
    };
  }

  static generateResolveConfig(frameworkConfig) {
    let {
      absoluteProjectDir,
      defaultImportBase
    } = frameworkConfig;

    if (defaultImportBase) {
      defaultImportBase = path.resolve(absoluteProjectDir, defaultImportBase);
    }

    // Removes undefined config if any
    const rootResolves = [
      absoluteProjectDir,
      defaultImportBase
    ].filter((config) => !!config);

    const alias = {
      'config': browserConfigJs,
      'soya/lib/server/registerRouterNodes': routerNodeRegistrationAbsolutePath,
    };
    if (frameworkConfig.routerNodeRegistrationAbsolutePath) {
      alias['soya/lib/server/registerRouterNodes'] = frameworkConfig.routerNodeRegistrationAbsolutePath;
    }

    return {
      alias,
      modules: [
        soyaNodeModulesDir,
        'node_modules',
        ...rootResolves,
      ],
    };
  }

  /**
   * @return {Object}
   */
  static getBabelLoaderConfig() {
    var result = {
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader'
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
      plugins: []
    };

    if (this._frameworkConfig.hotReload) {
      result.plugins.push([
        'soya/lib/compiler/webpack/hotModuleAcceptPlugin.js', {
          hotReload: this._frameworkConfig.hotReload,
          entryPointAbsolutePathMap: entryPointAbsolutePathMap
        }
      ]);
    }

    // Plugin no longer working, since Babel 6 runs plugins before presets.
    // result.plugins.push(['./hotModuleAcceptPlugin.js', {
    //  clientResolve: this._clientResolve
    // }]);

    if (this._frameworkConfig.hotReload) {
      // result.plugins.push('react-transform');
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
      loader: 'file-loader',
      options: {
        name: '[name]-[hash].[ext]',
      },
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
  run(entryPoints, updateCompileResultCallback, shouldCompile = true) {
    var i,
      j,
      entryPoint,
      entryPointList = [];
    var configuration = {
      entry: {},
      output: {
        path: this._absoluteClientBuildDir,
        filename: "[name]-[chunkhash].js",
        publicPath: this._frameworkConfig.assetProtocol + '://' + this._assetHostPath
      },
      module: {
        rules: [
          WebpackCompiler.getBabelLoaderConfig(),
          WebpackCompiler.getFileLoaderConfig(this._frameworkConfig)
        ],
        noParse: /node_modules\/quill\/dist/
      },
      devtool: "source-map",
      resolve: WebpackCompiler.generateResolveConfig(this._frameworkConfig),
      resolveLoader: {
        modules: [
          soyaNodeModulesDir,
          'node_modules',
        ],
      },
      plugins: [
        new this._webpack.optimize.OccurrenceOrderPlugin()
      ]
    };

    var cssModuleArgs = {
      sourceMap: true,
      modules: true,
      localIdentName: this._frameworkConfig.debug ? '[name]_[local]_[hash:base64:3]' : '[hash:base64]',
    };

    // Links you need to read to understand this CSS section:
    // - https://webpack.github.io/docs/stylesheets.html
    // - https://github.com/webpack/extract-text-webpack-plugin
    // - https://webpack.github.io/docs/list-of-plugins.html
    // - https://github.com/webpack/css-loader
    // - https://github.com/webpack/style-loader
    var modulesCssLoader = {
      test: /\.mod\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: cssModuleArgs,
        },
      ],
    };
    var normalCssLoader = {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
      ],
      exclude: /\.mod\.css$/
    };
    var modulesScssLoader = {
      test: /\.mod\.scss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            ...cssModuleArgs,
            importLoaders: 1,
          },
        },
        'sass-loader',
      ],
    };
    var normalSassLoader = {
      test: /\.scss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        },
        'sass-loader',
      ],
      exclude: /\.mod\.scss$/
    };
    if (!this._frameworkConfig.hotReload) {
      // Enable loading CSS as files.
      modulesCssLoader.use = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: {
          loader: 'css-loader',
          options: cssModuleArgs,
        },
      });
      normalCssLoader.use = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: {
          loader: 'css-loader',
        },
      });
      modulesScssLoader.use = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            options: {
              ...cssModuleArgs,
              importLoaders: 1,
            },
          },
          'sass-loader',
        ],
      });
      normalSassLoader.use = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'sass-loader',
        ],
      });
      configuration.plugins.push(
        new ExtractTextPlugin('css/[name]-[chunkhash].css'));
    } else if (this._frameworkConfig.useStyledModules) {
      modulesCssLoader = {
        test: /\.mod\.css$/,
        use: [
          'styled-modules/loader',
          {
            loader: 'css-loader',
            options: cssModuleArgs,
          },
        ],
      };
      normalCssLoader = {
        test: /\.css$/,
        use: [
          'styled-modules/loader',
          'css-loader',
        ],
        exclude: /\.mod\.css$/
      };
      modulesScssLoader = {
        test: /\.mod\.scss$/,
        use: [
          'styled-modules/loader',
          {
            loader: 'css-loader',
            options: {
              ...cssModuleArgs,
              importLoaders: 1,
            },
          },
          'sass-loader',
        ],
      };
      normalSassLoader = {
        test: /\.scss$/,
        use: [
          'styled-modules/loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'sass-loader',
        ],
        exclude: /\.mod\.scss$/
      };
    }
    configuration.module.rules.push(modulesCssLoader);
    configuration.module.rules.push(normalCssLoader);
    configuration.module.rules.push(modulesScssLoader);
    configuration.module.rules.push(normalSassLoader);

    for (i in this._clientReplace) {
      configuration.resolve.alias[i] = this._clientReplace[i];
    }

    if (this._frameworkConfig.hotReload) {
      configuration.plugins.push(new this._webpack.HotModuleReplacementPlugin());
    }

    configuration.plugins.push(new this._webpack.NoEmitOnErrorsPlugin());
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
    configuration.plugins.push(new FriendlyErrorsWebpackPlugin());

    var pageToRequire, entryPointAbsolutePathMap = {};
    for (i = 0; i < entryPoints.length; i++) {
      entryPoint = entryPoints[i];
      pageToRequire = path.join(entryPoint.absolutePath);
      entryPointAbsolutePathMap[pageToRequire] = true;
      configuration.entry[entryPoint.name] = pageToRequire;
      entryPointList.push(entryPoint.name);
    }

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
        quiet: true,
        publicPath: configuration.output.publicPath
      }));
      middlewares.push(this._webpackHotMiddleware(compiler, { log: false }));
    } else {
      // Middleware for regular webpack asset server.
      middlewares.push((request, response, next) => {
        var handledByAssetServer = this._assetServer.handle(request, response);
        if (!handledByAssetServer) {
          next();
        }
      });

      // Shouldn't be called on start when client code already precompiled
      if (shouldCompile) {
        // We only need to run if we are not hot reloading, since
        // webpack-dev-middleware already runs watch() for us.
        compiler.run(function() {
          // No-op. We'll use the above 'done' and 'failed' hook to notify
          // application for successes and failures.
        });
      }
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

        }
      });
    };
  }
}
