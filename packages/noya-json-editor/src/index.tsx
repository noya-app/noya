import produce from 'immer';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
  InputField,
  ScrollArea,
  Select,
  SelectOption,
  Spacer,
  TreeView,
} from 'noya-designsystem';
import { CubeIcon, TextIcon } from 'noya-icons';
import * as React from 'react';
import { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { IndexPath, withOptions } from 'tree-visit';

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

const ItemUtils = withOptions({
  getChildren: (item: Item) => item.children,
});

const initialRootItem: Item = {
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

type RenderableItem = Item & { depth: number; indexPath: IndexPath };

const flattenItems = (item: Item): RenderableItem[] => {
  const result: RenderableItem[] = [];

  ItemUtils.visit(item, {
    onEnter(node, indexPath) {
      result.push({
        ...node,
        depth: indexPath.length,
        indexPath: [...indexPath],
      });
      if (node.isExpanded === false) return 'skip';
    },
  });

  return result;
};

export default function NoyaJsonEditor(): JSX.Element {
  const [rootItem, setRootItem] = useState(initialRootItem);
  const flatItems = flattenItems(rootItem);
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
                  onClickChevron={() => {
                    const newRoot = produce(rootItem, (draft) => {
                      const mutableItem = ItemUtils.access(
                        draft,
                        item.indexPath,
                      );

                      mutableItem.isExpanded = !mutableItem.isExpanded;
                    });

                    setRootItem(newRoot);
                  }}
                >
                  <InputField.Root>
                    <InputField.Input
                      value={item.id}
                      onSubmit={(value) => {
                        const newRoot = produce(rootItem, (draft) => {
                          const mutableItem = ItemUtils.access(
                            draft,
                            item.indexPath,
                          );

                          mutableItem.id = value;
                        });

                        setRootItem(newRoot);
                      }}
                    />
                  </InputField.Root>
                  <Spacer.Horizontal />
                  <Select id={`select-${item.id}`} value="string">
                    <SelectOption value="string" title="String" />
                    <SelectOption value="number" title="Number" />
                    <SelectOption value="boolean" title="Boolean" />
                  </Select>
                </TreeView.Row>
              );
            }}
          />
        </ScrollArea>
      </Container>
    </DesignSystemConfigurationProvider>
  );
}
