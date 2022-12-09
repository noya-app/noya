import { NoyaObject, NoyaSession } from 'noya-backend-client';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
  InputField,
  ScrollArea,
  Spacer,
  TreeView,
} from 'noya-designsystem';
import { CubeIcon, TextIcon } from 'noya-icons';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { IndexPath, withOptions } from 'tree-visit';

const session = new NoyaSession();
session.start('devin');
const channel = session.join('test');

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

type JsonType = 'string' | 'number' | 'boolean' | 'object' | 'array';

type RenderableItem = {
  id: string;
  key: string;
  value: unknown;
  type: JsonType;
  isExpanded?: boolean;
  depth: number;
  indexPath: IndexPath;
  hasChildren: boolean;
};

const NoyaObjectUtils = withOptions({
  getChildren: (item: NoyaObject) => [...item.children],
});

export default function NoyaJsonEditor(): JSX.Element {
  const [flatItems, setFlatItems] = useState<RenderableItem[]>([]);

  useEffect(() => {
    return channel.addListener((event) => {
      if (!channel.root) return;

      const renderableItems: RenderableItem[] = [];

      NoyaObjectUtils.visit(channel.root, (node, indexPath) => {
        // console.log(node.id, node.serialize());
        const key = node.get('key');
        const value = node.get('value');
        const type = node.get('type');

        renderableItems.push({
          id: node.id,
          depth: indexPath.length,
          indexPath: [...indexPath],
          hasChildren: node.children.length > 0,
          isExpanded: true,
          key: typeof key === 'string' ? key : '',
          value: typeof value === 'string' ? value : '',
          type: type as JsonType,
        });
      });

      setFlatItems(renderableItems);
    });
  }, []);

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
                  onSelectMenuItem={(value) => {
                    switch (value) {
                      case 'add-child':
                        const child = channel.objects[item.id]?.createChild();
                        child.set('key', 'a');
                        child.set('value', 'yo');
                        return;
                      case 'delete':
                        channel.objects[item.id]?.destroy();
                        return;
                      case 'set-type-number':
                        channel.objects[item.id]?.set('type', 'number');
                        return;
                      case 'set-type-string':
                        channel.objects[item.id]?.set('type', 'string');
                        return;
                    }
                  }}
                  menuItems={[
                    { value: 'add-child', title: 'Add Child' },
                    { value: 'delete', title: 'Delete' },
                    {
                      title: 'Change Type',
                      items: [
                        { value: 'set-type-string', title: 'String' },
                        { value: 'set-type-number', title: 'Number' },
                      ],
                    },
                  ]}
                  expanded={item.hasChildren ? item.isExpanded : undefined}
                  icon={item.type === 'string' ? <TextIcon /> : <CubeIcon />}
                  selected={selectedId === item.id}
                  id={`tree-${item.id}`}
                  onPress={() => {
                    setSelectedId(item.id);
                  }}
                  onClickChevron={() => {
                    // const newRoot = produce(rootItem, (draft) => {
                    //   const mutableItem = ItemUtils.access(
                    //     draft,
                    //     item.indexPath,
                    //   );
                    //   mutableItem.isExpanded = !mutableItem.isExpanded;
                    // });
                    // setRootItem(newRoot);
                  }}
                >
                  <InputField.Root>
                    <InputField.Input
                      value={item.key}
                      onSubmit={(value) => {
                        channel.objects[item.id]?.set('key', value);
                      }}
                    />
                    <InputField.Input
                      value={typeof item.value === 'string' ? item.value : ''}
                      onSubmit={(value) => {
                        channel.objects[item.id]?.set('value', value);
                      }}
                    />
                  </InputField.Root>
                  <Spacer.Horizontal />
                  {/* <Select<JsonType>
                    id={`select-${item.id}`}
                    value="string"
                    onChange={(value) => {
                      channel.objects[item.id]?.set('type', value);
                    }}
                  >
                    <SelectOption value="string" title="String" />
                    <SelectOption value="number" title="Number" />
                    <SelectOption value="boolean" title="Boolean" />
                    <SelectOption value="array" title="Array" />
                    <SelectOption value="object" title="Object" />
                  </Select> */}
                </TreeView.Row>
              );
            }}
          />
        </ScrollArea>
      </Container>
    </DesignSystemConfigurationProvider>
  );
}
