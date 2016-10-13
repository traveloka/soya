import fs from 'fs';
import path from 'path';
import { isStringDuckType } from './data/redux/helper';

/**
 * @SERVER
 */
export default class ComponentFinder {
  /**
   * 1) Find recursively every component in the directory.
   * 2) Validate the component.
   *
   * @param {string} absoluteRootDir
   * @param {Function} callback
   */
  find(absoluteRootDir, callback) {
    this._check(absoluteRootDir, true, false);
    var i, candidates, candidate, stat, candidatePath;
    candidates = fs.readdirSync(absoluteRootDir);
    for (i = 0; i < candidates.length; i++) {
      candidate = candidates[i];
      candidatePath = path.join(absoluteRootDir, candidate);
      stat = fs.statSync(candidatePath);
      if (stat.isDirectory()) {
        this.find(candidatePath, callback);
      }
      if (stat.isFile() && candidate == 'component.json') {
        this._reg(absoluteRootDir, candidatePath, callback);
      }
    }
  }

  _reg(absoluteRootDir, jsonAbsolutePath, callback) {
    var componentJson;
    try {
      componentJson = JSON.parse(fs.readFileSync(jsonAbsolutePath, 'utf8'));
    } catch (error) {
      console.log('IGNORED: Failed to read this component file: ' + jsonAbsolutePath);
    }

    var result = this._validateComponentJson(componentJson);
    if (!result) {
      console.log('IGNORED: Invalid component.json file: ' + jsonAbsolutePath);
      return;
    }
    callback(absoluteRootDir, componentJson);
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
        console.log('Ignored: Component file/dir does no exist: \'' + absPath + '\'.');
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
        console.log(this._mismatchTypeMessage(absPath, shouldBeDir, 'Ignored: '));
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