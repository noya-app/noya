import { DesignSystemDefinition } from '@noya-design-system/protocol';
import Sketch from 'noya-file-format';
import { loadDesignSystem } from 'noya-module-loader';
import { BlockDefinition, BlockRenderingEnvironment, Layers } from 'noya-state';
import { unique } from 'noya-utils';
import prettier from 'prettier';
import prettierTypeScript from 'prettier/parser-typescript';
import React, { isValidElement } from 'react';
import { flat } from 'tree-visit';
import ts from 'typescript';

function createExpressionCode(value: unknown): ts.Expression {
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
              ts.factory.createIdentifier(key),
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
  source?: string;
  props: Record<string, unknown>;
  children: (SimpleElement | string)[];
};

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
      typeof child === 'string'
        ? ts.factory.createJsxExpression(
            undefined,
            ts.factory.createStringLiteral(child),
          )
        : createElementCode(child),
    ),
  );
}

export interface CompilerConfiguration {
  artboard: Sketch.Artboard;
  Blocks: Record<string, BlockDefinition>;
  DesignSystem: string | DesignSystemDefinition;
}

export function createRenderingEnvironment(
  system: DesignSystemDefinition,
): BlockRenderingEnvironment {
  return {
    h: system.createElement,
    Components: system.components,
  };
}

export function createElement(
  {
    Blocks,
    DesignSystem,
  }: {
    Blocks: CompilerConfiguration['Blocks'];
    DesignSystem: DesignSystemDefinition;
  },
  layer: Sketch.SymbolInstance,
): SimpleElement | undefined {
  const block = Blocks[layer.symbolID];

  if (!block) return;

  const element = block.render(createRenderingEnvironment(DesignSystem), {
    layer: layer,
    frame: layer.frame,
    symbolId: layer.symbolID,
    blockText: layer.blockText,
    resolvedBlockData: layer.resolvedBlockData,
    getBlock: (id) => Blocks[id],
    dataSet: {
      id: layer.do_objectID,
      parentId: layer.do_objectID,
    },
  });

  if (!element || !isValidElement(element)) return;

  const Components = buildComponentMap(DesignSystem.imports);

  function createSimpleElement(
    element: React.ReactElement,
  ): SimpleElement | undefined {
    const protocolComponent = Object.values(DesignSystem.components).find(
      (value) => value === element.type,
    );

    if (!protocolComponent) return;

    const libraryElement = protocolComponent?.(element.props);

    if (isValidElement(libraryElement)) {
      element = libraryElement;
    }

    const componentName = Components.get(element.type);

    const name =
      typeof element.type === 'string' ? element.type : componentName;

    if (!name) return;

    let source: string | undefined;

    if (componentName) {
      source = DesignSystem.imports?.find(({ namespace }) =>
        Object.values(namespace).includes(element.type),
      )?.source;
    }

    return {
      name,
      source,
      // Filter out children prop and undefined props
      props: Object.fromEntries(
        Object.entries(element.props).filter(
          ([key, value]) =>
            key !== 'children' &&
            !key.startsWith('data-noya-') &&
            value !== undefined,
        ),
      ),
      children: React.Children.toArray(element.props.children).flatMap(
        (element): (SimpleElement | string)[] => {
          if (typeof element === 'string' && element !== '') return [element];
          const validElement = React.isValidElement(element);
          if (!validElement) return [];
          const mapped = createSimpleElement(element);
          return mapped ? [mapped] : [];
        },
      ),
    };
  }

  const root = createSimpleElement(element);

  if (!root) return;

  return {
    name: 'Frame',
    props: {
      ...(layer.frame.x !== 0 && { left: layer.frame.x }),
      ...(layer.frame.y !== 0 && { top: layer.frame.y }),
      width: layer.frame.width,
      height: layer.frame.height,
    },
    children: [root],
  };
}

