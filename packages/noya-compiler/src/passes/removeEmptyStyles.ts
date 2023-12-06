import * as ts from 'typescript';

// https://chat.openai.com/share/176e61f9-7d45-46fa-bba7-a7c69455ab54
export function removeEmptyStyles(sourceFile: ts.SourceFile): ts.SourceFile {
  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const attributes = node.attributes.properties.filter((property) => {
          if (
            ts.isJsxAttribute(property) &&
            property.name.escapedText === 'style'
          ) {
            if (
              property.initializer &&
              ts.isJsxExpression(property.initializer)
            ) {
              if (
                property.initializer.expression &&
                ts.isObjectLiteralExpression(property.initializer.expression)
              ) {
                // If the style object is empty, we filter out this attribute
                if (property.initializer.expression.properties.length === 0) {
                  return false;
                }
              }
            }
          }
          return true;
        });
        const updatedAttributes = ts.factory.createJsxAttributes(attributes);
        if (ts.isJsxOpeningElement(node)) {
          return ts.factory.updateJsxOpeningElement(
            node,
            node.tagName,
            node.typeArguments,
            updatedAttributes,
          );
        } else {
          return ts.factory.updateJsxSelfClosingElement(
            node,
            node.tagName,
            node.typeArguments,
            updatedAttributes,
          );
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
