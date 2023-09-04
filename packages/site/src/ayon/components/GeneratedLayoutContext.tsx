import { computed, observe } from '@legendapp/state';
import { useSelector } from '@legendapp/state/react';
import { NoyaAPI, useNoyaClient } from 'noya-api';
import React, { memo } from 'react';
import { parseLayout } from '../../dseditor/componentLayout';
import { ElementHierarchy } from '../../dseditor/traversal';
import { NoyaNode } from '../../dseditor/types';

function findAllQueries(root: NoyaNode) {
  return ElementHierarchy.flatMap(root, (node) => {
    if (node.type !== 'noyaPrimitiveElement') return [];

    const src = node.props.find((prop) => prop.name === 'src');

    if (!src || src.type !== 'generator') return [];

    return [src.query];
  });
}

function replaceAllImages(
  root: NoyaNode,
  images: Record<string, NoyaAPI.RandomImageResponse>,
) {
  return ElementHierarchy.map<NoyaNode>(root, (node, transformedChildren) => {
    if (node.type !== 'noyaPrimitiveElement') return node;

    return {
      ...node,
      children: transformedChildren,
      props: node.props.map((prop) =>
        prop.name === 'src' &&
        prop.type === 'generator' &&
        prop.generator === 'random-image' &&
        !prop.result &&
        images[prop.query]
          ? {
              ...prop,
              result: images[prop.query].url,
              resolvedQuery: prop.query,
            }
          : prop,
      ),
    };
  });
}

class GeneratedLayoutManager {
  constructor(public client: NoyaAPI.Client) {
    observe(() => {
      const layouts = this.layouts$.get();
      const elements = Object.values(layouts)
        .flat()
        .map((generated) => generated.layout);
      const queries = elements.flatMap(findAllQueries);

      queries.forEach((query) => {
        client.random.image({ query, width: 1000, height: 1000 });
      });
    });
  }

  layouts$ = computed(() => {
    const layouts = this.client.generatedLayouts$.get();

    return Object.fromEntries(
      Object.entries(layouts).map(([key, values]) => [
        key,
        values.map((generated) => ({
          provider: generated.provider,
          layout: parseLayout(generated.layout),
        })),
      ]),
    );
  });

  resolvedLayouts$ = computed(() => {
    const layouts = this.layouts$.get();
    const layoutsLoading = this.client.loadingLayouts$.get();
    const images = this.client.randomImages$.get();

    return Object.fromEntries(
      Object.entries(layouts).map(([key, layouts]) => [
        key,
        layouts.map((generated, index) => {
          const queries = findAllQueries(generated.layout);
          const layoutLoading = layoutsLoading[key]?.[index];
          const imagesLoading = queries.some((query) => !images[query]);

          return {
            node: replaceAllImages(generated.layout, images),
            loading: layoutLoading || imagesLoading,
            provider: generated.provider,
          };
        }),
      ]),
    );
  });
}

const GeneratedLayoutContext = React.createContext<
  GeneratedLayoutManager | undefined
>(undefined);

export const GeneratedLayoutProvider = memo(
  ({ children }: { children: React.ReactNode }) => {
    const client = useNoyaClient();

    const manager = React.useMemo(
      () => new GeneratedLayoutManager(client),
      [client],
    );

    return (
      <GeneratedLayoutContext.Provider value={manager}>
        {children}
      </GeneratedLayoutContext.Provider>
    );
  },
);

export function useGeneratedLayoutManager() {
  const manager = React.useContext(GeneratedLayoutContext);

  if (!manager) {
    throw new Error(
      'useGeneratedLayoutManager must be used within a GeneratedLayoutProvider',
    );
  }

  return manager;
}

export function useManagedLayouts() {
  const manager = useGeneratedLayoutManager();

  return useSelector(manager.resolvedLayouts$);
}

export function useManagedLayout(name: string, description: string) {
  const manager = useGeneratedLayoutManager();
  const { componentLayoutCacheKey } = useNoyaClient();
  const key = componentLayoutCacheKey(name, description);
  return useSelector(() => manager.resolvedLayouts$[key].get(true) ?? []);
}
