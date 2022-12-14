import { NoyaSession } from 'noya-backend-client';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
  InputField,
  RelativeDropPosition,
  ScrollArea,
  Spacer,
  TreeView,
} from 'noya-designsystem';
import {
  CubeIcon,
  LayoutIcon,
  PlusCircledIcon,
  SwitchIcon,
  TextIcon,
  ValueNoneIcon,
} from 'noya-icons';
import { serialize, visit } from 'noya-object-utils';
import { isDeepEqual, unique } from 'noya-utils';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { IndexPath } from 'tree-visit';
import { noyaJsonObjectSchema } from './schema';

const session = new NoyaSession('Sam');
// const session = new NoyaSession('Sam', 'http://149.28.218.149');
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

type JsonType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';

function getJsonTypeIcon(type: JsonType) {
  switch (type) {
    case 'string':
      return <TextIcon />;
    case 'number':
      return <PlusCircledIcon />;
    case 'boolean':
      return <SwitchIcon />;
    case 'object':
      return <CubeIcon />;
    case 'array':
      return <LayoutIcon />;
    case 'null':
      return <ValueNoneIcon />;
  }
}

type RenderableItem = {
  id: string;
  key: string;
  value: unknown;
  type: JsonType;
  parentType?: JsonType;
  isExpanded?: boolean;
  depth: number;
  indexPath: IndexPath;
  hasChildren: boolean;
};

