import { groupBy, unique } from '@noya-app/noya-utils';
import { DesignSystemDefinition } from '@noya-design-system/protocol';
import React, { ReactNode } from 'react';
import ts from 'typescript';
import {
  SimpleElement,
  SimpleElementTree,
  buildNamespaceMap,
  findElementNameAndSource,
  isPassthrough,
  isSimpleElement,
  simpleElement,
} from './common';
import { isSafeForJsxText, isValidPropertyKey } from './validate';

export function createJsxElement(
  openingElement: ts.JsxOpeningElement,
  children?: readonly ts.JsxChild[],
) {
  if (!children || children.length === 0) {
    return ts.factory.createJsxSelfClosingElement(
      openingElement.tagName,
      openingElement.typeArguments,
      openingElement.attributes,
    );
  }

  return ts.factory.createJsxElement(
    openingElement,
    children,
    ts.factory.createJsxClosingElement(openingElement.tagName),
  );
}

export function createPropertyKey(
  key: string,
): ts.Identifier | ts.StringLiteral {
  if (isValidPropertyKey(key)) {
    return ts.factory.createIdentifier(key);
  } else {
    return ts.factory.createStringLiteral(key);
  }
}

export function createExpressionCode(value: unknown): ts.Expression {
  if (isPassthrough(value)) {
    return value as any;
  }

  if (isSimpleElement(value)) {
    return createElementCode(value);
  }

  switch (typeof value) {
    case 'string':
      return ts.factory.createStringLiteral(value);
    case 'number':
      return ts.factory.createNumericLiteral(value);
    case 'boolean':
      return value ? ts.factory.createTrue() : ts.factory.createFalse();
    case 'object':
      if (value === null) return ts.factory.createNull();

      if (Array.isArray(value)) {
        return ts.factory.createArrayLiteralExpression(
          value.map((item) => createExpressionCode(item)),
        );
      }

      return ts.factory.createObjectLiteralExpression(
        Object.entries(value).flatMap(([key, value]) => {
          const expression = createExpressionCode(value);

          return [
            ts.factory.createPropertyAssignment(
              createPropertyKey(key),
              expression,
            ),
          ];
        }),
      );
    case 'undefined':
      return ts.factory.createIdentifier('undefined');
    default:
      return ts.factory.createNull();
  }
}

export function createElementCode({
  name,
  accessPath,
  props,
  children,
}: SimpleElement): ts.JsxElement | ts.JsxSelfClosingElement {
  return createJsxElement(
    ts.factory.createJsxOpeningElement(
      accessPath && accessPath.length > 0
        ? // When we update typescript we can probably used JsxNamespacedName
          // https://github.com/microsoft/TypeScript/blob/2c7162143bbbf567ccecc64105010699fa7a2128/src/compiler/factory/nodeFactory.ts#L5802
          ts.factory.createIdentifier(`${name}.${accessPath[0]}`)
        : ts.factory.createIdentifier(name),
      undefined,
      ts.factory.createJsxAttributes(
        Object.entries(props).flatMap(([key, value]) => {
          const expression = createExpressionCode(value);

          if (!expression) return [];

          return [
            ts.factory.createJsxAttribute(
              ts.factory.createIdentifier(key),
              expression.kind === ts.SyntaxKind.TrueKeyword
                ? undefined
                : expression.kind === ts.SyntaxKind.StringLiteral
                ? (expression as ts.StringLiteral)
                : ts.factory.createJsxExpression(undefined, expression),
            ),
          ];
        }),
      ),
    ),
    children.map((child) =>
      isPassthrough(child)
        ? (child as any)
        : typeof child === 'string'
        ? isSafeForJsxText(child)
          ? ts.factory.createJsxText(child, false)
          : ts.factory.createJsxExpression(
              undefined,
              ts.factory.createStringLiteral(child),
            )
        : createElementCode(child),
    ),
  );
}

export function createReactComponentDeclaration(
  name: string,
  returnValue: ts.Expression,
  params: ts.ParameterDeclaration[] = [],
) {
  return ts.factory.createFunctionDeclaration(
    [
      ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
      ts.factory.createModifier(ts.SyntaxKind.DefaultKeyword),
    ],
    undefined,
    name,
    undefined,
    params,
    undefined,
    ts.factory.createBlock([ts.factory.createReturnStatement(returnValue)]),
  );
}

