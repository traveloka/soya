import createLocaleNode from './createLocaleNode';

function register(nodeFactory, config) {
  nodeFactory.registerNodeType(createLocaleNode(config));
}

export default register;
