import ReduxStore from './ReduxStore.js';

/**
 * ReduxStore implementation that allows mocking of Services.
 *
 * @CLIENT_SERVER
 */
export default class MockableReduxStore extends ReduxStore {
  /**
   * @type {{[key: string]: Service}}
   */
  _mockServices;

  constructor(initialState, clientConfig, cookieJar) {
    super(initialState, clientConfig, cookieJar);
    this._mockServices = {};
  }
  
  registerMockService(ServiceClass) {
    var serviceId = ServiceClass.id();
    if (typeof serviceId != 'string') {
      throw new Error('Mock Service must implement Service: ' + ServiceClass);
    }
    this._mockServices[serviceId] = new ServiceClass(
      this._clientConfig, this._cookieJar);
  }

  clearMocks() {
    this._mockServices = {};
  }

  getServiceDependencies(segmentId) {
    // This will make MockableReduxStore operate a little bit slower, but since
    // this implementation is only used in component browser/testing, it should
    // be okay.
    var serviceId, result = {};
    var services = this._serviceDependencies[segmentId];
    for (serviceId in services) {
      if (!services.hasOwnProperty(serviceId)) continue;
      if (this._mockServices.hasOwnProperty(serviceId)) {
        result[serviceId] = this._mockServices[serviceId];
      } else {
        result[serviceId] = services[serviceId];
      }
    }
    return result;
  }
}