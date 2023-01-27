import Sketch from 'noya-file-format';
import {
  ApplicationState,
  BlockDefinition,
  Layers,
  Selectors,
} from 'noya-state';
import { unique } from 'noya-utils';
import prettier from 'prettier';
import prettierTypeScript from 'prettier/parser-typescript';
import React, { isValidElement } from 'react';
import { flat } from 'tree-visit';
import ts from 'typescript';

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

export interface CompilerConfiguration {
  state: ApplicationState;
  Blocks: Record<string, BlockDefinition>;
  Components: Map<unknown, string>;
}

export function compile({ state, Blocks, Components }: CompilerConfiguration) {
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

      function createSimpleElement(
        element: React.ReactElement,
      ): SimpleElement | undefined {
        const name = Components.get(element.type);

        if (!name) return;

        return {
          name,
          // Filter out children prop and undefined props
          props: Object.fromEntries(
            Object.entries(element.props).filter(
              ([key, value]) => key !== 'children' && value !== undefined,
            ),
          ),
          children: React.Children.toArray(element.props.children)
            .filter(React.isValidElement)
            .flatMap((element) => {
              const mapped = createSimpleElement(element);
              return mapped ? [mapped] : [];
            }),
        };
      }

      const root = createSimpleElement(element);

      if (!root) return [];

      return [
        {
          name: 'Frame',
          props: {
            left: layer.frame.x,
            top: layer.frame.y,
            width: layer.frame.width,
            height: layer.frame.height,
          },
          children: [root],
        },
      ];
    });

  const getChildren = (element: SimpleElement) => {
    return element.children;
  };
  const fakeRoot: SimpleElement = {
    name: 'Frame',
    children: components,
    props: {},
  };

  const componentCode = components.map(createElementCode);

  const frameComponent = `
function Frame(props: React.ComponentProps<typeof Box>) {
  return <Box pos="absolute" {...props} />
}`;

  const imports = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        unique(
          flat(fakeRoot, { getChildren })
            .map((element) => element.name)
            .filter((name) => name !== 'Frame'),
        ).map((name) =>
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(name),
          ),
        ),
      ),
    ),
    ts.factory.createStringLiteral('@chakra-ui/react'),
  );

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

  const exports = ts.factory.createExportDeclaration(
    undefined,
    false,
    ts.factory.createNamedExports([
      ts.factory.createExportSpecifier(
        false,
        undefined,
        ts.factory.createIdentifier('App'),
      ),
    ]),
  );

  const files = {
    'App.tsx': format(
      [
        printNodes([imports]),
        `import * as React from "react";`,
        frameComponent,
        printNodes([func, exports]),
      ].join('\n\n'),
    ),
    'package.json': JSON.stringify(
      {
        name: 'app',
        dependencies: {
          react: '^18',
          '@chakra-ui/icons': '^2',
          '@chakra-ui/react': '^1',
          '@emotion/react': '^11',
          '@emotion/styled': '^11',
        },
      },
      null,
      2,
    ),
  };

  console.info(files);

  return files;
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
