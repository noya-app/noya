import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { memoize } from 'noya-utils';

const passthroughSymbol = Symbol('passthrough');
const simpleElementSymbol = Symbol('simpleElement');

export type Passthrough = { [passthroughSymbol]: true };

export type SimpleElement = {
  [simpleElementSymbol]: true;
  name: string;
  accessPath?: string[];
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

// Convert from a human-readable name like "Hero with Image" to pascal case "HeroWithImage"
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

export type NamespaceItem = {
  name: string;
  source: string;
  accessPath?: string[];
};

export const buildNamespaceMap = memoize(function buildNamespaceMap(
  imports: DesignSystemDefinition['imports'],
) {
  const namespaceMap = new Map<unknown, NamespaceItem>();

  for (const declaration of imports ?? []) {
    for (let [name, value] of Object.entries(declaration.namespace)) {
      namespaceMap.set(value, { name, source: declaration.source });

      if (typeof value === 'object' && value !== null) {
        for (let [nestedName, nestedValue] of Object.entries(value)) {
          namespaceMap.set(nestedValue, {
            name: name,
            source: declaration.source,
            accessPath: [nestedName],
          });
        }
      }
    }
  }

  return namespaceMap;
});
