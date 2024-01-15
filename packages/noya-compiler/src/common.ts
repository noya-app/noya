import { memoize } from '@noya-app/noya-utils';
import { DesignSystemDefinition } from '@noya-design-system/protocol';
import React, { isValidElement } from 'react';
import { defineTree } from 'tree-visit';

const passthroughSymbol = Symbol('passthrough');
const simpleElementSymbol = Symbol('simpleElement');

export type Passthrough = { [passthroughSymbol]: true };

export type SimpleElement = {
  [simpleElementSymbol]: true;
  name: string;
  nodePath?: string[];
  accessPath?: string[];
  source?: string;
  props: Record<string, unknown>;
  children: (SimpleElement | string | Passthrough)[];
};

const getSimpleElementChildren = (
  element: SimpleElement['children'][number],
): SimpleElement['children'] => {
  if (isPassthrough(element) || typeof element === 'string') return [];

  return [
    ...element.children,
    ...Object.values(element.props).filter(isSimpleElement),
  ];
};

export const SimpleElementTree = defineTree(getSimpleElementChildren);

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
  format: 'pascal' | 'kebab' | 'camel' = 'pascal',
) {
  return name
    .split(' ')
    .map((word, index) => {
      if (format === 'kebab') return word.toLowerCase();
      if (index === 0 && format === 'camel') return word.toLowerCase();
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

export function sortFiles(
  files: Record<string, string>,
): Record<string, string> {
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
export function findElementNameAndSource(
  element: React.ReactNode,
  DesignSystem: DesignSystemDefinition,
  namespaceMap: Map<unknown, NamespaceItem>,
):
  | {
      name: string;
      element: React.ReactElement;
      source?: string;
      accessPath?: string[];
    }
  | undefined {
  if (!React.isValidElement(element)) return;

  // This is a DOM element
  if (typeof element.type === 'string') {
    return { name: element.type, element };
  }

  // This is a component exported directly from the design system
  const namespaceItem = namespaceMap.get(element.type);

  if (namespaceItem) {
    return { ...namespaceItem, element };
  }

  const protocolComponent = Object.values(DesignSystem.components).find(
    (value) => value === element.type,
  );

  // This is an adapter function that returns a DOM or design system component
  const libraryElement = protocolComponent?.(element.props);

  if (!isValidElement(libraryElement)) return;

  return findElementNameAndSource(libraryElement, DesignSystem, namespaceMap);
}
