import Node from 'soya/lib/router/Node';
import Locale from './Locale';

export default (config) => {
  if (!config.i18n || !config.i18n.defaultLocale || !config.i18n.locales) {
    throw new Error('Please specify default locale and locales in config');
  }
  class LocaleNode extends Node {
    /**
     * @returns {string}
     */
    static get nodeName() {
      return 'locale';
    }

    /**
     * @param {Array.<string>} locales
     * @returns {Array<Node>}
     */
    static constructFromConfig(locales) {
      if (!locales.length) {
        throw new Error('Locale node receives empty locales!');
      }

      const availableLocales = config.i18n.locales;

      if (locales[0] === '*') {
        return [new LocaleNode(availableLocales)];
      }

      return [new LocaleNode(
        locales.reduce((newLocales, locale) => {
            const [language, country] = locale.split('-');
            if (language === '*') {
              newLocales.push(
                ...availableLocales.filter(availableLocale => {
                  const [, availableCountry] = availableLocale.split('-');
                  return availableCountry === country;
                })
              );
            } else if (country === '*') {
              newLocales.push(
                ...availableLocales.filter(availableLocale => {
                  const [availableLanguage] = availableLocale.split('-');
                  return availableLanguage === language;
                })
              );
            } else {
              newLocales.push(locale);
            }
            return newLocales;
          }, [])
          // remove duplicate
          .filter((locale, index, locales) => locales.indexOf(locale) === index)
      )];
    }

    /**
     * @type {Array.<string>}
     */
    _locales;

    /**
     * @param {Array.<string>} locales
     */
    constructor(locales) {
      super();
      this._locales = locales;
    }

    /**
     * @param {string} language
     * @param {string} country
     * @returns {Locale}
     */
    createLocaleFromObject({ language, country }) {
      const [defaultLanguage, defaultCountry] = config.i18n.defaultLocale.split('-');
      return new Locale(language || defaultLanguage, country || defaultCountry);
    }

    /**
     * @param {string} localeString
     * @returns {Locale}
     */
    createLocaleFromString(localeString) {
      const [language, country] = localeString.split('-');
      const [defaultLanguage, defaultCountry] = config.i18n.defaultLocale.split('-');
      return new Locale(language || defaultLanguage, country || defaultCountry);
    }

    /**
     * @param {Locale} locale
     * @returns {string}
     */
    shortenLocale(locale) {
      const [, defaultCountry] = config.i18n.defaultLocale.split('-');
      const localeArr = [locale.getLanguage()];
      if (locale.getCountry() !== defaultCountry) {
        localeArr.push(locale.getCountry());
      }
      return localeArr.join('-');
    }

    /**
     * @param {RoutingData} routingData
     * @returns {boolean}
     */
    evaluate(routingData) {
      if (routingData.isAllSegmentConsumed()) {
        // We are still expecting a path segment. If all path segment is already
        // consumed, it's not a match.
        return false;
      }
      const locale = this.createLocaleFromString(routingData.getCurrentSegment());
      if (this._locales.indexOf(locale.toString()) !== -1) {
        routingData.resultRouteArgs.locale = locale.toObject();
        routingData.consumeSegment();
        if (routingData.isAllSegmentConsumed()) {
          routingData.undoConsumeSegment();
        }
      } else {
        routingData.resultRouteArgs.locale = this.createLocaleFromString(this._locales[0]).toObject();
      }
      return true;
    }

    /**
     * @param {ReverseRoutingData} reverseRoutingData
     */
    reverseEvaluate(reverseRoutingData) {
      if (this._locales.length > 0) {
        let locale = reverseRoutingData.routeArgs.locale
          ? this.createLocaleFromObject(reverseRoutingData.routeArgs.locale)
          : this.createLocaleFromString(this._locales[0]);
        let localeString = locale.toString();
        if (this._locales.indexOf(localeString) === -1) {
          locale = this.createLocaleFromString(this._locales[0]);
          localeString = locale.toString();
        }
        if (localeString !== config.i18n.defaultLocale) {
          reverseRoutingData.pathSegments.unshift(this.shortenLocale(locale));
        }
      }
    }

    /**
     * @returns {boolean}
     */
    isConsumingSegmentOnMatch() {
      return true;
    }

    _matches(locales) {
      if (this._locales.length !== locales.length) return false;
      for (let i=0; i<this._locales.length; i++) {
        if (this._locales[i] !== locales[i]) {
          return false;
        }
      }
      return true;
    }

    /**
     * @param {Node} node
     * @returns {boolean}
     */
    equals(node) {
      return node instanceof LocaleNode && this._matches(node._locales);
    }
  }
  return LocaleNode;
};
