import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import ComponentFinder from '../ComponentFinder.js';
import generateServerFile from './generateServerFile.js';

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
    this._frameworkConfig = frameworkConfig;
  }

  precompile() {
    var pages = this.generatePageList();
    var components = this.generateComponentList();
    var buildDir = path.join(this._frameworkConfig.absoluteProjectDir, 'build');
    var precompileDir = path.join(this._frameworkConfig.absoluteProjectDir, 'build/precompile');
    Precompiler.cleanDir(buildDir);
    Precompiler.cleanDir(precompileDir);

    // Generate server.js file.
    var serverFilePath = path.join(precompileDir, 'server.js');
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
    componentFinder.find(sourceDirectory, function(absoluteRootDir, componentJson) {
      if (!components.hasOwnProperty(componentJson.vendor)) {
        components[componentJson.vendor] = {};
      }
      if (components[componentJson.vendor].hasOwnProperty(componentJson.name)) {
        console.log('Duplicate component, will be overwritten: ' + componentJson.vendor + '.' + componentJson.name);
      }

      var thumbnailPath = path.join(absoluteRootDir, componentJson.thumbnail);
      var testPath = null;
      if (componentJson.test != null && isStringDuckType(componentJson.test) && componentJson.test != '') {
        testPath = path.join(absoluteRootDir, componentJson.test);
      }

      components[componentJson.vendor][componentJson.name] = {
        thumbnail: thumbnailPath,
        test: testPath,
        detail: componentJson
      };
    });
    return components;
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