import * as ts from 'typescript';

// https://chat.openai.com/share/176e61f9-7d45-46fa-bba7-a7c69455ab54
export function removeUndefinedStyles(
  sourceFile: ts.SourceFile,
): ts.SourceFile {
  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (ts.isJsxAttribute(node)) {
        if (
          node.name.escapedText === 'style' &&
          node.initializer &&
          ts.isJsxExpression(node.initializer)
        ) {
          if (
            node.initializer.expression &&
            ts.isObjectLiteralExpression(node.initializer.expression)
          ) {
            const properties = node.initializer.expression.properties.filter(
              (property) => {
                if (
                  ts.isPropertyAssignment(property) &&
                  ts.isIdentifier(property.initializer) &&
                  property.initializer.text === 'undefined'
                ) {
                  return false;
                }
                return true;
              },
            );
            const updatedExpression = ts.factory.createObjectLiteralExpression(
              properties,
              false,
            );
            const updatedInitializer = ts.factory.createJsxExpression(
              undefined,
              updatedExpression,
            );
            return ts.factory.createJsxAttribute(node.name, updatedInitializer);
          }
        }
      }

      return ts.visitEachChild(node, visitor, context);
    };

    return (node) => ts.visitNode(node, visitor);
  };

  const result = ts.transform<ts.SourceFile>(sourceFile, [transformer]);
  const transformedSourceFile = result.transformed[0];

  result.dispose();

  return transformedSourceFile;
}