export function buildComponentMap(imports: DesignSystemDefinition['imports']) {
  const Components = new Map<any, string>();

  for (const declaration of imports ?? []) {
    for (let [name, value] of Object.entries(declaration.namespace)) {
      Components.set(value, name);
    }
  }

  return Components;
}

export async function compile(configuration: CompilerConfiguration) {
  const { artboard } = configuration;

  const DesignSystem =
    typeof configuration.DesignSystem === 'string'
      ? await loadDesignSystem(configuration.DesignSystem)
      : configuration.DesignSystem;

  const components = artboard.layers
    .filter(Layers.isSymbolInstance)
    .flatMap((layer) => {
      const element = createElement(
        {
          Blocks: configuration.Blocks,
          DesignSystem,
        },
        layer,
      );

      return element ? [element] : [];
    });

  const getChildren = (element: SimpleElement | string) => {
    return typeof element === 'string' ? [] : element.children;
  };

  const fakeRoot: SimpleElement = {
    name: 'Frame',
    children: components,
    props: {},
  };

  const componentCode = components.map(createElementCode);

  const frameComponent = `/**
 * To make your layout responsive, delete this Frame component and replace any
 * instance of it with your own layout components that use e.g. flexbox.
 */
function Frame(
  props: React.PropsWithChildren<
    Pick<React.CSSProperties, "left" | "top" | "width" | "height">
  >
) {
  return (
    <Box 
      style={{
        position: 'absolute',
        left: props.left,
        top: props.top,
        width: props.width,
        height: props.height,
      }}
    >
      {props.children}
    </Box>
  )
}`;

  const imports = (DesignSystem.imports ?? []).map(({ source }) => {
    return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports(
          unique([
            'Box',
            ...flat(fakeRoot, { getChildren }).flatMap((element) =>
              typeof element !== 'string' && element.source === source
                ? [element.name]
                : [],
            ),
          ]).map((name) =>
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier(name),
            ),
          ),
        ),
      ),
      ts.factory.createStringLiteral(source),
    );
  });

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

  const allDependencies = (DesignSystem.imports ?? []).reduce(
    (result, importDeclaration) => ({
      ...result,
      ...importDeclaration.dependencies,
    }),
    DesignSystem.dependencies ?? {},
  );

  const allDevDependencies = (DesignSystem.imports ?? []).reduce(
    (result, importDeclaration) => ({
      ...result,
      ...importDeclaration.devDependencies,
    }),
    DesignSystem.devDependencies ?? {},
  );

  const main = 'index.tsx';

  const files = {
    'App.tsx': format(
      [
        print(imports),
        `import * as React from "react";`,
        frameComponent,
        print([func, exports]),
      ].join('\n\n'),
    ),
    'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="index.js"></script>
  </body>
</html>`,
    'index.tsx': `import { createRoot } from "react-dom/client";
import * as React from 'react';

import { App } from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

root.render(<App />);`,
    'package.json': JSON.stringify(
      {
        name: 'App',
        version: '0.0.1',
        main,
        scripts: {
          start: `parcel ${main} --open`,
          build: `parcel build ${main}`,
        },
        dependencies: allDependencies,
        devDependencies: {
          'parcel-bundler': '*',
          ...allDevDependencies,
        },
      },
      null,
      2,
    ),
  };

  return files;
}

export function print(nodes: ts.Node | ts.Node[]) {
  const sourceFile = ts.createSourceFile(
    'App.tsx',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );

  const printer = ts.createPrinter();

  const source = Array.isArray(nodes)
    ? printer.printList(
        ts.ListFormat.MultiLine,
        ts.factory.createNodeArray(nodes),
        sourceFile,
      )
    : printer.printNode(ts.EmitHint.Unspecified, nodes, sourceFile);

  return source;
}

export function format(text: string) {
  return prettier.format(text, {
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 80,
    proseWrap: 'always',
    parser: 'typescript',
    plugins: [prettierTypeScript],
  });
}

export * from './codesandbox';
