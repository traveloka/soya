module.exports = function({types: t}) {
  return {
    visitor: {
      ClassDeclaration(path, state) {
        var curFilePath, node = path.node,
        entryPointAbsolutePathMap = state.opts.entryPointAbsolutePathMap;
        curFilePath = path.hub.file.opts.filename;
        if (entryPointAbsolutePathMap[curFilePath]) {
          entryPointAbsolutePathMap[curFilePath] = false;
          path.insertAfter([
            t.ifStatement(
              t.memberExpression(t.identifier('module'), t.identifier('hot')),
              t.blockStatement([
                t.expressionStatement(t.callExpression(
                  t.memberExpression(t.memberExpression(t.identifier('module'), t.identifier('hot')), t.identifier('accept')),
                  [
                    t.functionExpression(null, [], t.blockStatement([
                      t.expressionStatement(t.callExpression(
                        t.memberExpression(t.identifier('console'), t.identifier('error')),
                        [t.stringLiteral('Unable to accept hot reload module!'), t.identifier('arguments')]
                      ))
                    ]))
                  ]
                ))
              ])
            )
          ]);
        }
      }
    }
  }
};