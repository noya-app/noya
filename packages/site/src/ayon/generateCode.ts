import Sketch from 'noya-file-format';
import { Rect } from 'noya-geometry';
import { ApplicationState, Layers, Selectors } from 'noya-state';
import prettier from 'prettier';
import prettierTypeScript from 'prettier/parser-typescript';
import { isValidElement } from 'react';
import ts from 'typescript';
import { Blocks } from './blocks';

function createExpressionCode(value: unknown) {
  switch (typeof value) {
    case 'string':
      return ts.factory.createStringLiteral(value);
    case 'number':
      return ts.factory.createNumericLiteral(value);
    case 'boolean':
      return value ? ts.factory.createTrue() : ts.factory.createFalse();
    default:
      return ts.factory.createNull();
  }
}

function createJsxElement(
  openingElement: ts.JsxOpeningElement,
  children: readonly ts.JsxChild[],
) {
  if (children.length === 0) {
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

function createElementCode({
  name,
  props,
  frame,
}: {
  name: string;
  props: Record<string, unknown>;
  frame: Rect;
}) {
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
                ? expression
                : ts.factory.createJsxExpression(undefined, expression),
            ),
          ];
        }),
      ),
    ),
    [],
  );
}

export function generateCode(state: ApplicationState) {
  const page = Selectors.getCurrentPage(state);
  const artboard = page.layers[0] as Sketch.Artboard;

  const components = artboard.layers
    .filter(Layers.isSymbolInstance)
    .flatMap((layer) => {
      const block = Blocks[layer.symbolID];

      if (!block) return [];

      const element = block.render({
        frame: layer.frame,
        symbolId: layer.symbolID,
        blockText: layer.blockText,
        resolvedBlockData: layer.resolvedBlockData,
      });

      if (!element || !isValidElement(element)) return [];

      return [
        {
          name: (element.type as any).displayName,
          // Filter out undefined props
          props: Object.fromEntries(
            Object.entries(element.props).filter(
              ([key, value]) => value !== undefined,
            ),
          ),
          frame: layer.frame,
        },
      ];
    });

  const componentCode = components.map(createElementCode);

  const func = ts.factory.createFunctionDeclaration(
    undefined,
    undefined,
    'App',
    undefined,
    [],
    undefined,
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        ts.factory.createJsxFragment(
          ts.factory.createJsxOpeningFragment(),
          componentCode,
          ts.factory.createJsxJsxClosingFragment(),
        ),
      ),
    ]),
  );

  return format(printNode(func));
}

function printNode(node: ts.Node) {
  const sourceFile = ts.createSourceFile(
    'App.tsx',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );

  const printer = ts.createPrinter();

  const source = printer.printNode(
    ts.EmitHint.Unspecified,
    node ?? sourceFile,
    sourceFile,
  );

  return source;
}

function format(text: string) {
  return prettier.format(text, {
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 80,
    proseWrap: 'always',
    parser: 'typescript',
    plugins: [prettierTypeScript],
  });
}
