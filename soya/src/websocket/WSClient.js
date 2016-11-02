import io from 'socket.io-client';
var nodeURL = require('url');

/**
 * A Socket.IO-client wrapper
 * @CLIENT
 * @param {string} url
 * @param {Object=} opt
 */
export default function wrapper(url, opt) {
  var defaultOpt = { forceNew: false };
  var option = Object.assign(defaultOpt, opt);
  var parsedUrl = nodeURL.parse(url);

  var qsSource = [];
  if (parsedUrl.query)
    qsSource.push(parsedUrl.query);
  if (option.query)
    qsSource.push(option.query);
  qsSource.push(`namespace=${encodeURIComponent(parsedUrl.pathname)}`);

  option.query = qsSource.join('&');
  return io(`${parsedUrl.protocol}//${parsedUrl.host}`, option);
}