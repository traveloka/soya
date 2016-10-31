/**
 * @param {Object} pages
 * @param {Object} components
 * @param {Object} wsPages
 */
export default function generateServerFile(pages, components, wsPages) {
  var result = `import server from 'soya/lib/server';
import config from '../../config.js';

var pages = {}`;

  var i;
  for (i = 0; i < pages.length; i++) {
    result += `
import Page${i} from '../../${pages[i]}';
pages['${pages[i]}'] = Page${i};`;
  }

  result += `

var components = ${JSON.stringify(components)};`;

  result += `

var wsPages = {}`;
  for (i = 0; i < wsPages.length; i++) {
    result += `
import WsPage${i} from '../../${wsPages[i]}';
wsPages['${wsPages[i]}'] = WsPage${i}`;
  }

  result += `

// Run server.
server(config, pages, components, wsPages);`;

  return result;
};