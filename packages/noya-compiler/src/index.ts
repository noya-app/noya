import {
  component,
  DesignSystemDefinition,
} from '@noya-design-system/protocol';
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

const simpleElementSymbol = Symbol('simpleElement');

function isSimpleElement(value: unknown): value is SimpleElement {
  return (
    typeof value === 'object' && value !== null && simpleElementSymbol in value
  );
}

type SimpleElement = {
  [simpleElementSymbol]: true;
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

function isSafeForJsxText(text: string) {
  return !/[{}<>]/.test(text);
}

export interface CompilerConfiguration {
  artboard: Sketch.Artboard;
  Blocks: Record<string, BlockDefinition>;
  DesignSystem: string | DesignSystemDefinition;
  target: 'standalone' | 'codesandbox';
}

export function createRenderingEnvironment(
  system: DesignSystemDefinition,
): BlockRenderingEnvironment {
  return {
    h: system.createElement,
    Components: system.components,
  };
}

function findElementNameAndSource(
  element: React.ReactElement,
  DesignSystem: DesignSystemDefinition,
  Components: Map<React.ComponentType, { name: string; source?: string }>,
):
  | {
      name: string;
      element: React.ReactElement;
      source?: string;
    }
  | undefined {
  // This is a DOM element
  if (typeof element.type === 'string') {
    return { name: element.type, element };
  }

  // This is a component exported directly from the design system
  const component = Components.get(element.type);

  if (component) {
    return { ...component, element };
  }

  const protocolComponent = Object.values(DesignSystem.components).find(
    (value) => value === element.type,
  );

  // This is an adapter function that returns a DOM or design system component
  const libraryElement = protocolComponent?.(element.props);

  if (!isValidElement(libraryElement)) return;

  return findElementNameAndSource(libraryElement, DesignSystem, Components);
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
    originalElement: React.ReactElement,
  ): SimpleElement | undefined {
    const elementType = findElementNameAndSource(
      originalElement,
      DesignSystem,
      Components,
    );

    if (!elementType) return;

    const { element, name, source } = elementType;

    return {
      [simpleElementSymbol]: true,
      name,
      source,
      // Filter out children prop and undefined props
      props: Object.fromEntries(
        Object.entries(element.props)
          .filter(
            ([key, value]) =>
              key !== 'children' &&
              !key.startsWith('data-noya-') &&
              value !== undefined,
          )
          .map(([key, value]) => {
            if (React.isValidElement(value)) {
              return [key, createSimpleElement(value)];
            }
            return [key, value];
          }),
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
    [simpleElementSymbol]: true,
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

function buildComponentMap(imports: DesignSystemDefinition['imports']) {
  const Components = new Map<any, { name: string; source: string }>();

  for (const declaration of imports ?? []) {
    for (let [name, value] of Object.entries(declaration.namespace)) {
      Components.set(value, { name, source: declaration.source });
    }
  }

  return Components;
}

function findSource(
  DesignSystem: DesignSystemDefinition,
  componentId: string,
): { source: string; name: string } | undefined {
  const Component = DesignSystem.components[componentId] as
    | React.FC<any>
    | undefined;

  if (!Component) return;

  const importDeclaration = DesignSystem.imports?.find(({ namespace }) =>
    Object.values(namespace).includes(Component),
  );

  if (!importDeclaration) return;

  const name = Object.entries(importDeclaration.namespace).find(
    ([_, value]) => value === Component,
  )?.[0];

  if (!name) return;

  return {
    source: importDeclaration.source,
    name,
  };
}

// We should look this up more dynamically the same way we do for blocks
function findSourceByName(
  DesignSystem: DesignSystemDefinition,
  name: string,
): { source: string; name: string } | undefined {
  const importDeclaration = DesignSystem.imports?.find(({ namespace }) =>
    Object.keys(namespace).includes(name),
  );

  if (!importDeclaration) return;

  return {
    source: importDeclaration.source,
    name,
  };
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

  const getChildren = (
    element: SimpleElement | string,
  ): (string | SimpleElement)[] => {
    if (typeof element === 'string') return [];

    return [
      ...element.children,
      ...Object.values(element.props).filter(isSimpleElement),
    ];
  };

  const fakeRoot: SimpleElement = {
    [simpleElementSymbol]: true,
    name: 'Frame',
    children: components,
    props: {},
  };

  const componentCode = components.map(createElementCode);

  const providerSource = findSource(DesignSystem, component.id.provider);
  const boxSource = findSourceByName(DesignSystem, 'Box');

  const imports = (DesignSystem.imports ?? []).flatMap(({ source }) => {
    const names = unique([
      ...flat(fakeRoot, { getChildren }).flatMap((element) =>
        typeof element !== 'string' && element.source === source
          ? [element.name]
          : [],
      ),
      ...(providerSource?.source === source ? [providerSource.name] : []),
      ...(boxSource?.source === source ? [boxSource.name] : []),
    ]);

    if (names.length === 0) return [];

    return [
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
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

  const func = ts.factory.createFunctionDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    undefined,
    'App',
    undefined,
    [],
    undefined,
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        providerSource
          ? ts.factory.createJsxElement(
              ts.factory.createJsxOpeningElement(
                ts.factory.createIdentifier(providerSource.name),
                undefined,
                ts.factory.createJsxAttributes([]),
              ),
              componentCode,
              ts.factory.createJsxClosingElement(
                ts.factory.createIdentifier(providerSource.name),
              ),
            )
          : ts.factory.createJsxFragment(
              ts.factory.createJsxOpeningFragment(),
              componentCode,
              ts.factory.createJsxJsxClosingFragment(),
            ),
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
    <${boxSource?.name} 
      style={{
        position: 'absolute',
        left: props.left,
        top: props.top,
        width: props.width,
        height: props.height,
      }}
    >
      {props.children}
    </${boxSource?.name}>
  )
}`;

  const files = {
    'App.tsx': format(
      [
        print(imports),
        `import * as React from "react";`,
        frameComponent,
        print(func),
      ].join('\n\n'),
    ),
    '.postcssrc': `{
  "plugins": {
    "tailwindcss": {}
  }
}`,
    'tailwind.config.js': `module.exports = {
  content: ["./*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};`,
    'index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>App</title>
  </head>
  <body>
    <div id="root"></div>
    <link href="./index.css" rel="stylesheet" />
    ${
      configuration.target === 'codesandbox'
        ? '<script src="https://cdn.tailwindcss.com"></script>'
        : ''
    }
    <script type="module" src="index.tsx"></script>
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
        scripts: {
          start: 'parcel index.html --open',
          build: 'parcel build index.html',
        },
        dependencies: allDependencies,
        devDependencies: {
          autoprefixer: '10.4.14',
          parcel: '^2.8.3',
          postcss: '8.4.21',
          tailwindcss: '3.2.7',
          process: '^0.11.10',
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
