import { useNoyaClient } from 'noya-api';
import { parseComponentLayout } from 'noya-compiler';
import {
  Button,
  Chip,
  InputField,
  ScrollArea,
  Select,
  Spacer,
  Stack,
  Text,
  TreeView,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { CheckCircledIcon, CrossCircledIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import React, { useMemo } from 'react';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { InspectorSection } from '../components/InspectorSection';
import { PRIMITIVE_ELEMENT_NAMES } from './builtins';
import { LayoutHierarchy, convertLayoutToComponent } from './componentLayout';
import { diffReducer } from './diffReducer';
import {
  FindComponent,
  ResolvedHierarchy,
  applyRootLevelDiff,
} from './traversal';
import {
  NoyaComponent,
  NoyaCompositeElement,
  NoyaResolvedNode,
  NoyaVariant,
} from './types';

type LayerTreeItem = {
  depth: number;
  indexPath: number[];
  key: string;
  node: NoyaResolvedNode;
  path: string[];
};

interface Props {
  selection: NoyaCompositeElement;
  setSelection: (component: NoyaCompositeElement | undefined) => void;
  findComponent: FindComponent;
  onChangeComponent: (component: NoyaComponent) => void;
  resolvedNode: NoyaResolvedNode;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
}

function getName(node: NoyaResolvedNode, findComponent: FindComponent): string {
  switch (node.type) {
    case 'noyaString':
      return node.value;
    case 'noyaPrimitiveElement':
      return node.name ?? PRIMITIVE_ELEMENT_NAMES[node.componentID];
    case 'noyaCompositeElement': {
      const component = findComponent(node.componentID);

      if (!component) return '<Component Not Found>';

      return node.name ?? component.name ?? '<No Name>';
    }
  }
}

export function DSLayerInspector({
  selection,
  setSelection,
  findComponent,
  onChangeComponent,
  resolvedNode,
  highlightedPath,
  setHighlightedPath,
}: Props) {
  const client = useNoyaClient();
  const theme = useDesignSystemTheme();
  const component = findComponent(selection.componentID)!;

  const flattened = ResolvedHierarchy.flatMap(
    resolvedNode,
    (node, indexPath): LayerTreeItem[] => {
      const depth = indexPath.length;

      if (depth === 0) return [];

      return [
        {
          node,
          depth,
          indexPath: indexPath.slice(),
          key: component.type + ':' + indexPath.join('/'),
          path: node.path,
        },
      ];
    },
  );

  const variantsWithDefault = useMemo(
    (): (NoyaVariant | undefined)[] => [
      undefined,
      ...(component.variants ?? []),
    ],
    [component.variants],
  );

  return (
    <Stack.V width="400px" background="white">
      <ScrollArea>
        <Stack.V gap="1px" background={theme.colors.canvas.background}>
          <InspectorSection title="Component" titleTextStyle="heading3">
            <InspectorPrimitives.LabeledRow label="Name">
              <InputField.Root>
                <InputField.Label>Name</InputField.Label>
                <InputField.Input
                  value={component.name}
                  onChange={(value) => {
                    onChangeComponent({
                      ...component,
                      name: value,
                    });
                  }}
                />
              </InputField.Root>
            </InspectorPrimitives.LabeledRow>
            <InspectorPrimitives.LabeledRow label="Variant">
              <Select
                value={selection.variantID ?? 'default'}
                id="variant-input"
                options={variantsWithDefault.map(
                  (variant) => variant?.id ?? 'default',
                )}
                getTitle={(id) => {
                  const variant = component.variants?.find(
                    (variant) => variant.id === id,
                  );
                  return variant?.name ?? 'Default';
                }}
                onChange={(id) => {
                  setSelection({
                    ...selection,
                    variantID: id === 'default' ? undefined : id,
                  });
                }}
              />
            </InspectorPrimitives.LabeledRow>
            <InspectorPrimitives.LabeledRow label="AI">
              <Button
                variant="secondary"
                flex="1"
                onClick={async () => {
                  const newDescription =
                    await client.networkClient.generate.componentDescriptionFromName(
                      component.name ?? 'Untitled',
                    );

                  onChangeComponent({
                    ...component,
                    description: newDescription,
                  });
                }}
              >
                Generate Description
              </Button>
              <Spacer.Horizontal size={8} />
              <Button
                variant="secondary"
                flex="1"
                onClick={async () => {
                  const layouts =
                    await client.networkClient.generate.componentLayoutsFromDescription(
                      component.description ?? '',
                    );

                  const parsed = layouts.map((layout) =>
                    parseComponentLayout(layout.code),
                  );

                  if (parsed.length === 0) return;

                  console.info(
                    LayoutHierarchy.diagram(parsed[0], (node, indexPath) => {
                      if (typeof node === 'string') return node;

                      const attributesString = Object.entries(node.attributes)
                        .map(([key, value]) => `${key}="${value}"`)
                        .join(' ');

                      return `<${[node.tag, attributesString]
                        .filter(Boolean)
                        .join(' ')}>`;
                    }),
                  );

                  onChangeComponent({
                    ...component,
                    rootElement: convertLayoutToComponent(parsed[0]),
                  });
                }}
              >
                Generate Layouts
              </Button>
            </InspectorPrimitives.LabeledRow>
            <textarea
              onChange={(event) => {
                onChangeComponent({
                  ...component,
                  description: event.target.value,
                });
              }}
              style={{
                minHeight: '100px',
                background: theme.colors.inputBackground,
              }}
              value={component.description || ''}
            />
          </InspectorSection>
          <InspectorSection
            title="Elements"
            titleTextStyle="heading4"
            right={
              selection.diff && (
                <>
                  <Button
                    onClick={() => {
                      setSelection({
                        ...selection,
                        diff: undefined,
                      });
                    }}
                  >
                    Reset
                    <Spacer.Horizontal size={4} inline />
                    <CrossCircledIcon />
                  </Button>
                  <Spacer.Horizontal size={8} />
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!selection.diff) return;

                      if (selection.variantID) {
                        // TODO: Merge variant and diff
                        alert('Not implemented');
                        return;
                      }

                      const newRootElement = applyRootLevelDiff(
                        component.rootElement,
                        selection.diff,
                      );

                      onChangeComponent({
                        ...component,
                        rootElement: newRootElement,
                      });

                      setSelection({
                        ...selection,
                        diff: undefined,
                      });
                    }}
                  >
                    Save{selection.variantID ? ' Variant' : ''}
                    <Spacer.Horizontal size={4} inline />
                    <CheckCircledIcon />
                  </Button>
                </>
              )
            }
          >
            <TreeView.Root
              keyExtractor={(obj, index) => obj.key}
              data={flattened}
              expandable={false}
              variant="bare"
              indentation={24}
              sortable
              pressEventName="onPointerDown"
              renderItem={({ depth, key, indexPath, node, path }) => {
                const name = getName(node, findComponent);
                const menu = [{ title: 'Duplicate' }, { title: 'Delete' }];
                const hovered = highlightedPath?.join('/') === path.join('/');

                return (
                  <TreeView.Row
                    key={key}
                    id={key}
                    depth={depth - 1}
                    menuItems={menu}
                    onSelectMenuItem={() => {}}
                    hovered={hovered}
                    onHoverChange={(hovered) => {
                      setHighlightedPath(hovered ? path : undefined);
                    }}
                    icon={
                      depth !== 0 && (
                        <DraggableMenuButton items={menu} onSelect={() => {}} />
                      )
                    }
                  >
                    <Stack.V
                      flex="1 1 0%"
                      padding="1px"
                      overflow="hidden"
                      borderRadius="4px"
                      margin="2px 0"
                      border={
                        node.type === 'noyaCompositeElement'
                          ? undefined
                          : `1px solid ${theme.colors.divider}`
                      }
                      background={
                        node.type === 'noyaCompositeElement'
                          ? 'rgb(238, 229, 255)'
                          : undefined
                      }
                      borderRight={
                        node.status === 'added'
                          ? `8px solid rgb(205, 238, 231)`
                          : node.status === 'removed'
                          ? `8px solid rgb(255, 229, 229)`
                          : undefined
                      }
                      color={
                        node.type === 'noyaString'
                          ? 'dodgerblue'
                          : node.type === 'noyaCompositeElement'
                          ? theme.colors.primary
                          : 'inherit'
                      }
                    >
                      {node.type === 'noyaString' ? (
                        <InputField.Root>
                          <InputField.Input
                            style={{
                              background: 'transparent',
                              color: 'dodgerblue',
                            }}
                            value={node.value}
                            onChange={(value) => {
                              const newSelection: NoyaCompositeElement = {
                                ...selection,
                                diff: diffReducer(selection.diff, [
                                  'updateTextValue',
                                  { path: path.slice(1), value },
                                ]),
                              };

                              setSelection(newSelection);
                            }}
                          />
                        </InputField.Root>
                      ) : (
                        <Stack.H padding="4px 8px" alignItems="center">
                          <TreeView.RowTitle>{name}</TreeView.RowTitle>
                          {hovered && node.type === 'noyaPrimitiveElement' ? (
                            <Text variant="code" fontSize="9px">
                              {PRIMITIVE_ELEMENT_NAMES[node.componentID]}
                            </Text>
                          ) : node.type === 'noyaCompositeElement' &&
                            node.variantID ? (
                            <Text variant="code" fontSize="9px">
                              {findComponent(node.componentID)?.variants?.find(
                                (variant) => variant.id === node.variantID,
                              )?.name ?? 'Default'}
                            </Text>
                          ) : null}
                        </Stack.H>
                      )}
                      {node.type === 'noyaPrimitiveElement' && (
                        <Stack.H flexWrap="wrap" gap="2px">
                          {node.classNames.map(({ value, status }) => (
                            <Chip
                              key={value}
                              size={'small'}
                              deletable={status !== 'removed'}
                              addable={status === 'removed'}
                              monospace
                              variant={
                                status === 'added' ? 'secondary' : undefined
                              }
                              style={{
                                opacity: status === 'removed' ? 0.5 : 1,
                              }}
                            >
                              {value}
                            </Chip>
                          ))}
                        </Stack.H>
                      )}
                    </Stack.V>
                  </TreeView.Row>
                );
              }}
            />
          </InspectorSection>
        </Stack.V>
      </ScrollArea>
    </Stack.V>
  );
}
