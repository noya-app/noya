import * as ts from 'typescript';

export function removeEmptyClassNames(
  sourceFile: ts.SourceFile,
): ts.SourceFile {
  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      // Check if the node is a JSX attribute
      if (ts.isJsxAttribute(node)) {
        // Check if the attribute name is 'className'
        if (node.name.escapedText === 'className') {
          // Check if the initializer is a string literal with an empty value
          if (
            node.initializer &&
            ts.isStringLiteral(node.initializer) &&
            node.initializer.text === ''
          ) {
            // Return nothing to remove the attribute
            return;
          }
        }
      }

      // Visit children of the node
      return ts.visitEachChild(node, visitor, context);
    };

    // Apply the visitor to the source file
    return (node) => ts.visitNode(node, visitor);
  };

  // Perform the transformation
  const result = ts.transform<ts.SourceFile>(sourceFile, [transformer]);
  const transformedSourceFile = result.transformed[0];

  // Clean up
  result.dispose();

  return transformedSourceFile;
}
