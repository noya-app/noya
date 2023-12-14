import { groupBy } from 'noya-utils';
import ts from 'typescript';
import { SimpleElement, isPassthrough, isSimpleElement } from './common';
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

function createPropertyKey(key: string): ts.Identifier | ts.StringLiteral {
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
  props,
  children,
}: SimpleElement): ts.JsxElement | ts.JsxSelfClosingElement {
  return createJsxElement(
    ts.factory.createJsxOpeningElement(
      ts.factory.createIdentifier(name),
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
  imports: { name: string; source: string }[],
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
          ts.factory.createImportSpecifier(
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
