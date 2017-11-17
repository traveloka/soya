# Soya

There won't be further development of Soya.
Please migrate to [Soya Next](https://github.com/traveloka/soya-next) and thanks for using it!

## Migrating to Soya Next

Soya Next (>=0.2.9) is compatible with Soya (>=0.2.0), so you can run both partially on a single server (less migration efforts).

### Installation

First, upgrade soya version to 0.2.0 or later.

```bash
npm upgrade soya
# or 
yarn upgrade soya
```

Then, install the required dependencies:

```bash
npm install --save config next react react-cookie react-dom react-redux redux soya-next soya-next-scripts styled-modules
# or
yarn add config next react react-cookie react-dom react-redux redux soya-next soya-next-scripts styled-modules
```

### Configurations

#### Framework, server, and client configurations

You might need to migrate your configuration files as well because Soya Next uses `config` directory name by default.
Simply rename your config directory to other name, i.e. `legacy-config`.

Don't forget to update `config.js` as well.

```js
var path = require('path');
var env = process.env.NODE_ENV || 'dev';

var defaultConfig = require('./legacy-config/default.js');
var config = require('./legacy-config/' + env);

module.exports = {
  frameworkConfig: Object.assign({
    absoluteProjectDir: process.cwd(),
  }, defaultConfig.frameworkConfig, config.frameworkConfig),
  serverConfig: Object.assign({}, defaultConfig.serverConfig, config.serverConfig),
  clientConfig: Object.assign({}, defaultConfig.clientConfig, config.clientConfig)
};
```

Some of soya's framework configurations is needed for it to work properly in Soya Next.
Thus, you need to migrate it as well by creating a file at `config/default.json` with the following:

```diff
{
  "host": "0.0.0.0",
  "port": 3000,
  "dev": false,
+ "legacy": {
+   "absoluteComponentsDir": [],
+   "assetProtocol": "http",
+   "assetHostPath": "{host}:{port}/assets/",
+   "clientReplace": {},
+   "clientResolve": [],
+   "commonFileThreshold": 3,
+   "componentBrowser": false,
+   "defaultImportBase": "src",
+   "precompileClient": false
+ }
}
```

- Set `dev` to `true` for development
- Set `precompileClient` to `true` for staging and production.

In `legacy-config/production.js` set `precompileClient` to `true`:

```js
const frameworkConfig = {
  "precompileClient": true
};

export default {
  frameworkConfig
};
```

#### Custom Babelrc

By default most soya projects use the following babel configuration:

```json
{
  "presets": [
    "es2015",
    "react",
    "stage-2"
  ],
  "plugins": [
    "transform-export-extensions",
    "transform-object-assign"
  ]
}
```

In order for it to work with Soya Next, you need to migrate it with the following:

```diff
  "presets": [
+   "next/babel",
-   "es2015",
-   "react",
    "stage-2"
  ],
  "plugins": [
+   [
+     "styled-modules/babel",
+     {
+       "pattern": "\\.nx(\\.mod(ule)?)?\\.(css|s(a|c)ss)$"
+     }
+   ],
    "transform-export-extensions",
    "transform-object-assign"
  ]
```

> Notice the pattern option used is suffixed with `nx`, this is to avoid transpiling legacy css files.

### Scripts

Add the following scripts to `package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=1 soya-next-scripts build",
    "build": "RUN_MODE=buildClient soya-next-scripts build",
    "eject": "soya-next-scripts eject",
    "start": "soya-next-scripts start",
    "test": "soya-next-scripts test"
  }
}
```

### Start the server

Done! You can start your server with the following:

```bash
npm start
# or
yarn start
```

## Hopefully hassle free web front-end framework

Soya uses React, Webpack and Redux to help speed up web front-end engineering efforts. Soya aims to:

- Make it easier for front-end engineers to create and share UI components, as easy Java engineers import classes!
- Reuse components on any layer of abstraction, just the view, the domain logic, or the entire component - along with its context.
- Removes the need to deal with HTML, CSS, JS and static file dependencies manually.
- Easier to code by running the same view code on server and client side.

Eventually the final objective is to make the cost of web UI prototyping as small as possible, making iterative development of front-end much more viable.

Soya is still in active development. If you want to look around, play around in our integration tests.

    (~/soya) $ cd test/integration
    (~/soya/test/integration) $ npm install
    (~/soya/test/integration) $ npm run start

Server should be running at localhost:8000.

Please write your suggestions, criticisms, feature requests in the wiki page.

## Contributors

See [Contributors](https://github.com/traveloka/soya/blob/master/soya/CONTRIBUTORS.md).
