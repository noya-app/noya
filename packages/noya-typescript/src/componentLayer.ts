import { withOptions } from 'tree-visit';
import ts, {
  Expression,
  isJsxAttribute,
  JsxAttribute,
  JsxExpression,
  JsxOpeningElement,
  JsxSelfClosingElement,
  SourceFile,
  StringLiteral,
  SyntaxKind,
} from 'typescript';
import {
  firstChild,
  firstChildOfKind,
  isKind,
  Nodes,
  transformNode,
} from './traversal';
import { IndexPath } from 'tree-visit';
import { isDeepEqual } from 'noya-utils';

export type ElementAttributeValue =
  | {
      type: 'stringLiteral';
      value: string;
      indexPath: IndexPath;
    }
  | {
      type: 'other';
      value: ts.Node;
    };

export type ElementLayer = {
  // id: string;
  indexPath: IndexPath;
  tagName: string;
  children: ElementLayer[];
  attributes: Record<string, ElementAttributeValue>;
};

export const ElementTree = withOptions({
  getChildren: (element: ElementLayer) => element.children,
});

function getLayerHierarchy(
  sourceFile: SourceFile,
  expression: Expression,
): ElementLayer | undefined {
  const jsxElement = Nodes.find(expression, isKind(SyntaxKind.JsxElement));

  if (!jsxElement) return;

  const tagElement = firstChild(
    expression,
    (child): child is JsxOpeningElement | JsxSelfClosingElement =>
      child.kind === SyntaxKind.JsxOpeningElement ||
      child.kind === SyntaxKind.JsxSelfClosingElement,
  );

  if (!tagElement) return undefined;

  let children: ElementLayer[] = [];

  if (isKind(SyntaxKind.JsxOpeningElement)(tagElement)) {
    const content = expression.getChildren()[1].getChildren()[1];

    // console.log(Nodes.diagram(expression));

    if (content && isKind(SyntaxKind.SyntaxList)(content)) {
      children = content
        .getChildren()
        .flatMap(
          (item, index) => getLayerHierarchy(sourceFile, item as any) ?? [],
        );
    }
  }

  const jsxAttributes = Nodes.findAll<JsxAttribute>(tagElement, isJsxAttribute);

  const attributes = Object.fromEntries(
    jsxAttributes.flatMap((attribute) => {
      const expression = Nodes.find<JsxExpression>(
        attribute,
        ts.isJsxExpression,
      );

      if (!expression) return [];

      const key = attribute.name.getText();
      let value: ElementAttributeValue = { type: 'other', value: expression };

      const stringLiteral = Nodes.find<StringLiteral>(
        expression,
        isKind(SyntaxKind.StringLiteral),
      );

      if (stringLiteral) {
        value = {
          type: 'stringLiteral',
          value: stringLiteral.text,
          indexPath: Nodes.findIndexPath(
            sourceFile,
            (node) => node === expression,
          )!,
        };
      }

      return [[key, value]];
    }),
  );

  // console.log(Nodes.diagram(tagElement));

  return {
    indexPath: Nodes.findIndexPath(sourceFile, (node) => node === jsxElement)!,
    tagName: tagElement.tagName.getText(),
    children,
    attributes,
  };
}

export type ComponentLayer = {
  name: string;
  element: ElementLayer;
};

export function getComponentLayer(
  sourceFile: ts.SourceFile,
): ComponentLayer | undefined {
  const functionDeclaration = firstChildOfKind(
    sourceFile,
    ts.SyntaxKind.FunctionDeclaration,
  );

  if (functionDeclaration) {
    const returnStatement = firstChildOfKind(
      functionDeclaration,
      ts.SyntaxKind.ReturnStatement,
    );

    if (returnStatement && returnStatement.expression) {
      const indexPath = Nodes.findIndexPath(
        sourceFile,
        (node) => node === returnStatement.expression,
      );

      if (!indexPath) return;

      const element = getLayerHierarchy(sourceFile, returnStatement.expression);

      if (!element) return;

      return {
        name: functionDeclaration.name?.text ?? 'Component',
        element,
      };
    }
  }
}

export function setFunctionName(
  sourceFile: SourceFile,
  name: string,
): SourceFile {
  return transformNode(sourceFile, (node) => {
    if (ts.isIdentifier(node) && ts.isFunctionDeclaration(node.parent)) {
      return ts.factory.createIdentifier(name);
    }

    return node;
  });
}

export function setAttributeStringValue(
  sourceFile: SourceFile,
  targetIndexPath: IndexPath,
  value: string,
): SourceFile {
  return transformNode(sourceFile, (node, indexPath) => {
    if (isDeepEqual(targetIndexPath, indexPath)) {
      return ts.factory.createJsxExpression(
        undefined,
        ts.factory.createStringLiteral(value),
      );
    }

    return node;
  });
}
