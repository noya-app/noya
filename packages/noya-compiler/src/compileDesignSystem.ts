import { tailwindColors } from '@noya-app/noya-tailwind';
import {
  DesignSystemDefinition,
  Theme,
  component,
  transform,
} from '@noya-design-system/protocol';
import { DSConfig } from 'noya-api';
import {
  FindComponent,
  NoyaComponent,
  NoyaResolvedNode,
  createNoyaDSRenderingContext,
  createResolvedNode,
  renderResolvedNode,
} from 'noya-component';
import React, { CSSProperties, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import {
  createElementCode,
  createReactComponentDeclaration,
  createSimpleElement,
  extractImports,
} from './astBuilders';
import { clean } from './clean';
import {
  SimpleElement,
  SimpleElementTree,
  createPassthrough,
  getComponentNameIdentifier,
  isPassthrough,
  isSimpleElement,
  sortFiles,
} from './common';
import { generateThemeFile } from './compileTheme';
import { formatCSS, formatHTML, print } from './print';
import { buildStyleSheet, compileCSS } from './styles';
import { ResolvedCompilerConfiguration } from './types';

export type ExportType =
  | 'html-css'
  | 'html-tailwind'
  | 'react'
  | 'react-css'
  | 'react-css-modules'
  | 'react-tailwind';

export type ExportMap = Partial<Record<ExportType, Record<string, string>>>;

export type CompileDesignSystemConfiguration = ResolvedCompilerConfiguration & {
  includeTailwindBase: boolean;
  spreadTheme: boolean;
  exportTypes: ExportType[];
};

export function compileDesignSystem(
  configuration: CompileDesignSystemConfiguration,
): {
  files: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  allExportMap: Record<string, ExportMap>;
} {
  const DesignSystem = configuration.designSystemDefinition;

  const findComponent: FindComponent = (componentID) => {
    return configuration.ds.components?.find(
      (component) => component.componentID === componentID,
    );
  };

  const filterComponents = configuration.filterComponents ?? (() => true);

  const theme = {
    colorMode: configuration.ds.config.colorMode ?? 'light',
    primaryColor: configuration.ds.config.colors.primary ?? 'blue',
    neutralColor: 'slate',
    colors: {
      primary: (tailwindColors as any)[configuration.ds.config.colors.primary],
      neutral: tailwindColors.slate,
    },
  };

  const componentPageItems = (configuration.ds.components ?? [])
    .filter(filterComponents)
    .filter((component) => component.accessModifier !== 'internal')
    .map((component) => {
      const noyaComponent = findComponent(component.componentID);

      if (!noyaComponent) {
        throw new Error(
          `Could not find component with id ${component.componentID}`,
        );
      }

      const resolvedNode = createResolvedNode({
        findComponent,
        node: noyaComponent.rootElement,
      });

      const reactNode = renderResolvedNode({
        contentEditable: false,
        disableTabNavigation: false,
        includeDataProps: true,
        system: DesignSystem,
        dsConfig: configuration.ds.config,
        resolvedNode,
        stylingMode: 'tailwind-resolved',
        theme,
      });

      const simpleElement = createSimpleElement(reactNode, DesignSystem);

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

      const exportMap = createExport({
        component,
        simpleElement,
        resolvedNode,
        findComponent,
        configuration,
        source,
        imports,
      });

      return {
        name: component.name,
        source,
        dependencies,
        devDependencies,
        exportMap,
      };
    });

  const allDependencies = componentPageItems.reduce(
    (result, { dependencies }) => ({ ...result, ...dependencies }),
    {},
  );

  const allDevDependencies = componentPageItems.reduce(
    (result, { devDependencies }) => ({ ...result, ...devDependencies }),
    {},
  );

  const allExportMap = componentPageItems.reduce(
    (result, { name, exportMap }) => {
      result[getComponentNameIdentifier(name, 'kebab')] = exportMap;
      return result;
    },
    {} as Record<string, ExportMap>,
  );

  const layoutSource = createLayoutSource({
    DesignSystem,
    spreadTheme: configuration.spreadTheme,
    _noya: createNoyaDSRenderingContext({
      theme,
      dsConfig: configuration.ds.config,
      stylingMode: 'tailwind-resolved',
    }),
  });

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
    'layout.tsx': layoutSource.source,
  };

  return {
    files: sortFiles(files),
    dependencies: allDependencies,
    devDependencies: allDevDependencies,
    allExportMap,
  };
}

