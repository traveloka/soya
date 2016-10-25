export const DEFAULT_FRAMEWORK_CONFIG = {
  port: 8000,
  maxRequestBodyLength: 1e6,
  minifyJs: false,
  hotReload: false,
  debug: false,
  commonFileThreshold: 3,
  clientReplace: {},
  clientResolve: [],
  absoluteComponentsDir: [],
  webSocket: {
    enabled: false,
    port: 8010,
    redisConf: {
      host: 'localhost',
      port: 6379
    }
  }
};