import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import ComponentFinder from '../ComponentFinder.js';
import generateServerFile from './generateServerFile.js';
import generateListPage from './generateListPage.js';
import { DEFAULT_FRAMEWORK_CONFIG } from '../defaultFrameworkConfig.js';

var BUILD_RELATIVE_DIR = 'build';
var PRECOMPILE_RELATIVE_DIR = 'build/precompile';
var SERVER_FILE = 'server.js';
var CMPT_BROWSER_LIST_PAGE = 'CmptBrowserListPage.js';

/**
 * Does pre-compilation routine:
 *
 * 1. Generates list of pages defined in the routes file.
 * 2. Generates list of components for component browser.
 * 3. Generates server.js file that imports all pages defined in routes file.
 * 4. Generates component browser search page.
 * 5. Generates component browser detail page.
 *
 * Step number 2, 4, and 5 are only executed when componentBrowser is on.
 *
 * @SERVER
 */
export default class Precompiler {
  _frameworkConfig;

  constructor(frameworkConfig) {
    this._frameworkConfig = Object.assign({}, DEFAULT_FRAMEWORK_CONFIG, frameworkConfig);
  }

  precompile() {
    var pages = this.generatePageList();
    var components = this.generateComponentList();
    var buildDir = Precompiler.getBuildDir(this._frameworkConfig);
    var precompileDir = Precompiler.getPrecompileDir(this._frameworkConfig);
    Precompiler.cleanDir(buildDir);
    Precompiler.cleanDir(precompileDir);

    if (this._frameworkConfig.componentBrowser) {
      var listFilePath = Precompiler.getCmptBrowserListPagePath(this._frameworkConfig);
      fs.writeFileSync(listFilePath, generateListPage(components));

      // Add component browser pages to list of pages to require.
      pages.push(Precompiler.getCmptBrowserListPageRelativePath());
    }
    
    // Generate server.js file, containing references to all pages needed for
    // server side routing, plus all component definition for component browser.
    var serverFilePath = Precompiler.getServerFilePath(this._frameworkConfig);
    fs.writeFileSync(serverFilePath, generateServerFile(pages, components));
  }

  /**
   * Returns an array containing relative page paths:
   *
   * <pre>
   *   [
   *     'src/../../../Page.js',
   *     ...
   *   ]
   * </pre>
   *
   * @return {Array}
   */
  generatePageList() {
    var routeId, routes = Precompiler.readRoutesFile(this._frameworkConfig);
    var pageList = [];
    for (routeId in routes) {
      // TODO: Check if file exists or not, throw easy to read error when it doesn't exist.
      pageList.push(routes[routeId].page);
    }
    return pageList;
  }

  /**
   * Returns an array containing component information:
   * 
   * <pre>
   *   {
   *     vendorName: {
   *       componentName: {
   *         
   *       }
   *     }
   *   }
   * </pre>
   * 
   * @returns {Object}
   */
  generateComponentList() {
    var components = {};
    var componentFinder = new ComponentFinder();
    // TODO Multiple component source directory.
    var sourceDirectory = path.join(this._frameworkConfig.absoluteProjectDir, 'src');
    componentFinder.find(sourceDirectory, (thumbRelativePath, testRelativePath, docRelativePath, code, componentJson) => {
      if (!components.hasOwnProperty(componentJson.vendor)) {
        components[componentJson.vendor] = {};
      }
      if (components[componentJson.vendor].hasOwnProperty(componentJson.name)) {
        console.log('Duplicate component, will be overwritten: ' + componentJson.vendor + '.' + componentJson.name);
      }

      thumbRelativePath = this._prepWithSrc(thumbRelativePath);
      testRelativePath = this._prepWithSrc(testRelativePath);
      docRelativePath = this._prepWithSrc(docRelativePath);
      components[componentJson.vendor][componentJson.name] = {
        thumbnail: thumbRelativePath,
        test: testRelativePath,
        doc: docRelativePath,
        detail: componentJson,
        code: code
      };
    });
    return components;
  }

  _prepWithSrc(relativePath) {
    return relativePath == null ? null : path.join('src', relativePath);
  }

  static getServerFilePath(frameworkConfig) {
    return path.join(frameworkConfig.absoluteProjectDir, PRECOMPILE_RELATIVE_DIR, SERVER_FILE);
  }

  static getBuildDir(frameworkConfig) {
    return path.join(frameworkConfig.absoluteProjectDir, BUILD_RELATIVE_DIR);
  }

  static getPrecompileDir(frameworkConfig) {
    return path.join(frameworkConfig.absoluteProjectDir, PRECOMPILE_RELATIVE_DIR);
  }

  static getCmptBrowserListPagePath(frameworkConfig) {
    return path.join(frameworkConfig.absoluteProjectDir, PRECOMPILE_RELATIVE_DIR, CMPT_BROWSER_LIST_PAGE);
  }

  static getCmptBrowserListPageRelativePath() {
    return path.join(PRECOMPILE_RELATIVE_DIR, CMPT_BROWSER_LIST_PAGE);
  }

  static cleanDir(directory) {
    rimraf.sync(directory);
    // Ensure directory exists.
    try {
      fs.mkdirSync(directory);
    } catch(e) {
      if (e.code != 'EEXIST') throw e;
    }
  }

  /**
   * @param {Object} frameworkConfig
   * @return {Object}
   */
  static readRoutesFile(frameworkConfig) {
    var routesFilePath = path.join(frameworkConfig.absoluteProjectDir, 'routes.yml');
    return yaml.safeLoad(fs.readFileSync(routesFilePath, 'utf8'));
  }
}