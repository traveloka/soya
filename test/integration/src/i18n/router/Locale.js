class Locale {
  /**
   * @private
   * @type {string}
   */
  _language;

  /**
   * @private
   * @type {string}
   */
  _country;

  /**
   * @param {string} language
   * @param {string} country
   */
  constructor(language, country) {
    this._language = language;
    this._country = country;
  }
  
  getCountry() {
    return this._country;
  }
  
  getLanguage() {
    return this._language;
  }

  /**
   * @returns {string}
   */
  toString() {
    return [
      this._language,
      this._country,
    ].join('-');
  }

  /**
   * @returns {{country: string, language: string}}
   */
  toObject() {
    return {
      country: this._country,
      language: this._language,
      locale: this.toString(),
    };
  }
}

export default Locale;
