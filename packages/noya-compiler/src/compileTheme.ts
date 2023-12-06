import {
  DesignSystemDefinition,
  Transformer,
} from '@noya-design-system/protocol';
import { generateImportDeclarations } from 'noya-compiler';
import ts from 'typescript';
import { buildNamespaceMap, createExpressionCode } from './common';
import { format, print } from './print';

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
          const func = namespaceMap.get(transformer.value);

          if (!func) return ts.factory.createNull();

          imports.push(func);

          return ts.factory.createCallExpression(
            ts.factory.createIdentifier(func.name),
            undefined,
            transformer.args.map(convert),
          );
        }
      }
    }

    if (Array.isArray(transformer)) {
      return ts.factory.createArrayLiteralExpression(
        transformer.map((item) => convert(item)),
      );
    }

    if (typeof transformer === 'object' && transformer !== null) {
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

  return format([print(importsAst), print(themeExportAst)].join('\n\n'));
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
