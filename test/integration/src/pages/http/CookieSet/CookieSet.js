import React from 'react';
import Page from 'soya/lib/page/Page';
import RenderResult from 'soya/lib/page/RenderResult';
import ReactRenderer from 'soya/lib/page/react/ReactRenderer.js';
import register from 'soya/lib/client/Register';
import Cookie from 'soya/lib/http/Cookie.js';
import scope from 'soya/lib/scope';

import style from '../../../shared/sitewide.css';

class Component extends React.Component {
  componentWillMount() {
    this.readClientCookie();
  }

  render() {
    return <div>
      <h1>Cookies</h1>
      <ul>
        <li>The response should set a 10-years cookie: <code>decade</code> and session cookie <code>one-night-stand</code> if it doesn't exist in request header.</li>
        <li>On second request (when the cookie is already present at request header), response will not set cookie.</li>
        <li>You can <a href={this.props.context.router.reverseRoute('COOKIE_REMOVE')}>visit this page</a> to clear cookies from server-side.</li>
        <li><a href="javascript:void(0)" onClick={this.setCookies.bind(this)}>Clicking this link</a> would make client-side set 10 years cookie <code>dasawarsa</code> and session cookie <code>cinta-satu-malam</code>.</li>
        <li>Client-side should also be able to <a href="javascript:void(0)" onClick={this.clearCookies.bind(this)}>clear the aforementioned cookies</a>.</li>
      </ul>
      <h3>Cookies read in server</h3>
      <ul>
        <li><code>decade</code>: {this.props.readLifetime}</li>
        <li><code>one-night-stand</code>: {this.props.readSession}</li>
      </ul>
      <h3>Cookies read in client</h3>
      <ul>
        <li><code>dasawarsa</code>: {this.state.dasawarsa}</li>
        <li><code>cinta-satu-malam</code>: {this.state['cinta-satu-malam']}</li>
      </ul>
    </div>;
  }

  readClientCookie() {
    this.setState({
      'dasawarsa': this.props.context.cookieJar.read('dasawarsa'),
      'cinta-satu-malam': this.props.context.cookieJar.read('cinta-satu-malam')
    });
  }

  setCookies() {
    this.props.context.cookieJar.set(Cookie.createExpireInDays('dasawarsa', '10-tahun', 10 * 360));
    this.props.context.cookieJar.set(Cookie.createSession('cinta-satu-malam', 'oh-indahnya'));
    this.readClientCookie();
  }

  clearCookies() {
    this.props.context.cookieJar.remove('dasawarsa');
    this.props.context.cookieJar.remove('cinta-satu-malam');
    this.readClientCookie();
  }
}

class CookieSet extends Page {
  static get pageName() {
    return 'CookieSet';
  }

  static getRouteRequirements() {
    return ['COOKIE_REMOVE'];
  }

  render(httpRequest, routeArgs, store, callback) {
    if (scope.server && this.cookieJar.read('decade') == null) {
      this.cookieJar.set(Cookie.createExpireInDays('decade', '10-years', 10 * 360));
    }
    if (scope.server && this.cookieJar.read('one-night-stand') == null) {
      this.cookieJar.set(Cookie.createSession('one-night-stand', 'sounds-fun'));
    }

    var reactRenderer = new ReactRenderer();
    reactRenderer.head = '<title>Cookie</title>';
    reactRenderer.body = React.createElement(Component, {
      context: this.createContext(store),
      readLifetime: this.cookieJar.read('decade'),
      readSession: this.cookieJar.read('one-night-stand')
    });

    var renderResult = new RenderResult(reactRenderer);
    callback(renderResult);
  }
}

register(CookieSet);
export default CookieSet;