function createReactTailwindExport({
  component,
  source,
}: {
  component: NoyaComponent;
  source: string;
}): Record<string, string> {
  return {
    [getComponentNameIdentifier(component.name, 'kebab') + '.tsx']: source
      .replace(/'use client';?/, '')
      .trim(),
  };
}

function createHTMLTailwindExport({
  component,
  simpleElement,
}: {
  component: NoyaComponent;
  simpleElement: SimpleElement;
}): Record<string, string> {
  const cleanedReactNode = SimpleElementTree.map(
    simpleElement,
    (node, transformedChildren, indexPath) => {
      if (typeof node === 'string') return node;
      if (isPassthrough(node)) return node;
      return React.createElement(
        node.name,
        { ...node.props, key: indexPath.join('/') },
        transformedChildren.length > 0 ? transformedChildren : undefined,
      );
    },
  );

  return {
    [getComponentNameIdentifier(component.name, 'kebab') + '.html']: formatHTML(
      renderToStaticMarkup(cleanedReactNode as ReactElement),
    ).trim(),
  };
}

function createHTMLCSSExport({
  component,
  simpleElement,
  resolvedNode,
  findComponent,
}: {
  component: NoyaComponent;
  simpleElement: SimpleElement;
  resolvedNode: NoyaResolvedNode;
  findComponent: FindComponent;
}): Record<string, string> {
  const { styleRules, simpleElementToClassName } = compileCSS({
    simpleElement,
    component,
    resolvedNode,
    findComponent,
    mode: 'css',
  });

  const cleanedReactNode = SimpleElementTree.map(
    simpleElement,
    (node, transformedChildren, indexPath) => {
      if (typeof node === 'string') return node;
      if (isPassthrough(node)) return node;

      const className = simpleElementToClassName.get(node);

      const { style, ...props } = node.props;

      return React.createElement(
        node.name,
        { key: indexPath.join('/'), ...props, className },
        transformedChildren.length > 0 ? transformedChildren : undefined,
      );
    },
  );

  return {
    [getComponentNameIdentifier(component.name, 'kebab') + '.html']: formatHTML(
      renderToStaticMarkup(cleanedReactNode as ReactElement),
    ).trim(),
    [getComponentNameIdentifier(component.name, 'kebab') + '.css']: formatCSS(
      buildStyleSheet(styleRules),
    ),
  };
}

export function createReactCSSExport({
  component,
  simpleElement,
  resolvedNode,
  findComponent,
  imports,
  mode,
}: {
  component: NoyaComponent;
  simpleElement: SimpleElement;
  resolvedNode: NoyaResolvedNode;
  findComponent: FindComponent;
  imports: ts.ImportDeclaration[];
  mode: 'css-modules' | 'css';
}): Record<string, string> {
  const { styleRules, simpleElementToClassName } = compileCSS({
    simpleElement,
    component,
    resolvedNode,
    findComponent,
    mode,
  });

  const cleanedSimpleElement = SimpleElementTree.map<
    SimpleElement['children'][number]
  >(simpleElement, (node, transformedChildren, indexPath) => {
    if (typeof node === 'string') return node;
    if (isPassthrough(node)) return node;

    const className = simpleElementToClassName.get(node);

    const { style, ...props } = node.props;

    if (!className) {
      return {
        ...node,
        props,
        children: transformedChildren,
      };
    }

    return {
      ...node,
      props: {
        ...props,
        className:
          mode === 'css-modules'
            ? createPassthrough(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier('styles'),
                  ts.factory.createIdentifier(className ?? '_'),
                ),
              )
            : className,
      },
      children: transformedChildren,
    };
  }) as SimpleElement;

  const func = createReactComponentDeclaration(
    getComponentNameIdentifier(component.name),
    createElementCode(cleanedSimpleElement),
  );

  const cssFileName =
    getComponentNameIdentifier(component.name, 'kebab') +
    (mode === 'css-modules' ? '.module' : '') +
    '.css';

  const source = [
    print(imports),
    mode === 'css-modules'
      ? `import styles from './${cssFileName}'`
      : `import './${cssFileName}'`,
    print(func),
  ]
    .map(clean)
    .join('\n');

  return {
    [getComponentNameIdentifier(component.name, 'kebab') + '.tsx']:
      source.trim(),
    [cssFileName]: formatCSS(buildStyleSheet(styleRules)),
  };
}

