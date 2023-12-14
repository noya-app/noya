import {
  DesignSystemDefinition,
  Theme,
  component,
} from '@noya-design-system/protocol';
import { path } from 'imfs';
import { DS } from 'noya-api';
import {
  FindComponent,
  createResolvedNode,
  renderResolvedNode,
} from 'noya-component';
import { loadDesignSystem } from 'noya-module-loader';
import { tailwindColors } from 'noya-tailwind';
import { unique } from 'noya-utils';
import React, { ReactNode, isValidElement } from 'react';
import { flat } from 'tree-visit';
import ts from 'typescript';
import {
  createElementCode,
  createReactComponentDeclaration,
} from './astBuilders';
import { clean } from './clean';
import {
  SimpleElement,
  buildNamespaceMap,
  createPassthrough,
  getComponentNameIdentifier,
  isPassthrough,
  isSimpleElement,
  simpleElement,
} from './common';
import { generateThemeFile } from './compileTheme';
import { print } from './print';
import { sanitizePackageName } from './validate';

export interface CompilerConfiguration {
  name: string;
  ds: DS;
  resolvedDefinitions: Record<string, DesignSystemDefinition>;
}

type ResolvedCompilerConfiguration = CompilerConfiguration & {
  designSystemDefinition: DesignSystemDefinition;
};

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

const getChildren = (
  element: SimpleElement['children'][number],
): SimpleElement['children'] => {
  if (isPassthrough(element) || typeof element === 'string') return [];

  return [
    ...element.children,
    ...Object.values(element.props).filter(isSimpleElement),
  ];
};

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

function createLayoutSource(DesignSystem: DesignSystemDefinition): {
  source: string;
} {
  const cssImport = "import './globals.css'";

  const defaultLayout = `${cssImport}

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
  return children;
}
`;

  const providerElement = DesignSystem.components[component.id.Provider]
    ? DesignSystem.createElement(
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
      )
    : null;

  const nextProviderElement = DesignSystem.components[component.id.NextProvider]
    ? DesignSystem.createElement(
        DesignSystem.components[component.id.NextProvider],
        {},
        providerElement,
      )
    : providerElement;

  if (!nextProviderElement) return { source: defaultLayout };

  const layoutElement = createSimpleElement(nextProviderElement, DesignSystem);

  if (!layoutElement) return { source: defaultLayout };

  const layoutComponentFunc = createReactComponentDeclaration(
    'NextProvider',
    createElementCode(layoutElement),
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

  const layoutImports = extractImports(layoutElement, DesignSystem);

  const layoutSource = [
    "'use client'",
    [
      cssImport,
      "import React from 'react'",
      print(layoutImports),
      'import { theme } from "./theme"',
    ].join('\n'),
    print(layoutComponentFunc),
  ]
    .map(clean)
    .join('\n');

  return {
    source: layoutSource,
  };
}

export function compileDesignSystem(
  configuration: ResolvedCompilerConfiguration & {
    includeTailwindBase: boolean;
  },
): {
  files: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
} {
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
          stylingMode: 'tailwind',
        }),
        DesignSystem,
      );

      if (!simpleElement) {
        throw new Error('Could not create simple element');
      }

      const func = createReactComponentDeclaration(
        getComponentNameIdentifier(component.name),
        createElementCode(simpleElement),
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

  const layoutSource = createLayoutSource(DesignSystem);

  const theme: Theme = {
    colorMode: configuration.ds.config.colorMode ?? 'light',
    colors: {
      primary: (tailwindColors as any)[configuration.ds.config.colors.primary],
      neutral: tailwindColors.slate,
    },
  };

  const themeFile = generateThemeFile(DesignSystem, { theme });

  const tailwindLayers = [
    ...(configuration.includeTailwindBase ? ['base'] : []),
    'components',
    'utilities',
  ];

  const files = {
    'globals.css': tailwindLayers
      .map((layer) => `@tailwind ${layer};`)
      .join('\n'),
    ...Object.fromEntries(
      componentPageItems.map(({ name, source }) => [
        `${getComponentNameIdentifier(name, 'kebab')}/page.tsx`,
        source,
      ]),
    ),
    'theme.ts': themeFile,
    ...(layoutSource ? { 'layout.tsx': layoutSource.source } : {}),
  };

  return {
    files: sortFiles(files),
    dependencies: allDependencies,
    devDependencies: allDevDependencies,
  };
}

export function compile(configuration: CompilerConfiguration) {
  const allDefinitions = Object.keys(configuration.resolvedDefinitions);

  const allDSFiles: Record<string, string> = {};
  const allDependencies: Record<string, string> = {};
  const allDevDependencies: Record<string, string> = {};

  for (const name of allDefinitions) {
    const {
      files: dsFiles,
      dependencies,
      devDependencies,
    } = compileDesignSystem({
      ...configuration,
      designSystemDefinition: configuration.resolvedDefinitions[name],
      includeTailwindBase: name === 'vanilla',
    });

    const basename = path.basename(name);

    Object.assign(
      allDSFiles,
      addPathPrefix(dsFiles, `src/app/${basename}/components/`),
    );
    Object.assign(allDependencies, dependencies);
    Object.assign(allDevDependencies, devDependencies);
  }

  const files = {
    ...allDSFiles,
    'src/app/layout.tsx': `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`,
    'src/app/page.tsx': clean(`import Link from 'next/link'

export default function Page() {
  return (
    <div>
      <h1 className="text-4xl">Components</h1>
      <ul>
        ${Object.keys(allDSFiles)
          .filter((path) => path.endsWith('/page.tsx'))
          .map((p) => {
            const url = p.replace('src/app', '').replace('/page.tsx', '');
            return `<li><Link href="${url}">${url}</Link></li>`;
          })
          .join('\n')}
      </ul>
    </div>
  )
}`),
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

  return sortFiles(files);
}

export async function compileAsync(
  configuration: Omit<CompilerConfiguration, 'resolvedDefinitions'> & {
    definitions: string[];
  },
) {
  const resolvedDefinitions = Object.fromEntries(
    await Promise.all(
      configuration.definitions.map(async (name) => [
        name,
        await loadDesignSystem(name),
      ]),
    ),
  );

  return compile({
    ...configuration,
    resolvedDefinitions,
  });
}

function sortFiles(files: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files).sort(([a], [b]) => {
      // First compare the directory depth
      const depthA = a.split('/').length;
      const depthB = b.split('/').length;

      if (depthA !== depthB) return depthA - depthB;

      return a.localeCompare(b);
    }),
  );
}

function addPathPrefix(
  files: Record<string, string>,
  prefix: string,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files).map(([key, value]) => [prefix + key, value]),
  );
}
