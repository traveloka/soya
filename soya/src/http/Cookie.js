/**
 * Represents a cookie.
 *
 * @CLIENT-SERVER
 */
export default class Cookie {
  /**
   * @type {string}
   */
  name;

  /**
   * @type {string}
   */
  value;

  /**
   * @type {?number}
   */
  expire;

  /**
   * @type {string}
   */
  path;

  /**
   * @type {?string}
   */
  domain;

  /**
   * @type {boolean}
   */
  secure;

  /**
   * Create a cookie which expires after N more days from now.
   *
   * @param {string} name
   * @param {string} value
   * @param {number} expireInDays
   * @param {?string} domain
   * @param {?boolean} secure
   * @param {?string} path
   */
  static createExpireInDays(name, value, expireInDays, domain, secure, path) {
    var msecToAdd = expireInDays * 24 * 60 * 60 * 1000;
    return Cookie.createExpireInMsec(name, value, msecToAdd, domain, secure, path);
  }

  /**
   * Create session cookie that should expire after browser is closed.
   *
   * IMPORTANT NOTE: The days have long passed when web developers can rely
   * on this technique. The thing is some browsers do not clear session cookies
   * if options like 'Remember previously opened tabs' are enabled - leaving
   * your 'session' cookie to exist effectively forever. Only use this if you
   * have control over your user's browser settings.
   *
   * @param {string} name
   * @param {string} value
   * @param {?string} domain
   * @param {?boolean} secure
   * @param {?string} path
   */
  static createSession(name, value, domain, secure, path) {
    return new Cookie(name, value, null, domain, secure, path);
  }

  /**
   * Create a cookie that expires after N milliseconds from now.
   *
   * @param {string} name
   * @param {string} value
   * @param {number} expireInMsec
   * @param {?string} domain
   * @param {?boolean} secure
   * @param {?string} path
   */
  static createExpireInMsec(name, value, expireInMsec, domain, secure, path) {
    var expire = Date.now() + expireInMsec;
    return new Cookie(name, value, expire, domain, secure, path);
  }

  /**
   * @param {string} cookieName
   * @param {?string} domain
   * @param {boolean} secure
   * @param {?string} path
   * @returns {Cookie}
   */
  static createRemoval(cookieName, domain, secure, path) {
    if (!path) path = '/';
    return new Cookie(cookieName, '', -1, domain, secure, path);
  }

  /**
   * Create cookie from set-cookie string:
   * i.e : tap-lifetime-0002="oBCeULc9g3dsAGIVbc0+Y1dMUTUfe8tgA1tGc8dl7tdR/nOsT7pdctTPxfg6RWNeCTKONugC+gIsTAxwlHmZ1FTmpKPhzCHP6H8SMy21eMHRzzRF7tIZdSE7z8iDagaUS4xNmz/p3y80P0AdfkVR5wXquz+7JAk4x15aFAwN2ng0LI3bXs6pPJfUR94hLriazBfuNMNrhafN0cg9nLcEgg==";Path=/;Expires=Wed, 06-Apr-2016 08:46:51 GMT
   * @param cookieString
   */
  static createFromSetCookieString(cookieString) {
    const cookieParts = cookieString.split(';');
    const cookieObject = {};
    for (const part of cookieParts) {
      const splitHelper = part.trim().split('=');
      const splitResult = splitHelper.splice(0, 1);
      splitResult.push(splitHelper.join('='));
      const { 0: key, 1: val } = splitResult;

      if (_isCookieKeyword(key)) {
        cookieObject[key.toLowerCase()] = val || '';
      } else {
        cookieObject.name = key;
        cookieObject.value = val.replace(/\"/g, '');
      }
    }

    function _isCookieKeyword(key) {
      switch (key.toLowerCase()) {
        case 'expires':
        case 'domain':
        case 'path':
        case 'secure':
        case 'httponly':
          return true;
        default:
          return false;
      }
    }

    if (cookieObject.expires) {
      return Cookie.createExpireInMsec(
        cookieObject.name,
        cookieObject.value,
        (new Date(cookieObject.expires)).getTime(),
        cookieObject.domain,
        Boolean(cookieObject.secure),
        cookieObject.path
      );
    }

    return Cookie.createSession(
      cookieObject.name,
      cookieObject.value,
      cookieObject.domain,
      Boolean(cookieObject.secure),
      cookieObject.path
    );
  }

  /**
   * @param {string} name
   * @param {string} value
   * @param {?number} expire
   * @param {?string} domain
   * @param {?boolean} secure
   * @param {?string} path
   */
  constructor(name, value, expire, domain, secure, path) {
    this.name = name;
    this.value = value;
    this.expire = expire;
    this.domain = domain;
    this.secure = !!secure;
    this.path = path ? path : '/';
  }

  /**
   * @return {string}
   */
  toHeaderString() {
    var expireString = '', secureString = '', domainString = '', cookie;
    if (this.expire) {
      expireString = ';Expires=' + new Date(this.expire).toGMTString();
    }
    if (this.secure) {
      secureString = ';Secure';
    }
    if (this.domain) {
      domainString = `;Domain=${this.domain}`;
    }

    // TODO: We should escape some characters when printing these.
    cookie = `${this.name}=${this.value};Path=${this.path}${domainString}${expireString}${secureString}`;
    return cookie;
  }

  /**
   * @return {string}
   */
  toDocumentString() {
    var expireString = '', secureString = '', domainString = '', cookie;
    if (this.expire) {
      expireString = '; expires=' + new Date(this.expire).toGMTString();
    }
    if (this.secure) {
      secureString = ';secure';
    }
    if (this.domain) {
      domainString = `; domain=${this.domain}`
    }

    cookie = `${this.name}=${this.value}${expireString}; path=${this.path}${domainString}${secureString}`;
    return cookie;
  }
}