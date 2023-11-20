import { computed, observe } from '@legendapp/state';
import { useSelector } from '@legendapp/state/react';
import { NoyaAPI, useNoyaClient, useOptionalNoyaClient } from 'noya-api';
import { NoyaGeneratorProp, NoyaNode } from 'noya-component';
import React, { memo } from 'react';
import { parseLayout } from '../../dseditor/componentLayout';
import { ElementHierarchy } from '../../dseditor/traversal';

type Query = {
  query: string;
  type: NoyaGeneratorProp['generator'];
};

function findAllQueries(root: NoyaNode): Query[] {
  return ElementHierarchy.flatMap(root, (node) => {
    if (node.type !== 'noyaPrimitiveElement') return [];

    const src = node.props.find((prop) => prop.name === 'src');

    if (!src || src.type !== 'generator' || src.generator === 'geometric')
      return [];

    return [
      {
        query: src.query,
        type: src.generator,
      },
    ];
  });
}

function replaceAllAssets(
  root: NoyaNode,
  images: Record<string, NoyaAPI.RandomImageResponse>,
  icons: Record<string, { data: string }>,
) {
  return ElementHierarchy.map<NoyaNode>(root, (node, transformedChildren) => {
    if (node.type !== 'noyaPrimitiveElement') return node;

    return {
      ...node,
      children: transformedChildren,
      props: node.props.map((prop) => {
        if (prop.name === 'src' && prop.type === 'generator' && !prop.result) {
          if (prop.generator === 'random-image' && images[prop.query]) {
            return {
              ...prop,
              result: images[prop.query].url,
              resolvedQuery: prop.query,
            };
          } else if (prop.generator === 'random-icon' && icons[prop.query]) {
            return {
              ...prop,
              result: icons[prop.query].data ?? '',
              resolvedQuery: prop.query,
            };
          }
        }

        return prop;
      }),
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

      queries.forEach(({ query, type }) => {
        switch (type) {
          case 'random-image':
            client.random.image({ query, width: 1000, height: 1000 });
            break;
          case 'random-icon':
            client.random.icon({ query });
            break;
        }
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
          layout: parseLayout(generated.layout, generated.imageGenerator),
        })),
      ]),
    );
  });

  resolvedLayouts$ = computed(() => {
    const layouts = this.layouts$.get();
    const layoutsLoading = this.client.loadingLayouts$.get();
    const images = this.client.randomImages$.get();
    const icons = this.client.randomIcons$.get();

    return Object.fromEntries(
      Object.entries(layouts).map(([key, layouts]) => [
        key,
        layouts.map((generated, index) => {
          const queries = findAllQueries(generated.layout);
          const layoutLoading = layoutsLoading[key]?.[index];
          const assetsLoading = queries.some((query) =>
            query.type === 'random-image'
              ? !images[query.query]
              : !icons[query.query],
          );

          return {
            node: replaceAllAssets(generated.layout, images, icons),
            loading: layoutLoading || assetsLoading,
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
    const client = useOptionalNoyaClient();

    const manager = React.useMemo(
      () =>
        new GeneratedLayoutManager(
          client ??
            new NoyaAPI.Client({
              networkClient: new NoyaAPI.MemoryClient(),
            }),
        ),
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
