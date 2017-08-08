const path = require('path');

module.exports = {
  legacy: {
    assetProtocol: 'http',
    componentBrowser: true,
    defaultImportBase: 'src',
    routerNodeRegistrationAbsolutePath: path.resolve(__dirname, '../src/i18n/router/registerRouterNodes'),
  }
};
