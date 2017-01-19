import fs from 'fs';
import path from 'path';

/**
 * @type {RegExp}
 */
var UNDERSCORE_REGEX = /^_/;

/**
 * @SERVER
 */
export default class PageFinder {
  _logger;

  /**
   * @param {Logger} logger
   */
  constructor(logger) {
    this._logger = logger;
  }

  /**
   * 1) Find recursively every component in the directory.
   * 2) Validate the component.
   *
   * @param {string} absoluteRootDir
   * @param {Function} callback
   */
  find(absoluteRootDir, callback) {
    var i, vendorNames;
    this._check(absoluteRootDir, true, false);
    vendorNames = fs.readdirSync(absoluteRootDir);
    for (i = 0; i < vendorNames.length; i++) {
      this._checkComponentDir(absoluteRootDir, vendorNames[i], callback);
    }
  }

  _checkComponentDir(absoluteRootDir, vendorName, callback) {
    var i, filenames, vendorRootDir, compName, compRootDir, compMain;
    vendorRootDir = path.join(absoluteRootDir, vendorName);
    this._check(vendorRootDir, true, false);
    filenames = fs.readdirSync(vendorRootDir);
    for (i = 0; i < filenames.length; i++) {
      compName = filenames[i];
      compRootDir = path.join(vendorRootDir, compName);
      compMain = path.join(vendorRootDir, compName, compName + '.js');

      if (!this._check(compRootDir, true, true)) continue;
      if (!this._check(compMain, false, true)) continue;

      if (UNDERSCORE_REGEX.test(compName)) {
        throw new Error('Component name starting with underscore is not allowed: ' + compName);
      }

      callback(vendorName, compName, compRootDir, path.join(vendorName, compName));
    }
  }

  /**
   * @param {string} absPath
   * @param {boolean} shouldBeDir
   * @param {boolean} shouldIgnore
   * @return {boolean}
   */
  _check(absPath, shouldBeDir, shouldIgnore) {
    var stat;
    try {
      stat = fs.statSync(absPath);
    } catch(error) {
      if (shouldIgnore) {
        this._logger.notice('Ignored: Component file/dir does no exist: \'' + absPath + '\'.');
        return false;
      } else {
        throw error;
      }
    }

    var isMismatchType = (
    (shouldBeDir && !stat.isDirectory()) ||
    !shouldBeDir && !stat.isFile()
    );
    if (isMismatchType) {
      if (shouldIgnore) {
        this._logger.notice(this._mismatchTypeMessage(absPath, shouldBeDir, 'Ignored: '));
        return false;
      } else {
        throw new Error(this._mismatchTypeMessage(absPath, shouldBeDir, ''));
      }

    }
    return true;
  }

  /**
   * @param {string} absPath
   * @param {string} shouldBeDir
   * @param {string} prefix
   */
  _mismatchTypeMessage(absPath, shouldBeDir, prefix) {
    if (shouldBeDir) {
      return prefix + 'Expected directory, but file found: \'' + absPath + '\'.';
    }
    return prefix + 'Expected file, but directory found: \'' + absPath + '\'.';
  }
}