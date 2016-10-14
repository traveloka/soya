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
   * @param {string} absoluteProjectDir
   * @param {Function} callback
   */
  find(absoluteProjectDir, callback) {
    this._find(absoluteProjectDir, '', callback);
  }

  /**
   * Since the convention is to put all components and pages inside the project,
   * we can safely assume that relative dir won't contain
   *
   *
   */
  _find(absoluteRootDir, relativeDir, callback) {
    var currentAbsoluteDir = path.join(absoluteRootDir, relativeDir);
    this._check(currentAbsoluteDir, true, false);
    var i, candidates, candidate, stat, candidatePath, newRelativeDir;
    candidates = fs.readdirSync(currentAbsoluteDir);
    for (i = 0; i < candidates.length; i++) {
      candidate = candidates[i];
      candidatePath = path.join(currentAbsoluteDir, candidate);
      stat = fs.statSync(candidatePath);
      if (stat.isDirectory()) {
        newRelativeDir = path.join(relativeDir, candidate);
        this._find(absoluteRootDir, newRelativeDir, callback);
        continue;
      }
      if (stat.isFile() && candidate == 'component.json') {
        this._reg(absoluteRootDir, relativeDir, candidatePath, callback);
      }
    }
  }
  
  _reg(absoluteRootDir, relativePath, jsonAbsolutePath, callback) {
    var componentJson;
    try {
      componentJson = JSON.parse(fs.readFileSync(jsonAbsolutePath, 'utf8'));
    } catch (error) {
      console.log('IGNORED: Failed to read this component file: ' + jsonAbsolutePath);
    }

    var result = this._validateComponentJson(componentJson, jsonAbsolutePath);
    if (!result) return;

    var thumbRelativePath = path.join(relativePath, componentJson.thumbnail);
    var thumbFilePath = path.join(absoluteRootDir, thumbRelativePath);
    if (!this._fileExists(thumbFilePath)) {
      console.log('IGNORED: Thumbnail component does not exist: ' + thumbFilePath + ' in: ' + jsonAbsolutePath);
      return;
    }

    var testRelativePath = null;
    var testFilePath = null;
    if (componentJson.test != null && isStringDuckType(componentJson.test)) {
      testRelativePath = path.join(relativePath, componentJson.test);
      testFilePath = path.join(absoluteRootDir, testRelativePath);
      if (!this._fileExists(testFilePath)) {
        console.log('IGNORED: Test component does not exist: ' + testFilePath + ' in: ' + jsonAbsolutePath);
        return;
      }
    }

    callback(thumbRelativePath, testRelativePath, componentJson);
  }

  _fileExists(filePath) {
    try {
      var stats = fs.statSync(filePath);
      return stats.isFile();
    } catch (e) {
      if (e.code == 'ENOENT') return false;
      throw e;
    }
  }

  /**
   * @param {Object} componentJson
   * @param {string} jsonAbsolutePath
   * @return {boolean}
   */
  _validateComponentJson(componentJson, jsonAbsolutePath) {
    var vendor = componentJson.vendor;
    var name = componentJson.name;
    var thumbnail = componentJson.thumbnail;

    if (vendor == null || !isStringDuckType(vendor) || vendor == '') {
      console.log('IGNORED: component.json does not contain vendor: ' + jsonAbsolutePath);
      return false;
    }

    if (name == null || !isStringDuckType(name) || name == '') {
      console.log('IGNORED: component.json does not contain name: ' + jsonAbsolutePath);
      return false;
    }

    if (thumbnail == null || !isStringDuckType(thumbnail) || thumbnail == '') {
      console.log('IGNORED: component.json does not contain thumbnail component: ' + jsonAbsolutePath);
      return false;
    }

    return true;
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