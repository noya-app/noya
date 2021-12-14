import { isDeepEqual } from 'noya-utils';
import { IndexPath, withOptions } from 'tree-visit';
import ts, {
  Expression,
  isIdentifier,
  isJsxAttribute,
  isJsxAttributes,
  JsxAttribute,
  JsxAttributeLike,
  JsxAttributes,
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

export type ElementAttributeValue =
  | {
      type: 'stringLiteral';
      value: string;
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
  attributes: Record<string, ElementAttributeValue | void>;
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

export const ElementAttributes = {
  removeAttribute(
    sourceFile: SourceFile,
    elementIndexPath: IndexPath,
    name: string,
  ): SourceFile {
    const node = Nodes.access(sourceFile, elementIndexPath);
    const attributesIndexPath = Nodes.findIndexPath(node, isJsxAttributes);

    if (!attributesIndexPath) return sourceFile;

    elementIndexPath = [...elementIndexPath, ...attributesIndexPath];

    return transformNode(sourceFile, (node, indexPath) => {
      if (isDeepEqual(elementIndexPath, indexPath)) {
        return ts.factory.createJsxAttributes(
          (node as JsxAttributes).properties.filter(
            (property) =>
              !(
                property.name &&
                isIdentifier(property.name) &&
                property.name.text === name
              ),
          ),
        );
      }

      return node;
    });
  },

  addAttribute(
    sourceFile: SourceFile,
    elementIndexPath: IndexPath,
    name: string,
    value: string,
  ): SourceFile {
    const node = Nodes.access(sourceFile, elementIndexPath);
    const attributesIndexPath = Nodes.findIndexPath(node, isJsxAttributes);

    if (!attributesIndexPath) return sourceFile;

    elementIndexPath = [...elementIndexPath, ...attributesIndexPath];

    return transformNode(sourceFile, (node, indexPath) => {
      if (isDeepEqual(elementIndexPath, indexPath)) {
        const expression = ts.factory.createJsxExpression(
          undefined,
          ts.factory.createStringLiteral(value),
        );

        return ts.factory.createJsxAttributes([
          ...(node as JsxAttributes).properties,
          ts.factory.createJsxAttribute(
            ts.factory.createIdentifier(name),
            expression,
          ),
        ]);
      }

      return node;
    });
  },

  setAttribute(
    sourceFile: SourceFile,
    elementIndexPath: IndexPath,
    name: string,
    value: string,
  ): SourceFile {
    const node = Nodes.access(sourceFile, elementIndexPath);
    const attributesIndexPath = Nodes.findIndexPath(node, isJsxAttributes);

    if (!attributesIndexPath) return sourceFile;

    elementIndexPath = [...elementIndexPath, ...attributesIndexPath];

    return transformNode(sourceFile, (node, indexPath) => {
      if (isDeepEqual(elementIndexPath, indexPath)) {
        const expression = ts.factory.createJsxExpression(
          undefined,
          ts.factory.createStringLiteral(value),
        );

        const jsxAttribute = ts.factory.createJsxAttribute(
          ts.factory.createIdentifier(name),
          expression,
        );

        const properties = (node as JsxAttributes).properties;
        const propertyExists = properties.some(
          (property) => getJsxPropertyName(property) === name,
        );

        return ts.factory.createJsxAttributes(
          propertyExists
            ? properties.map((property) =>
                getJsxPropertyName(property) === name ? jsxAttribute : property,
              )
            : [...properties, jsxAttribute],
        );
      }

      return node;
    });
  },
};

function getJsxPropertyName(property: JsxAttributeLike): string | undefined {
  return property.name && isIdentifier(property.name)
    ? property.name.text
    : undefined;
}