export function generateImportDeclarations(
  imports: { name: string; source: string; as?: string }[],
): ts.ImportDeclaration[] {
  const groups = groupBy(
    imports,
    (importDeclaration) => importDeclaration.source,
  );

  return Object.entries(groups).map(([source, imports]) => {
    const importClause = ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        imports.map((importDeclaration) =>
          importDeclaration.as
            ? ts.factory.createImportSpecifier(
                false,
                ts.factory.createIdentifier(importDeclaration.name),
                ts.factory.createIdentifier(importDeclaration.as),
              )
            : ts.factory.createImportSpecifier(
                false,
                undefined,
                ts.factory.createIdentifier(importDeclaration.name),
              ),
        ),
      ),
    );

    return ts.factory.createImportDeclaration(
      undefined,
      importClause,
      ts.factory.createStringLiteral(source),
    );
  });
}

export function extractImports(
  simpleElement: SimpleElement,
  DesignSystem: DesignSystemDefinition,
) {
  return (DesignSystem.imports ?? []).flatMap(({ source, alwaysInclude }) => {
    const names = unique(
      SimpleElementTree.flat(simpleElement).flatMap((element) =>
        typeof element !== 'string' &&
        !isPassthrough(element) &&
        element.source === source
          ? [element.name]
          : [],
      ),
    );

    if (names.length === 0 && !alwaysInclude) return [];

    return [
      ts.factory.createImportDeclaration(
        undefined,
        names.length === 0
          ? undefined
          : ts.factory.createImportClause(
              false,
              undefined,
              ts.factory.createNamedImports(
                names.map((name) =>
                  ts.factory.createImportSpecifier(
                    false,
                    undefined,
                    ts.factory.createIdentifier(name),
                  ),
                ),
              ),
            ),
        ts.factory.createStringLiteral(source),
      ),
    ];
  });
}

export function createSimpleElement(
  originalElement: React.ReactNode,
  DesignSystem: DesignSystemDefinition,
): SimpleElement | undefined {
  const namespaceMap = buildNamespaceMap(DesignSystem.imports);

  const elementType = findElementNameAndSource(
    originalElement,
    DesignSystem,
    namespaceMap,
  );

  if (!elementType) return;

  const { element, name, source, accessPath } = elementType;

  function toReactArray(children: ReactNode): ReactNode[] {
    const result: ReactNode[] = [];

    const addChildren = (child: ReactNode) => {
      if (Array.isArray(child)) {
        child.forEach((c) => addChildren(c));
      } else if (child != null && child !== false) {
        result.push(child);
      }
    };

    addChildren(children);
    return result;
  }

  function deepConvertElementProp(value: unknown): unknown {
    if (isPassthrough(value)) return value;

    if (typeof value === 'object') {
      if (value === null) return value;
      if (Array.isArray(value)) {
        return value.map(deepConvertElementProp);
      }
      if (React.isValidElement(value)) {
        return createSimpleElement(value, DesignSystem);
      }
      return Object.fromEntries(
        Object.entries(value).map(([key, value]) => [
          key,
          deepConvertElementProp(value),
        ]),
      );
    }

    return value;
  }

  return simpleElement({
    name,
    accessPath,
    nodePath: element.props['data-path']?.split('/'),
    source,
    // Filter out children prop and undefined props
    props: Object.fromEntries(
      Object.entries(element.props)
        .filter(
          ([key, value]) =>
            key !== 'children' &&
            !key.startsWith('data-') &&
            value !== undefined,
        )
        .map(([key, value]) => [key, deepConvertElementProp(value)]),
    ),
    children: toReactArray(element.props.children).flatMap(
      (element): SimpleElement['children'] => {
        if (isPassthrough(element)) return [element];
        if (typeof element === 'string' && element !== '') return [element];
        const validElement = React.isValidElement(element);
        if (!validElement) return [];
        const mapped = createSimpleElement(element, DesignSystem);
        return mapped ? [mapped] : [];
      },
    ),
  });
}
