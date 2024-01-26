import {
  DesignSystemDefinition,
  Transformer,
  transform,
} from '@noya-design-system/protocol';
import ts from 'typescript';
import {
  createExpressionCode,
  generateImportDeclarations,
} from './astBuilders';
import { clean } from './clean';
import { NamespaceItem, buildNamespaceMap } from './common';
import { format, print } from './print';

export type ConvertTransformerContext = {
  namespaceMap: Map<unknown, NamespaceItem>;
  imports: { name: string; source: string; as?: string }[];
};

const reservedNames = new Set(['theme']);

export function convertTransformer(
  data: any,
  transformer: any,
  context: ConvertTransformerContext,
): ts.Expression {
  function lookupOrGenerate(value: unknown) {
    // If the value is a primitive, just return it
    if (
      !value ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return createExpressionCode(value);
    }

    const result = context.namespaceMap.get(value);

    if (!result) return createExpressionCode(value);

    let as = result.name;

    if (reservedNames.has(result.name)) {
      as = `_${result.name}`;
    }

    context.imports.push({
      name: result.name,
      source: result.source,
      as,
    });

    if (result.accessPath && result.accessPath.length > 0) {
      return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(as),
        ts.factory.createIdentifier(result.accessPath[0]),
      );
    }

    return ts.factory.createIdentifier(as);
  }

  if (isTransformer(transformer)) {
    switch (transformer.__transformer) {
      case 'access': {
        let path = transformer.path;

        if (isTransformer(path)) {
          path = transform(data, path);
        }

        const result = accessPath(transformer.value ?? data, path as string);

        return lookupOrGenerate(result);
      }
      case 'function': {
        const func = context.namespaceMap.get(transformer.value);

        if (!func) return ts.factory.createNull();

        context.imports.push(func);

        return ts.factory.createCallExpression(
          ts.factory.createIdentifier(func.name),
          undefined,
          transformer.args.map((item) =>
            convertTransformer(data, item, context),
          ),
        );
      }
    }
  }

  if (Array.isArray(transformer)) {
    return ts.factory.createArrayLiteralExpression(
      transformer.map((item) => convertTransformer(data, item, context)),
    );
  }

  if (typeof transformer === 'object' && transformer !== null) {
    return ts.factory.createObjectLiteralExpression(
      Object.entries(transformer).flatMap(([key, value]) => {
        const expression = convertTransformer(data, value, context);

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
 *   { ...theme input object... },
 *   withDefaultColorScheme({ colorScheme: 'primary' }),
 *   { config: { initialColorMode: 'light' } }
 * });
 * ```
 */
export function generateThemeFile(
  DesignSystem: DesignSystemDefinition,
  themeValue: any,
): string {
  if (!DesignSystem.themeTransformer) return '';

  const namespaceMap = buildNamespaceMap(DesignSystem.imports);
  const imports: ConvertTransformerContext['imports'] = [];

  const ast = convertTransformer(themeValue, DesignSystem.themeTransformer, {
    namespaceMap,
    imports,
  });

  const themeExportAst = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('theme'),
          undefined,
          undefined,
          ast,
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );

  const importsAst = generateImportDeclarations(imports);

  return clean(format([print(importsAst), print(themeExportAst)].join('\n\n')));
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

function isTransformer(value: unknown): value is Transformer {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__transformer' in value &&
    (value.__transformer === 'function' || value.__transformer === 'access')
  );
}