function createExport({
  component,
  simpleElement,
  resolvedNode,
  findComponent,
  configuration,
  source,
  imports,
}: {
  component: NoyaComponent;
  simpleElement: SimpleElement;
  resolvedNode: NoyaResolvedNode;
  findComponent: FindComponent;
  configuration: CompileDesignSystemConfiguration;
  source: string;
  imports: ts.ImportDeclaration[];
}) {
  const exportMap: ExportMap = {};

  for (let exportType of configuration.exportTypes) {
    switch (exportType) {
      case 'react':
      case 'react-tailwind':
        exportMap[exportType] = createReactTailwindExport({
          component,
          source,
        });
        break;
      case 'react-css-modules':
      case 'react-css':
        exportMap[exportType] = createReactCSSExport({
          component,
          simpleElement,
          resolvedNode,
          findComponent,
          imports,
          mode: exportType === 'react-css-modules' ? 'css-modules' : 'css',
        });
        break;
      case 'html-tailwind':
        exportMap[exportType] = createHTMLTailwindExport({
          component,
          simpleElement,
        });
        break;
      case 'html-css':
        exportMap[exportType] = createHTMLCSSExport({
          component,
          simpleElement,
          resolvedNode,
          findComponent,
        });
        break;
    }
  }

  return exportMap;
}

export function createLayoutSource({
  DesignSystem,
  _noya,
  spreadTheme,
}: {
  DesignSystem: DesignSystemDefinition;
  _noya: { theme: Theme; dsConfig: DSConfig };
  spreadTheme: boolean;
}): {
  source: string;
} {
  const cssImport = "import './globals.css'";

  const defaultLayout = `${cssImport}

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
  return children;
}
`;

  const childrenPassthrough = createPassthrough(
    ts.factory.createJsxExpression(
      undefined,
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('props'),
        ts.factory.createIdentifier('children'),
      ),
    ),
  );

  const providerElement = DesignSystem.components[component.id.Provider]
    ? DesignSystem.components[component.id.Provider]({
        theme: createPassthrough(
          spreadTheme
            ? transform({ theme: _noya.theme }, DesignSystem.themeTransformer)
            : ts.factory.createIdentifier('theme'),
        ),
        children: childrenPassthrough,
        ...(_noya && { _noya }),
      })
    : null;

  const nextProviderElement = DesignSystem.components[component.id.NextProvider]
    ? DesignSystem.components[component.id.NextProvider]({
        children: providerElement || childrenPassthrough,
        ...(_noya && { _noya }),
      })
    : providerElement;

  if (!nextProviderElement) return { source: defaultLayout };

  const layoutElement = createSimpleElement(nextProviderElement, DesignSystem);

  if (!layoutElement) return { source: defaultLayout };

  const fonts = SimpleElementTree.reduce<string[]>(
    layoutElement,
    (result, node) => {
      if (!isSimpleElement(node)) return result;

      const style = node.props.style as CSSProperties | undefined;
      const fontFamily = style?.fontFamily;

      if (!fontFamily) return result;

      delete style.fontFamily;

      node.props.className = createPassthrough(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier('font' + fontFamily),
          ts.factory.createIdentifier('className'),
        ),
      );

      return [...result, fontFamily];
    },
    [],
  );

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
      ...(fonts.length > 0
        ? [`import { ${fonts.join(', ')} } from "next/font/google";`]
        : []),
      ...(spreadTheme ? [] : ['import { theme } from "./theme"']),
    ].join('\n'),
    ...fonts.map(
      (font) => `const font${font} = ${font}({ subsets: ["latin"] })`,
    ),
    print(layoutComponentFunc),
  ]
    .map(clean)
    .join('\n');

  return {
    source: layoutSource,
  };
}
