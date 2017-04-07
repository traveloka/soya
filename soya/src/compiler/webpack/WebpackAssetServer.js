import AssetServer from '../AssetServer';
import ServerHttpRequest from '../../http/ServerHttpRequest.js';

import fs from 'fs';
import path from 'path';
import mime from 'mime';

/**
 * Reads asset from the webpack output directory.
 *
 * TODO: Implement memory caching.
 *
 * @SERVER
 */
export default class WebpackAssetServer extends AssetServer {
  /**
   * @type {string}
   */
  _absoluteTempDir;

  /**
   * @type {string}
   */
  _assetHostPath;

  /**
   * @type {Logger}
   */
  _logger;

  /**
   * @param {string} assetHostPath
   * @param {string} absoluteTempDir
   * @param {Logger} logger
   */
  constructor(assetHostPath, absoluteTempDir, logger) {
    super(assetHostPath);
    this._assetHostPath = assetHostPath;
    this._absoluteTempDir = absoluteTempDir;
    this._logger = logger;
  }

  /**
   * @param {string} assetPath
   * @returns {{size: number; content: any}}
   */
  get(assetPath) {
    var fullPath = path.join(this._absoluteTempDir, assetPath), stat;
    try {
      // TODO: We might have to switch to async for better performance here.
      stat = fs.statSync(fullPath);
      return {
        size: stat.size,
        content: fs.readFileSync(fullPath)
      }
    } catch (err) {
      this._logger.notice('Asset server failed to retrieve: \'' + fullPath + '\'.', err);
      return null;
    }
  }

  /**
   * @param {http.incomingMessage} request
   * @param {httpServerResponse} response
   * @returns {boolean}
   */
  handle(request, response) {
    var httpRequest = new ServerHttpRequest(request);
    if (httpRequest.startsWith(this._assetHostPath)) {
      var fullRequestPath = path.join(httpRequest.getHost(), decodeURI(httpRequest.getPath()));
      var realPath = fullRequestPath.substr(this._assetHostPath.length);
      var asset = this.get(realPath);
      if (asset == null || asset.content == null) {
        return false;
      }
      // TODO: Handle e-tag, etc.
      response.writeHead(200, {
        'Content-Type': mime.lookup(realPath),
        'Content-Length': asset.size
      });
      response.end(asset.content);
      return true;
    }
    return false;
  }
}
