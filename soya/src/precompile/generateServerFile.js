/**
 * @param {Object} pages
 * @param {Object} components
 */
export default function generateServerFile(pages, components) {
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

var components = ${JSON.stringify(components)};

// Run server.
server(config, pages, components);`;

  return result;
};