export default function NoyaJsonEditor(): JSX.Element {
  const [flatItems, setFlatItems] = useState<RenderableItem[]>([]);

  useEffect(() => {
    return channel.addListener((event) => {
      if (!channel.root) return;

      const renderableItems: RenderableItem[] = [];

      visit(channel.root, (node, indexPath) => {
        const parent = node.parent
          ? noyaJsonObjectSchema.parse(serialize(node.parent))
          : undefined;
        const object = noyaJsonObjectSchema.parse(serialize(node));

        renderableItems.push({
          id: node.id,
          depth: indexPath.length,
          indexPath: [...indexPath],
          hasChildren: node.children.length > 0,
          isExpanded: true,
          key: object.key,
          value: 'value' in object ? object.value : null,
          type: object.type,
          parentType: parent?.type,
        });
      });

      setFlatItems(renderableItems);
    });
  }, []);

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [hoveredId, setHoveredId] = useState<string | undefined>(undefined);

  const uniqueIds = unique(flatItems.map((item) => item.id));
  if (uniqueIds.length !== flatItems.length) {
    console.info({ objects: channel.objects, root: channel.root });

    uniqueIds.forEach((id) => {
      console.info('scanning', id);
      Object.values(channel.objects).forEach((object) => {
        console.info(object.children.filter((child) => child.id === id));
      });
    });

    debugger;
  }

  return (
    <DesignSystemConfigurationProvider theme={darkTheme} platform={'key'}>
      <GlobalStyles />
      <Container>
        <ScrollArea>
          <TreeView.Root
            data={flatItems}
            sortable
            keyExtractor={(item) => item.id}
            onMoveItem={(sourceIndex, destinationIndex, position) => {
              const sourceId = flatItems[sourceIndex].id;
              // const sourceIds = [sourceId];
              const destinationId = flatItems[destinationIndex].id;

              if (position === 'inside') {
                channel.objects[sourceId].move(
                  0,
                  channel.objects[destinationId],
                );
                return;
              }

              const parent = channel.objects[destinationId].parent;

              if (!parent) return;

              const destinationPath = flatItems[destinationIndex].indexPath;

              const siblingIndex = destinationPath[destinationPath.length - 1];

              destinationIndex =
                position === 'above' ? siblingIndex : siblingIndex + 1;

              channel.objects[sourceId].move(destinationIndex, parent);
            }}
            acceptsDrop={(
              sourceId: string,
              destinationId: string,
              relationDropPosition: RelativeDropPosition,
            ) => {
              const sourceIds = [sourceId];
              const sourceItems = flatItems.filter((item) =>
                sourceIds.includes(item.id),
              );
              const destinationItem = flatItems.find(
                (item) => item.id === destinationId,
              );

              if (sourceItems.length === 0 || !destinationItem) return false;

              const sourcePaths = sourceItems.map((item) => item.indexPath);
              const destinationPath = destinationItem.indexPath;

              // console.log({
              //   sourceId,
              //   destinationId,
              //   sourceItems,
              //   destinationItem,
              //   sourcePaths,
              //   destinationPath,
              // });

              // Don't allow dragging into a descendant
              if (
                sourcePaths.some((sourcePath) =>
                  isDeepEqual(
                    sourcePath,
                    destinationPath.slice(0, sourcePath.length),
                  ),
                )
              )
                return false;

              // const sourceLayers = sourcePaths.map((sourcePath) =>
              //   Layers.access(page, sourcePath),
              // );
              // const destinationLayer = Layers.access(page, destinationPath);

              // const destinationExpanded =
              //   destinationLayer.layerListExpandedType !==
              //   Sketch.LayerListExpanded.Collapsed;

              // // Don't allow dragging below expanded layers - we'll fall back to inside
              // if (
              //   destinationExpanded &&
              //   Layers.isParentLayer(destinationLayer) &&
              //   destinationLayer.layers.length > 0 &&
              //   relationDropPosition === 'below'
              // ) {
              //   return false;
              // }

              // Only allow dropping inside of parent layers
              if (
                relationDropPosition === 'inside' &&
                !(
                  destinationItem.type === 'object' ||
                  destinationItem.type === 'array' ||
                  destinationItem.id === channel.root?.id
                )
              ) {
                return false;
              }

              return true;
            }}
            renderItem={(item, index, info) => {
              // TODO: Sortable issue where this is undefined
              if (!item) return null;

              const object = channel.objects[item.id];

              if (!object) return null;

              const isRootItem = item.id === channel.root?.id;

              return (
                <TreeView.Row
                  key={item.id}
                  depth={item.depth}
                  isSectionHeader={isRootItem}
                  hovered={item.id === hoveredId}
                  expanded={item.hasChildren ? item.isExpanded : undefined}
                  icon={getJsonTypeIcon(item.type)}
                  selected={item.id === selectedId}
                  id={item.id}
                  onPress={() => {
                    setSelectedId(item.id);
                  }}
                  onSelectMenuItem={(value) => {
                    switch (value) {
                      case 'add-child':
                        const child = object.createChild();
                        child.set('type', 'string');
                        child.set('key', 'a');
                        child.set('value', 'yo');
                        return;
                      case 'delete':
                        object.destroy();
                        return;
                      case 'set-type-number':
                        object.set('type', 'number');
                        object.set('value', 0);
                        return;
                      case 'set-type-string':
                        object.set('type', 'string');
                        object.set('value', '');
                        return;
                      case 'set-type-boolean':
                        object.set('type', 'boolean');
                        object.set('value', false);
                        return;
                      case 'set-type-null':
                        object.set('type', 'null');
                        object.delete('value');
                        return;
                      case 'set-type-array':
                        object.set('type', 'array');
                        object.delete('value');
                        return;
                      case 'set-type-object':
                        object.set('type', 'object');
                        object.delete('value');
                        return;
                    }
                  }}
                  menuItems={[
                    ...(isRootItem ||
                    item.type === 'array' ||
                    item.type === 'object'
                      ? [
                          {
                            value: 'add-child',
                            title:
                              item.type === 'array' ? 'Add Element' : 'Add Key',
                          },
                        ]
                      : []),
                    ...(!isRootItem
                      ? [{ value: 'delete', title: 'Delete' }]
                      : []),
                    {
                      title: 'Change Type',
                      items: [
                        {
                          value: 'set-type-string',
                          title: 'String',
                          icon: getJsonTypeIcon('string'),
                        },
                        {
                          value: 'set-type-number',
                          title: 'Number',
                          icon: getJsonTypeIcon('number'),
                        },
                        {
                          value: 'set-type-boolean',
                          title: 'Boolean',
                          icon: getJsonTypeIcon('boolean'),
                        },
                        {
                          value: 'set-type-null',
                          title: 'Null',
                          icon: getJsonTypeIcon('null'),
                        },
                        {
                          value: 'set-type-array',
                          title: 'Array',
                          icon: getJsonTypeIcon('array'),
                        },
                        {
                          value: 'set-type-object',
                          title: 'Object',
                          icon: getJsonTypeIcon('object'),
                        },
                      ],
                    },
                  ]}
                  onHoverChange={() => {
                    setHoveredId(item.id);
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
                  {isRootItem && <TreeView.RowTitle>Root</TreeView.RowTitle>}
                  {!isRootItem && item.parentType === 'object' && (
                    <InputField.Root>
                      <InputField.Input
                        variant="bare"
                        value={item.key}
                        onSubmit={(value) => {
                          object.set('key', value);
                        }}
                      />
                    </InputField.Root>
                  )}
                  {item.type === 'string' && (
                    <InputField.Root>
                      <InputField.Input
                        variant="bare"
                        value={typeof item.value === 'string' ? item.value : ''}
                        onSubmit={(value) => {
                          object.set('value', value);
                        }}
                      />
                    </InputField.Root>
                  )}
                  {item.type === 'number' && (
                    <InputField.Root>
                      <InputField.NumberInput
                        variant="bare"
                        value={typeof item.value === 'number' ? item.value : 0}
                        onSubmit={(value) => {
                          object.set('value', value);
                        }}
                        onNudge={(value) => {
                          const newValue =
                            (typeof item.value === 'number' ? item.value : 0) +
                            value;
                          object.set('value', newValue);
                        }}
                      />
                    </InputField.Root>
                  )}
                  {item.type === 'boolean' && (
                    <input
                      type="checkbox"
                      checked={
                        typeof item.value === 'boolean' ? item.value : false
                      }
                      onChange={() => {
                        object.set('value', !item.value);
                      }}
                    />
                  )}
                  <Spacer.Horizontal />
                </TreeView.Row>
              );
            }}
          />
        </ScrollArea>
      </Container>
    </DesignSystemConfigurationProvider>
  );
}
