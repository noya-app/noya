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
  JsxElement,
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
  getChildren,
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

export function getAttributeValue<T extends string>(
  attributes: Record<string, ElementAttributeValue | void>,
  name: string,
): T | undefined {
  const attribute = attributes[name];

  return attribute && attribute.type === 'stringLiteral'
    ? (attribute.value as T)
    : undefined;
}

export function parseIntSafe(value?: string): number | undefined {
  const number = Number(value);
  return Number.isInteger(number) ? number : undefined;
}

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
    const childrenElements = getChildren(jsxElement).filter(
      isKind(SyntaxKind.JsxElement),
    );

    children = childrenElements.flatMap(
      (child) => getLayerHierarchy(sourceFile, child) ?? [],
    );
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

export const Element = {
  addChild(
    sourceFile: SourceFile,
    parentIndexPath: IndexPath,
    tagNameOrElement: string | JsxElement,
    index?: number,
  ) {
    return transformNode(sourceFile, (node, indexPath) => {
      if (isDeepEqual(parentIndexPath, indexPath)) {
        const newElement =
          typeof tagNameOrElement === 'string'
            ? ts.factory.createJsxElement(
                ts.factory.createJsxOpeningElement(
                  ts.factory.createIdentifier(tagNameOrElement),
                  undefined,
                  ts.factory.createJsxAttributes([]),
                ),
                [],
                ts.factory.createJsxClosingElement(
                  ts.factory.createIdentifier(tagNameOrElement),
                ),
              )
            : tagNameOrElement;

        const { openingElement, closingElement, children } = node as JsxElement;

        const newChildren = [...children];

        newChildren.splice(index ?? newChildren.length, 0, newElement);

        return ts.factory.createJsxElement(
          openingElement,
          newChildren,
          closingElement,
        );
      }

      return node;
    });
  },

  removeElement(sourceFile: SourceFile, elementIndexPath: IndexPath) {
    return transformNode(sourceFile, (node, indexPath) => {
      if (isDeepEqual(elementIndexPath, indexPath)) {
        return undefined;
      }

      return node;
    });
  },

  duplicateElement(sourceFile: SourceFile, elementIndexPath: IndexPath) {
    let originalNode = Nodes.access(sourceFile, elementIndexPath) as JsxElement;

    const clone = ts.getMutableClone(originalNode);

    return Element.addChild(
      sourceFile,
      elementIndexPath.slice(0, -1),
      clone,
      elementIndexPath[elementIndexPath.length - 1],
    );
  },
};

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
            (property) => getJsxPropertyName(property) !== name,
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

        const jsxAttribute = ts.factory.createJsxAttribute(
          ts.factory.createIdentifier(name),
          expression,
        );

        return ts.factory.createJsxAttributes([
          ...(node as JsxAttributes).properties,
          jsxAttribute,
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
