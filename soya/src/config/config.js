import path from 'path';
const nodeConfig = path.join(__dirname, 'node-config.js');

var Config = function (nodeConfig) {
  console.log('nodeConfig', nodeConfig);
  this.nodeConfig = nodeConfig;
};

Config.prototype.has = function (params) {
  return this.nodeConfig && this.nodeConfig.hasOwnProperty(params);
}

Config.prototype.get = function (params) {
  return this.nodeConfig[params];
}

var config = module.exports = new Config(nodeConfig);
