import {
  DesignSystemDefinition,
  Transformer,
  component,
} from '@noya-design-system/protocol';
import { DS } from 'noya-api';
import {
  FindComponent,
  createResolvedNode,
  renderResolvedNode,
} from 'noya-component';
import { loadDesignSystem } from 'noya-module-loader';
import { unique } from 'noya-utils';
import prettier from 'prettier';
import prettierTypeScript from 'prettier/parser-typescript';
import React, { ReactNode, isValidElement } from 'react';
import { defineTree, flat } from 'tree-visit';
import ts from 'typescript';
import { LayoutNode, LayoutNodeAttributes } from './parseComponentLayout';
import { removeEmptyStyles } from './removeEmptyStyles';
import { removeUndefinedStyles } from './removeUndefinedStyles';
import { sanitizePackageName } from './validate';

function createExpressionCode(value: unknown): ts.Expression {
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

const passthroughSymbol = Symbol('passthrough');
const simpleElementSymbol = Symbol('simpleElement');

type Passthrough = { [passthroughSymbol]: true };

function isPassthrough(value: unknown): value is { [passthroughSymbol]: true } {
  return (
    typeof value === 'object' && value !== null && passthroughSymbol in value
  );
}

function createPassthrough<T extends object>(value: T) {
  return {
    [passthroughSymbol]: true,
    ...value,
  };
}

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
  children: (SimpleElement | string | Passthrough)[];
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

function isSafeForJsxText(text: string) {
  return !/[{}<>]/.test(text);
}

export interface CompilerConfiguration {
  name: string;
  ds: DS;
  designSystemDefinition: DesignSystemDefinition;
  target: 'standalone' | 'codesandbox';
}

function findElementNameAndSource(
  element: React.ReactNode,
  DesignSystem: DesignSystemDefinition,
  Components: Map<React.ComponentType, { name: string; source?: string }>,
):
  | {
      name: string;
      element: React.ReactElement;
      source?: string;
    }
  | undefined {
  if (!React.isValidElement(element)) return;

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

export function createSimpleElement(
  originalElement: React.ReactNode,
  DesignSystem: DesignSystemDefinition,
): SimpleElement | undefined {
  const Components = buildComponentMap(DesignSystem.imports);

  const elementType = findElementNameAndSource(
    originalElement,
    DesignSystem,
    Components,
  );

  if (!elementType) return;

  const { element, name, source } = elementType;

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
            !key.startsWith('data-') &&
            value !== undefined,
        )
        .map(([key, value]) => {
          if (React.isValidElement(value)) {
            return [key, createSimpleElement(value, DesignSystem)];
          }
          return [key, value];
        }),
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

export function createReactComponentDeclaration(
  name: string,
  resolvedElement: SimpleElement,
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
    ts.factory.createBlock([
      ts.factory.createReturnStatement(createElementCode(resolvedElement)),
    ]),
  );
}

const getChildren = (
  element: SimpleElement['children'][number],
): SimpleElement['children'] => {
  if (isPassthrough(element) || typeof element === 'string') return [];

  return [
    ...element.children,
    ...Object.values(element.props).filter(isSimpleElement),
  ];
};

// Convert from a human-readable name like "Hero with Image" to pascal case "HeroWithImage"
function getComponentNameIdentifier(
  name: string,
  format: 'pascal' | 'kebab' = 'pascal',
) {
  return name
    .split(' ')
    .map((word) => {
      if (format === 'kebab') return word.toLowerCase();
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(format === 'kebab' ? '-' : '')
    .replace(/[^a-zA-Z0-9\-_]/g, '');
}

export async function compileAsync(
  configuration: Omit<CompilerConfiguration, 'designSystemDefinition'> & {
    designSystemDefinition?: DesignSystemDefinition;
  },
) {
  const DesignSystem =
    configuration.designSystemDefinition ??
    (await loadDesignSystem(configuration.ds.source.name));

  return compile({
    ...configuration,
    designSystemDefinition: DesignSystem,
  });
}

function extractImports(
  simpleElement: SimpleElement,
  DesignSystem: DesignSystemDefinition,
) {
  return (DesignSystem.imports ?? []).flatMap(({ source, alwaysInclude }) => {
    const names = unique(
      flat(simpleElement, { getChildren }).flatMap((element) =>
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

function isTransformer(value: unknown): value is Transformer {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__transformer' in value &&
    (value.__transformer === 'function' || value.__transformer === 'access')
  );
}

function accessPath(data: any, path: string): any {
  if (path === '.') return data;
  const parts = path.split('.');
  let currentValue = data;
  for (let part of parts) {
    currentValue = currentValue[part];
  }
  return currentValue;
}

/**
 * Takes an input like:
 *
 * ```ts
 * const themeTransformer = x.f(extendTheme, [
 *   x.a("theme"),
 *   x.f(withDefaultColorScheme, [{ colorScheme: "primary" }]),
 *   { config: { initialColorMode: x.a("theme.colorMode") } },
 * ])
 * ```
 *
 * And returns:
 *
 * ```ts
 * import { extendTheme } from "@chakra-ui/react";
 *
 * export const theme = extendTheme({
 *   config: {
 *     initialColorMode: "dark",
 *     useSystemColorMode: false,
 *   },
 * });
 * ```
 */
export function generateThemeTransformer(
  config: DS['config'],
  DesignSystem: DesignSystemDefinition,
  themeValue: any,
) {
  if (!DesignSystem.themeTransformer) return {};

  const Components = buildComponentMap(DesignSystem.imports);

  function convert(transformer: any): ts.Expression {
    if (isTransformer(transformer)) {
      switch (transformer.__transformer) {
        case 'access': {
          return createExpressionCode(
            accessPath(
              transformer.value ?? themeValue,
              transformer.path as string,
            ),
          );
        }
        case 'function': {
          const func = Components.get(transformer.value);

          if (!func) return ts.factory.createNull();

          // Return ts call expression using func.name as the function name
          return ts.factory.createCallExpression(
            ts.factory.createIdentifier(func.name),
            undefined,
            transformer.args.map(convert),
          );
        }
      }
    }

    if (Array.isArray(transformer)) {
      // return transformer.map((t) => transform(data, t));
      return ts.factory.createArrayLiteralExpression(
        transformer.map((item) => convert(item)),
      );
    }

    if (typeof transformer === 'object' && transformer !== null) {
      // return Object.fromEntries(
      //   Object.entries(transformer).map(([key, value]) => [
      //     key,
      //     transform(data, value),
      //   ])
      // );

      return ts.factory.createObjectLiteralExpression(
        Object.entries(transformer).flatMap(([key, value]) => {
          const expression = convert(value);

          return [
            ts.factory.createPropertyAssignment(
              ts.factory.createIdentifier(key),
              expression,
            ),
          ];
        }),
      );
    }

    return createExpressionCode(transformer);
  }

  const ast = convert(DesignSystem.themeTransformer);

  return format(print(ast));
}

export function compile(configuration: CompilerConfiguration) {
  const DesignSystem = configuration.designSystemDefinition;

  const findComponent: FindComponent = (componentID) => {
    return configuration.ds.components?.find(
      (component) => component.componentID === componentID,
    );
  };

  const componentPageItems = (configuration.ds.components ?? []).map(
    (component) => {
      const noyaComponent = findComponent(component.componentID);

      if (!noyaComponent) {
        throw new Error(
          `Could not find component with id ${component.componentID}`,
        );
      }

      const resolvedNode = createResolvedNode(
        findComponent,
        noyaComponent.rootElement,
      );

      const simpleElement = createSimpleElement(
        renderResolvedNode({
          contentEditable: false,
          disableTabNavigation: false,
          includeDataProps: true,
          system: DesignSystem,
          dsConfig: configuration.ds.config,
          resolvedNode,
        }),
        DesignSystem,
      );

      if (!simpleElement) {
        throw new Error('Could not create simple element');
      }

      const func = createReactComponentDeclaration(
        getComponentNameIdentifier(component.name),
        simpleElement,
      );

      const dependencies = (DesignSystem.imports ?? []).reduce(
        (result, importDeclaration) => ({
          ...result,
          ...importDeclaration.dependencies,
        }),
        DesignSystem.dependencies ?? {},
      );

      const devDependencies = (DesignSystem.imports ?? []).reduce(
        (result, importDeclaration) => ({
          ...result,
          ...importDeclaration.devDependencies,
        }),
        DesignSystem.devDependencies ?? {},
      );

      const imports = extractImports(simpleElement, DesignSystem);

      const source = ["'use client'", print(imports), print(func)]
        .map(clean)
        .join('\n');

      return {
        name: component.name,
        source,
        dependencies,
        devDependencies,
      };
    },
  );

  const allDependencies = componentPageItems.reduce(
    (result, { dependencies }) => ({ ...result, ...dependencies }),
    {},
  );

  const allDevDependencies = componentPageItems.reduce(
    (result, { devDependencies }) => ({ ...result, ...devDependencies }),
    {},
  );

  const layoutElement = createSimpleElement(
    DesignSystem.createElement(
      DesignSystem.components[component.id.NextProvider],
      {},
      DesignSystem.createElement(
        DesignSystem.components[component.id.Provider],
        {},
        createPassthrough(
          ts.factory.createJsxExpression(
            undefined,
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('props'),
              ts.factory.createIdentifier('children'),
            ),
          ),
        ),
      ),
    ),
    DesignSystem,
  );
  const layoutComponentFunc = createReactComponentDeclaration(
    'NextProvider',
    layoutElement!,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        ts.factory.createIdentifier('props'),
        undefined,
        // Type React.PropsWithChildren<{}>
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier('React.PropsWithChildren'),
          [
            // Empty object type
            ts.factory.createTypeLiteralNode([]),
          ],
        ),
        undefined,
      ),
    ],
  );

  const layoutImports = extractImports(layoutElement!, DesignSystem);

  const layoutSource = [
    "'use client'",
    "import React from 'react'\n" + print(layoutImports),
    print(layoutComponentFunc),
  ]
    .map(clean)
    .join('\n');

  const files = {
    ...Object.fromEntries(
      componentPageItems.map(({ name, source }) => [
        `src/app/components/${getComponentNameIdentifier(
          name,
          'kebab',
        )}/page.tsx`,
        source,
      ]),
    ),
    'src/app/components/layout.tsx': layoutSource,
    'package.json': JSON.stringify(
      {
        name: sanitizePackageName(configuration.name),
        version: '0.0.1',
        scripts: {},
        dependencies: allDependencies,
        devDependencies: allDevDependencies,
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

export function clean(text: string) {
  const sourceFile = ts.createSourceFile(
    'temp.tsx',
    text,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  );

  const updated = removeEmptyStyles(removeUndefinedStyles(sourceFile));

  return format(print(updated));
}

export * from './codesandbox';
export * from './parseComponentLayout';

export const LayoutHierarchy = defineTree<LayoutNode | string>({
  getChildren: (node) => (typeof node === 'string' ? [] : node.children),
}).withOptions({
  create: (node: LayoutNode | string, children: (LayoutNode | string)[]) => {
    return typeof node === 'string' ? node : { ...node, children };
  },
});

export function layoutNode(
  tag: string,
  attributes: LayoutNodeAttributes = {},
  children: (LayoutNode | string)[] = [],
): LayoutNode {
  return { tag, attributes, children };
}
