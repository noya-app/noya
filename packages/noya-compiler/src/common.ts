import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { createElementCode } from 'noya-compiler';
import ts from 'typescript';

const passthroughSymbol = Symbol('passthrough');
const simpleElementSymbol = Symbol('simpleElement');

export type Passthrough = { [passthroughSymbol]: true };

export type SimpleElement = {
  [simpleElementSymbol]: true;
  name: string;
  source?: string;
  props: Record<string, unknown>;
  children: (SimpleElement | string | Passthrough)[];
};

export function isPassthrough(
  value: unknown,
): value is { [passthroughSymbol]: true } {
  return (
    typeof value === 'object' && value !== null && passthroughSymbol in value
  );
}

export function createPassthrough<T extends object>(value: T) {
  return {
    ...value,
    [passthroughSymbol]: true,
  };
}

export function isSimpleElement(value: unknown): value is SimpleElement {
  return (
    typeof value === 'object' && value !== null && simpleElementSymbol in value
  );
}

export function simpleElement<
  T extends Omit<SimpleElement, typeof simpleElementSymbol>,
>(value: T): T & { [simpleElementSymbol]: true } {
  return {
    ...value,
    [simpleElementSymbol]: true,
  };
}

export function createExpressionCode(value: unknown): ts.Expression {
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
} // Convert from a human-readable name like "Hero with Image" to pascal case "HeroWithImage"

export function getComponentNameIdentifier(
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
export function buildNamespaceMap(imports: DesignSystemDefinition['imports']) {
  const namespaceMap = new Map<any, { name: string; source: string }>();

  for (const declaration of imports ?? []) {
    for (let [name, value] of Object.entries(declaration.namespace)) {
      namespaceMap.set(value, { name, source: declaration.source });
    }
  }

  return namespaceMap;
}
