import Component from './Component';

var PAGE_VENDOR = '__page';

/**
 * Used to register page and reusable components. Canonical reference for
 * pages and components at server side.
 *
 * @SERVER
 */
export default class ComponentRegister {
  /**
   * @type {{[key: string]: {[key:string]: Component}}}
   */
  _components;

  /**
   * @type {Logger}
   */
  _logger;

  /**
   * @param {Logger} logger
   */
  constructor(logger) {
    this._logger = logger;
    this._components = {};
  }

  /**
   * @returns {?{[key: string]: Component}}
   */
  getPages() {
    return this.getComponents(PAGE_VENDOR);
  }

  /**
   * @returns {?{[key: string]: Component}}
   */
  getComponents(vendor) {
    return this._components[vendor];
  }

  /**
   * @param {string} name
   * @param {string} absDir
   * @param {any} clazz
   */
  regPage(name, absDir, clazz) {
    if (typeof clazz != 'function') {
      throw new Error('Unable to load page, not a function: ' + absDir);
    }
    if (typeof clazz.prototype.render != 'function') {
      throw new Error('Page class doesn\'t implement render(): \'' + absDir + '\'.');
    }
    if (!clazz.pageName) {
      throw new Error('Page class doesn\'t have static name property: \'' + absDir + '\'.');
    }
    // if (clazz.pageName != name) {
    //   throw new Error('Page class static name property and actual directory name differs: ' + clazz.pageName + ' and ' + name + '.');
    // }
    this._regComponent(PAGE_VENDOR, name, absDir, clazz);
  }

  /**
   * @param {string} name
   * @returns {?Component}
   */
  getPage(name) {
    return this.getComponent(PAGE_VENDOR, name);
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  hasPage(name) {
    return this.hasComponent(PAGE_VENDOR, name);
  }

  /**
   * @param {string} vendor
   * @param {string} name
   * @param {string} absDir
   * @param {any} clazz
   */
  regComponent(vendor, name, absDir, clazz) {
    if (vendor[0] == '_') {
      throw new Error('Component vendor name must not start with underscore: ' + vendor);
    }
    if (name[0] == '_') {
      throw new Error('Component name must not start with underscore: ' + name);
    }
    this._regComponent(vendor, name, absDir, clazz);
  }

  /**
   * @param {string} vendor
   * @param {string} name
   * @param {string} absDir
   * @param {any} clazz
   */
  _regComponent(vendor, name, absDir, clazz) {
    if (!this._components.hasOwnProperty(vendor)) {
      this._components[vendor] = {};
    }
    this._components[vendor][name] = new Component(name, absDir, clazz);
  }

  /**
   * @param {string} vendor
   * @param {string} name
   * @return {?Component}
   */
  getComponent(vendor, name) {
    return this._components[vendor][name];
  }

  /**
   * @param {string} vendor
   * @param {string} name
   * @returns {boolean}
   */
  hasComponent(vendor, name) {
    return this._components.hasOwnProperty(vendor) && this._components[vendor].hasOwnProperty(name);
  }
}