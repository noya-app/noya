import {
  DesignSystemDefinition,
  Theme,
  component,
} from '@noya-design-system/protocol';
import { DS } from 'noya-api';
import {
  FindComponent,
  createResolvedNode,
  renderResolvedNode,
} from 'noya-component';
import { loadDesignSystem } from 'noya-module-loader';
import { tailwindColors } from 'noya-tailwind';
import { groupBy, unique } from 'noya-utils';
import React, { ReactNode, isValidElement } from 'react';
import { defineTree, flat } from 'tree-visit';
import ts from 'typescript';
import {
  SimpleElement,
  buildNamespaceMap,
  createExpressionCode,
  createPassthrough,
  getComponentNameIdentifier,
  isPassthrough,
  isSimpleElement,
  simpleElement,
} from './common';
import { generateThemeFile } from './compileTheme';
import { LayoutNode, LayoutNodeAttributes } from './parseComponentLayout';
import { removeEmptyStyles } from './passes/removeEmptyStyles';
import { removeUndefinedStyles } from './passes/removeUndefinedStyles';
import { format, print } from './print';
import { sanitizePackageName } from './validate';

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
  const Components = buildNamespaceMap(DesignSystem.imports);

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

  return simpleElement({
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
  });
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
        {
          theme: createPassthrough(ts.factory.createIdentifier('theme')),
        },
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
    [
      "import React from 'react'",
      print(layoutImports),
      'import { theme } from "./theme"',
    ].join('\n'),
    print(layoutComponentFunc),
  ]
    .map(clean)
    .join('\n');

  const theme: Theme = {
    colorMode: configuration.ds.config.colorMode ?? 'light',
    colors: {
      primary: (tailwindColors as any)[configuration.ds.config.colors.primary],
      neutral: tailwindColors.slate,
    },
  };

  const themeFile = generateThemeFile(DesignSystem, { theme });

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
    'src/app/components/theme.ts': themeFile,
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
export * from './print';

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
