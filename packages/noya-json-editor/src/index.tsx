import {
  darkTheme,
  DesignSystemConfigurationProvider,
  ScrollArea,
  TreeView,
} from 'noya-designsystem';
import { CubeIcon, TextIcon } from 'noya-icons';
import * as React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle({
  '*': {
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
  },
  html: {
    width: '100%',
    minHeight: '100vh',
  },
  'body, #root': {
    flex: '1',
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
  },
});

const Container = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
}));

type Item = { id: string; children: Item[]; isExpanded?: boolean };

const rootItem: Item = {
  id: 'root',
  isExpanded: true,
  children: [
    { id: 'hello', children: [] },
    { id: 'world', children: [] },
    {
      id: '123',
      isExpanded: true,
      children: [
        { id: 'foo', children: [] },
        { id: 'bar', children: [] },
      ],
    },
  ],
};

type RenderableItem = Item & { depth: number };

const flattenItems = (item: Item): RenderableItem[] => {
  const result: RenderableItem[] = [];

  const visit = (item: Item, depth: number) => {
    result.push({ ...item, depth });

    if (!item.isExpanded) return;

    item.children.forEach((child) => visit(child, depth + 1));
  };

  visit(item, 0);

  return result;
};

const flatItems = flattenItems(rootItem);

export default function NoyaJsonEditor(): JSX.Element {
  const [selectedId, setSelectedId] = React.useState<string | undefined>(
    undefined,
  );

  return (
    <DesignSystemConfigurationProvider theme={darkTheme} platform={'key'}>
      <GlobalStyles />
      <Container>
        <ScrollArea>
          <TreeView.Root
            data={flatItems}
            sortable
            keyExtractor={(item) => item.id}
            onMoveItem={() => {}}
            acceptsDrop={() => {
              return false;
            }}
            renderItem={(item, index, info) => {
              if (!item) return null;

              return (
                <TreeView.Row
                  key={item.id}
                  depth={item.depth}
                  expanded={
                    item.children.length > 0 ? item.isExpanded : undefined
                  }
                  icon={item.children.length > 0 ? <CubeIcon /> : <TextIcon />}
                  selected={selectedId === item.id}
                  id={`tree-${item.id}`}
                  onPress={() => {
                    setSelectedId(item.id);
                  }}
                >
                  {item.id}
                </TreeView.Row>
              );
            }}
          />
        </ScrollArea>
      </Container>
    </DesignSystemConfigurationProvider>
  );
}
