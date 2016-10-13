import { isStringDuckType } from './data/redux/helper';
import path from 'path';

/**
 * Used to register components to use for component browser.
 *
 * @SERVER
 */
export default class ComponentBrowserRegister {
  /**
   * @type {Logger}
   */
  _logger;

  /**
   * Example:
   *
   * {
   *   vendor: {
   *     ComponentName: {
   *       thumbnail: '/.../.../../ComponentNameThumb.js',
   *       test: '/../../../ComponentNameThumb.js',
   *       detail: {
   *         // Component JSON.
   *       }
   *     }
   *   }
   * }
   *
   * @type {{[key: string]: {[key:string]: ComponentJson}}}
   */
  _components;

  /**
   * @param {Logger} logger
   */
  constructor(logger) {
    this._logger = logger;
    this._components = {};
  }

  reg(vendorName, componentName, data) {
    if (!this._components.hasOwnProperty(vendorName)) {
      this._components[vendorName] = {};
    }
    if (this._components[vendorName].hasOwnProperty(componentName)) {
      this._logger.notice('Duplicate component, will be overwritten: ' + vendorName + '.' + componentName);
    }
    this._components[vendorName][componentName] = data;
  }

  /**
   * @param {string} absoluteRootDir
   * @param {Object} componentJson
   */
  register(absoluteRootDir, componentJson) {
    var isValid = this._validateComponentJson(componentJson);
    if (!isValid) {
      this._logger.notice("Invalid component json file: " + path.join(absoluteRootDir, 'component.json'));
      return;
    }

    if (!this._components.hasOwnProperty(componentJson.vendor)) {
      this._components[componentJson.vendor] = {};
    }
    if (!this._components[componentJson.vendor].hasOwnProperty(componentJson.name)) {
      this._logger.notice('Duplicate component, will be overwritten: ' + componentJson.vendor + '.' + componentJson.name);
    }

    var thumbnailPath = path.join(absoluteRootDir, componentJson.thumbnail);
    var testPath = null;
    if (componentJson.test != null && isStringDuckType(componentJson.test) && componentJson.test != '') {
      testPath = path.join(absoluteRootDir, componentJson.test);
    }

    this._components[componentJson.vendor][componentJson.name] = {
      thumbnail: thumbnailPath,
      test: testPath,
      detail: componentJson
    };
  }
  
  getComponents() {
    return this._components;
  }

  /**
   * @param {Object} componentJson
   * @return {boolean}
   */
  _validateComponentJson(componentJson) {
    var vendor = componentJson.vendor;
    var name = componentJson.name;
    var thumbnail = componentJson.thumbnail;

    return (
      vendor != null && isStringDuckType(vendor) && vendor != '' &&
      name != null && isStringDuckType(name) && name != '' &&
      thumbnail != null && isStringDuckType(thumbnail) && thumbnail != ''
    );
  }
}