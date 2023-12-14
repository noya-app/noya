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
import { buildNamespaceMap } from './common';
import { format, print } from './print';

export type ConvertTransformerContext = {
  namespaceMap: Map<unknown, { name: string; source: string }>;
  imports: { name: string; source: string }[];
};

export function convertTransformer(
  data: any,
  transformer: any,
  context: ConvertTransformerContext,
): ts.Expression {
  function lookupOrGenerate(value: unknown) {
    const result = context.namespaceMap.get(value);

    if (!result) return createExpressionCode(value);

    context.imports.push(result);

    return ts.factory.createIdentifier(result.name);
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
  const imports: { name: string; source: string }[] = [];

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
