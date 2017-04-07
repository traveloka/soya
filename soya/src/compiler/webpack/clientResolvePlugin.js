module.exports = function({types: t}) {
  return {
    visitor: {
      CallExpression(path, state) {
        var node = path.node;
        if (t.isIdentifier(node.callee, { name: "require" })) {
          var requireValue = node.arguments[0].value;
          if (state.clientResolve) {
            var i, resolved;
            for (i = 0; i < state.clientResolve.length; i++) {
              // TODO: Pass also the absolute path of currently parsed file.
              resolved = state.clientResolve[i](requireValue);
              if (resolved != null) {
                node.arguments[0].value = resolved;
                return;
              }
            }
          }
        }
      }
    }
  }
};