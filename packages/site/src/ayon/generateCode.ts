import Sketch from 'noya-file-format';
import { Rect } from 'noya-geometry';
import { ApplicationState, Layers, Selectors } from 'noya-state';
import { isValidElement } from 'react';
import ts, { SourceFile } from 'typescript';
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

function createElementCode({
  name,
  props,
  frame,
}: {
  name: string;
  props: Record<string, unknown>;
  frame: Rect;
}) {
  return ts.factory.createJsxElement(
    ts.factory.createJsxOpeningElement(
      ts.factory.createIdentifier(name),
      undefined,
      ts.factory.createJsxAttributes(
        Object.entries(props).flatMap(([key, value]) => {
          const expression = createExpressionCode(value);

          if (!expression) return [];

          if (expression.kind === ts.SyntaxKind.TrueKeyword) {
            return [
              ts.factory.createJsxAttribute(
                ts.factory.createIdentifier(key),
                undefined,
              ),
            ];
          }

          return [
            ts.factory.createJsxAttribute(
              ts.factory.createIdentifier(key),
              ts.factory.createJsxExpression(undefined, expression),
            ),
          ];
        }),
      ),
    ),
    [],
    ts.factory.createJsxClosingElement(ts.factory.createIdentifier(name)),
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

  const sourceFile = ts.createSourceFile(
    'App.tsx',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );

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

  return printSourceFile(sourceFile, func);
}

export function printSourceFile(sourceFile: SourceFile, node?: ts.Node) {
  const printer = ts.createPrinter();

  return printer.printNode(
    ts.EmitHint.Unspecified,
    node ?? sourceFile,
    sourceFile,
  );
}
