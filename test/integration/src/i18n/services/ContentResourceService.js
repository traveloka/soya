import request from 'superagent';
import Service from 'soya/lib/data/redux/Service';
import { CONTENT_RESOURCE_SERVICE } from '../constants/ContentResourceConstant';

class ContentResourceService extends Service {
  static id() {
    return CONTENT_RESOURCE_SERVICE;
  }

  constructor(config, ...args) {
    super(config, ...args);
    this._promise = null;
    this._queries = {};
    this._defaultLocale = config.i18n && config.i18n.defaultLocale;
  }

  addQuery({ name, entryKey }) {
    this._queries = {
      ...this._queries,
      [name]: [
        ...(this._queries[name] || []),
        entryKey,
      ],
    };
  }

  clearQueries() {
    this._queries = {};
  }

  fetchContentResource(query) {
    this.addQuery(query);
    if (this._promise === null) {
      this._promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          const data = Object.keys(this._queries).reduce((queries, name) => {
            queries[name] = this._queries[name].filter((entry, index, entries) => entries.indexOf(entry) === index);
            return queries;
          }, {});
          const apiUrlParts = [
            this.config.contentApiHost || this.config.apiHost,
          ];
          if (query.locale && query.locale !== this._defaultLocale) {
            apiUrlParts.push(query.locale);
          }
          apiUrlParts.push('api/resource/content');
          this.clearQueries();
          this._promise = null;
          request
            .post(`http://${apiUrlParts.join('/')}`)
            .send({ data })
            .end((err, res) => {
              if (err) {
                reject(err || new Error('Something went wrong'));
              } else {
                resolve(JSON.parse(res.text));
              }
            });
        }, 100);
      });
    }
    return this._promise;
  }
}

export default ContentResourceService;
