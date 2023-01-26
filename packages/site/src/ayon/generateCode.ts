import Sketch from 'noya-file-format';
import { ApplicationState, Layers, Selectors } from 'noya-state';
import prettier from 'prettier';
import prettierTypeScript from 'prettier/parser-typescript';
import React, { isValidElement } from 'react';
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

type SimpleElement = {
  name: string;
  props: Record<string, unknown>;
  children: SimpleElement[];
};

function createElementCode({
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
                ? expression
                : ts.factory.createJsxExpression(undefined, expression),
            ),
          ];
        }),
      ),
    ),
    children.map(createElementCode),
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

      function createSimpleElement(element: React.ReactElement): SimpleElement {
        return {
          name: (element.type as any).displayName,
          // Filter out children prop and undefined props
          props: Object.fromEntries(
            Object.entries(element.props).filter(
              ([key, value]) => key !== 'children' && value !== undefined,
            ),
          ),
          children: React.Children.toArray(element.props.children)
            .filter(React.isValidElement)
            .map(createSimpleElement),
        };
      }

      return [
        {
          name: 'Frame',
          props: {
            left: layer.frame.x,
            top: layer.frame.y,
            width: layer.frame.width,
            height: layer.frame.height,
          },
          children: [createSimpleElement(element)],
        },
      ];
    });

  const componentCode = components.map(createElementCode);

  const frameComponent = `
function Frame(props: React.ComponentProps<typeof Box>) {
  return <Box pos="absolute" {...props} />
}`;

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

  return format([frameComponent, printNodes([func])].join('\n\n'));
}

function printNodes(nodes: ts.Node[]) {
  const sourceFile = ts.createSourceFile(
    'App.tsx',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );

  const printer = ts.createPrinter();

  const source = printer.printList(
    ts.ListFormat.MultiLine,
    ts.factory.createNodeArray(nodes),
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
