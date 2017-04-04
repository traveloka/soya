/**
 * Parse query string. Accepts the following example string as input:
 *
 * <pre>
 *   ?param1=value1&param2=value2
 * </pre>
 *
 * @param {string} queryString
 * @returns {Object}
 */
export default function parseQueryString(queryString) {
  var i, parsedQs = {}, segment, idx, key, val, qsArray = queryString.substring(1).split('&');
  for (i = 0; i < qsArray.length; i++) {
    segment = qsArray[i];
    if (segment == '') continue;
    idx = segment.indexOf('=');
    if (idx < 0) {
      key = segment;
      val = '';
    } else {
      key = segment.substring(0, idx);
      val = segment.substring(idx + 1);
    }
    parsedQs[decodeURIComponent(key)] = decodeURIComponent(val);
  }
  return parsedQs;
}