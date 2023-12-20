import { useRouter } from 'next/router';
import {
  asyncIterableToString,
  findAndParseJSONArray,
  useNoyaClientOrFallback,
} from 'noya-api';
import {
  ComponentThumbnailChrome,
  ComponentThumbnailPosition,
  FindComponent,
  Model,
  NoyaAccessModifier,
  NoyaComponent,
  NoyaDiffItem,
  NoyaNode,
  NoyaResolvedNode,
  NoyaResolvedPrimitiveElement,
  NoyaVariant,
  ResolvedHierarchy,
  SelectedComponent,
  applySelectionDiff,
  createSelectionWithDiff,
  describeDiffItem,
} from 'noya-component';
import {
  Button,
  Chip,
  Divider,
  IconButton,
  InputField,
  ListView,
  Popover,
  ScrollArea,
  Select,
  Small,
  Spacer,
  Stack,
  Text,
  useDesignSystemTheme,
  useOpenInputDialog,
  withSeparatorElements,
} from 'noya-designsystem';
import { CaretRightIcon, CheckCircledIcon, CrossCircledIcon } from 'noya-icons';
import { DimensionInput, InspectorPrimitives } from 'noya-inspector';
import { JSONForm } from 'noya-jsonforms';
import { useKeyboardShortcuts } from 'noya-keymap';
import { useIsMounted } from 'noya-react-utils';
import { getNewValue } from 'noya-state';
import { upperFirst } from 'noya-utils';
import React, { ComponentProps, memo, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { AutoResizingTextArea } from '../ayon/components/inspector/DescriptionTextArea';
import { InspectorSection } from '../components/InspectorSection';
import {
  DSComponentThumbnail,
  defaultThumbnailSize,
} from './DSComponentThumbnail';
import { DSLayoutTree } from './DSLayoutTree';
import { exportLayout } from './componentLayout';
import { enforceSchema } from './layoutSchema';
import { getNodeName } from './utils/nodeUtils';

type Props = Pick<
  ComponentProps<typeof DSLayoutTree>,
  'highlightedPath' | 'setHighlightedPath' | 'selectedPath' | 'setSelectedPath'
> & {
  selection: SelectedComponent;
  setSelection: (selection: SelectedComponent) => void;
  findComponent: FindComponent;
  onChangeComponent: (component: NoyaComponent) => void;
  resolvedNode: NoyaResolvedNode;
  onCreateComponent: (component: NoyaComponent) => void;
  components: NoyaComponent[];
};

export function DSComponentInspector({
  selection,
  setSelection,
  findComponent,
  onChangeComponent,
  resolvedNode,
  highlightedPath,
  setHighlightedPath,
  selectedPath,
  setSelectedPath,
  onCreateComponent,
  components,
}: Props) {
  const { query } = useRouter();
  const openInputDialog = useOpenInputDialog();
  const theme = useDesignSystemTheme();
  const component = findComponent(selection.componentID)!;
  const client = useNoyaClientOrFallback();

  const variantsWithDefault = useMemo(
    (): (NoyaVariant | undefined)[] => [
      undefined,
      ...(component.variants ?? []),
    ],
    [component.variants],
  );

  type DiffItemWithSource = NoyaDiffItem & { source: 'current' | 'variant' };

  const allDiffItems = useMemo((): DiffItemWithSource[] => {
    const variant = component.variants?.find(
      (variant) => variant.id === selection.variantID,
    );

    const variantDiffItems =
      variant?.diff?.items.map(
        (item): DiffItemWithSource => ({ ...item, source: 'variant' }),
      ) ?? [];

    const currentDiffItems =
      selection.diff?.items.map(
        (item): DiffItemWithSource => ({ ...item, source: 'current' }),
      ) ?? [];

    return [...variantDiffItems, ...currentDiffItems];
  }, [component.variants, selection.diff, selection.variantID]);

  const metadataMap = useMemo(() => {
    return ResolvedHierarchy.reduce<
      Record<
        string,
        { name: string; type: NoyaNode['type']; componentID?: string }
      >
    >(
      resolvedNode,
      (result, node) => {
        result[node.id] = {
          name: getNodeName(node, findComponent),
          type: node.type,
          componentID:
            node.type !== 'noyaString' ? node.componentID : undefined,
        };
        return result;
      },
      {},
    );
  }, [findComponent, resolvedNode]);

  const [currentTagValue, setCurrentTagValue] = React.useState('');

  const isMounted = useIsMounted();

  const thumbnailSize = component.thumbnail?.size ?? defaultThumbnailSize;

  const [configureProp, setConfigureProp] = React.useState<
    { path: string[]; prop: string } | undefined
  >(undefined);

  const handleCloseConfigureProp = React.useCallback(() => {
    setConfigureProp(undefined);
  }, []);

  const handlePendingChange = useCallback(
    (newResolvedNode: NoyaResolvedNode) => {
      setSelection(
        createSelectionWithDiff({
          selection,
          newResolvedNode,
          findComponent,
        }),
      );
    },
    [findComponent, selection, setSelection],
  );

  const hasUnsavedChanges = selection.diff && selection.diff.items.length > 0;

  const handleSave = useCallback(() => {
    if (!hasUnsavedChanges) return;

    const { component: newComponent, selection: newSelection } =
      applySelectionDiff({
        selection,
        component,
        findComponent,
        enforceSchema,
      });

    if (newComponent !== component) {
      onChangeComponent(newComponent);
    }

    if (newSelection !== selection) {
      setSelection(newSelection);
    }
  }, [
    component,
    findComponent,
    hasUnsavedChanges,
    onChangeComponent,
    selection,
    setSelection,
  ]);

  useKeyboardShortcuts({
    'Mod-s': handleSave,
  });

  if (configureProp) {
    return (
      <PropEditor
        component={component}
        onChangeNode={handlePendingChange}
        resolvedNode={resolvedNode}
        configureProp={configureProp}
        onClose={handleCloseConfigureProp}
      />
    );
  }

  return (
    <Stack.V width="400px" background="white">
      <ScrollArea>
        <Stack.V gap="1px" background={theme.colors.canvas.background}>
          <InspectorSection title="Component" titleTextStyle="heading4">
            <InspectorPrimitives.LabeledRow label="Variant" gap="8px">
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
              {selection.variantID && (
                <IconButton
                  iconName="InputIcon"
                  onClick={async () => {
                    const variant = component.variants?.find(
                      (variant) => variant.id === selection.variantID,
                    );

                    if (!variant) return;

                    const name = variant.name;
                    const newName = await openInputDialog('Variant Name', name);

                    if (!newName) return;

                    onChangeComponent({
                      ...component,
                      variants: component.variants?.map((variant) =>
                        variant.id === selection.variantID
                          ? { ...variant, name: newName }
                          : variant,
                      ),
                    });
                  }}
                />
              )}
              <IconButton
                iconName="PlusIcon"
                onClick={async () => {
                  const name = await openInputDialog('Variant Name');

                  if (!name) return;

                  const variant = Model.variant({
                    name,
                  });

                  onChangeComponent({
                    ...component,
                    variants: [...(component.variants ?? []), variant],
                  });

                  setSelection({
                    ...selection,
                    variantID: variant.id,
                  });
                }}
              />
            </InspectorPrimitives.LabeledRow>
          </InspectorSection>
          <InspectorSection
            title="Metadata"
            titleTextStyle="heading4"
            storageKey="dsShowMetadata"
          >
            <InspectorPrimitives.LabeledRow label="Access">
              <Select<NoyaAccessModifier>
                value={component.accessModifier ?? 'public'}
                id="access-input"
                options={['public', 'internal']}
                getTitle={upperFirst}
                onChange={(accessModifier) =>
                  onChangeComponent({ ...component, accessModifier })
                }
              />
            </InspectorPrimitives.LabeledRow>
            <InspectorPrimitives.LabeledRow
              label="Description"
              right={
                <IconButton
                  iconName="MagicWandIcon"
                  onClick={async () => {
                    const prompt = createDescriptionPrompt(
                      component,
                      resolvedNode,
                    );

                    console.info('Prompt: ', prompt);

                    const iterator =
                      await client.networkClient.generate.fromPrompt(prompt);

                    let result = '';

                    for await (const chunk of iterator) {
                      result += chunk;

                      if (!isMounted.current) return;

                      onChangeComponent({ ...component, description: result });
                    }
                  }}
                />
              }
            >
              <AutoResizingTextArea
                value={component.description || ''}
                onChangeText={(description) =>
                  onChangeComponent({ ...component, description })
                }
              />
            </InspectorPrimitives.LabeledRow>
            <InspectorPrimitives.LabeledRow
              label="Tags"
              right={
                <IconButton
                  iconName="MagicWandIcon"
                  onClick={async () => {
                    const prompt = createTagsPrompt(component, resolvedNode);

                    console.info('Prompt: ', prompt);

                    const iterator =
                      await client.networkClient.generate.fromPrompt(prompt);
                    let result = await asyncIterableToString(iterator);
                    const json = findAndParseJSONArray(result);
                    const safe = z.array(z.string()).safeParse(json);

                    if (!safe.success) return;

                    onChangeComponent({
                      ...component,
                      tags: safe.data,
                    });
                  }}
                />
              }
            >
              <Stack.V flex="1" gap="4px">
                <InputField.Root labelPosition="start">
                  <InputField.Input
                    value={currentTagValue}
                    onSubmit={(value) => {
                      onChangeComponent({
                        ...component,
                        tags: [
                          ...(component.tags ?? []),
                          value.trim().toLowerCase(),
                        ],
                      });
                      setCurrentTagValue('');
                    }}
                  />
                  <InputField.Label>#</InputField.Label>
                </InputField.Root>
                {component.tags && component.tags.length > 0 && (
                  <Stack.H gap="4px" flexWrap="wrap">
                    {component.tags.map((tag, i) => (
                      <Chip
                        key={i}
                        deletable
                        onDelete={() => {
                          onChangeComponent({
                            ...component,
                            tags: component.tags?.filter((t) => t !== tag),
                          });
                        }}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </Stack.H>
                )}
              </Stack.V>
            </InspectorPrimitives.LabeledRow>
            <InspectorPrimitives.LabeledRow
              label="Thumbnail"
              right={
                // Warn if width or height aren't divisible by 4
                thumbnailSize.width % 4 !== 0 ||
                thumbnailSize.height % 4 !== 0 ? (
                  <Popover
                    trigger={
                      <IconButton
                        iconName="ExclamationTriangleIcon"
                        color="orange"
                      />
                    }
                  >
                    <Stack.V gap="4px" padding="16px">
                      <Small>Thumbnail sizes should be divisible by 4</Small>
                      {/* Suggest the closest value above and below */}
                      <Stack.V gap="4px">
                        {thumbnailSize.width % 4 !== 0 && (
                          <Text variant="code">
                            Width: {Math.floor(thumbnailSize.width / 4) * 4} or{' '}
                            {Math.ceil(thumbnailSize.width / 4) * 4}
                          </Text>
                        )}
                        {thumbnailSize.height % 4 !== 0 && (
                          <Text variant="code">
                            Height: {Math.floor(thumbnailSize.height / 4) * 4}{' '}
                            or {Math.ceil(thumbnailSize.height / 4) * 4}
                          </Text>
                        )}
                      </Stack.V>
                      <Button
                        variant="primary"
                        onClick={() => {
                          onChangeComponent({
                            ...component,
                            thumbnail: {
                              ...component.thumbnail,
                              size: {
                                width: Math.floor(thumbnailSize.width / 4) * 4,
                                height:
                                  Math.floor(thumbnailSize.height / 4) * 4,
                              },
                            },
                          });
                        }}
                      >
                        Fix
                      </Button>
                    </Stack.V>
                  </Popover>
                ) : undefined
              }
            >
              <InspectorPrimitives.Column>
                <InspectorPrimitives.Row gap="8px">
                  <DimensionInput
                    value={thumbnailSize.width}
                    label="W"
                    trigger="change"
                    onSetValue={(value, mode) => {
                      onChangeComponent({
                        ...component,
                        thumbnail: {
                          ...component.thumbnail,
                          size: {
                            ...thumbnailSize,
                            width: getNewValue(
                              thumbnailSize.width,
                              mode,
                              value,
                            ),
                          },
                        },
                      });
                    }}
                  />
                  <DimensionInput
                    value={thumbnailSize.height}
                    label="H"
                    trigger="change"
                    onSetValue={(value, mode) => {
                      onChangeComponent({
                        ...component,
                        thumbnail: {
                          ...component.thumbnail,
                          size: {
                            ...thumbnailSize,
                            height: getNewValue(
                              thumbnailSize.height,
                              mode,
                              value,
                            ),
                          },
                        },
                      });
                    }}
                  />
                  <Stack.H flex="1">
                    <Select<ComponentThumbnailPosition>
                      value={component.thumbnail?.position ?? 'center'}
                      id="position-input"
                      options={['top', 'center', 'bottom']}
                      getTitle={upperFirst}
                      onChange={(position) =>
                        onChangeComponent({
                          ...component,
                          thumbnail: {
                            ...component.thumbnail,
                            position,
                          },
                        })
                      }
                    />
                  </Stack.H>
                  <Stack.H flex="1">
                    <Select<ComponentThumbnailChrome>
                      value={component.thumbnail?.chrome ?? 'none'}
                      id="chrome-input"
                      options={['none', 'window']}
                      getTitle={upperFirst}
                      onChange={(chrome) =>
                        onChangeComponent({
                          ...component,
                          thumbnail: {
                            ...component.thumbnail,
                            chrome,
                          },
                        })
                      }
                    />
                  </Stack.H>
                </InspectorPrimitives.Row>
                <Stack.H
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="4px"
                  background={theme.colors.inputBackground}
                  flex="1"
                  aspectRatio="16/9"
                  border={`1px solid ${theme.colors.divider}`}
                >
                  <DSComponentThumbnail
                    component={component}
                    size={thumbnailSize}
                    fileId={query.id as string}
                  />
                </Stack.H>
              </InspectorPrimitives.Column>
            </InspectorPrimitives.LabeledRow>
          </InspectorSection>
          <InspectorSection
            title="Elements"
            titleTextStyle="heading4"
            right={
              hasUnsavedChanges && (
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
                  <Button variant="primary" onClick={handleSave}>
                    Save{selection.variantID ? ' Variant' : ''}
                    <Spacer.Horizontal size={4} inline />
                    <CheckCircledIcon />
                  </Button>
                </>
              )
            }
          >
            <DSLayoutTree
              onChange={handlePendingChange}
              findComponent={findComponent}
              highlightedPath={highlightedPath}
              setHighlightedPath={setHighlightedPath}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
              resolvedNode={resolvedNode}
              onCreateComponent={onCreateComponent}
              components={components}
              onConfigureProp={setConfigureProp}
            />
          </InspectorSection>
        </Stack.V>
        {allDiffItems.length > 0 && (
          <InspectorSection title="Diff" titleTextStyle="heading4">
            <Stack.V>
              <ListView.Root variant="bare" gap={4}>
                {allDiffItems.map((item, i) => (
                  <ListView.Row key={i}>
                    <Stack.V
                      border={`1px solid ${theme.colors.divider}`}
                      padding="6px"
                      gap="6px"
                      flex="1"
                      borderRadius="4px"
                      separator={<Divider />}
                      background={
                        item.source === 'variant'
                          ? 'rgb(238, 229, 255)'
                          : 'transparent'
                      }
                    >
                      <Stack.H alignItems="center">
                        {withSeparatorElements(
                          item.path.map((id) => (
                            <Chip
                              key={id}
                              colorScheme={
                                metadataMap[id]?.type === 'noyaCompositeElement'
                                  ? 'primary'
                                  : undefined
                              }
                            >
                              {metadataMap[id]?.name ?? '?'}
                            </Chip>
                          )),
                          <CaretRightIcon />,
                        )}
                        <Spacer.Horizontal />
                        <Spacer.Horizontal size={8} />
                        <IconButton
                          iconName="Cross1Icon"
                          onClick={() => {
                            setSelection({
                              ...selection,
                              diff: {
                                // items: activeDiff.items.filter(
                                //   (item, j) => j !== i,
                                // ),
                                items: [],
                              },
                            });
                          }}
                        />
                      </Stack.H>
                      {item.classNames && item.classNames.length > 0 && (
                        <Stack.H flexWrap="wrap" gap="8px">
                          <Text variant="code">classes: </Text>
                          {item.classNames.map((arrayDiffItem, j) => (
                            <Text key={j} variant="code">
                              {describeDiffItem(
                                arrayDiffItem,
                                (className) => className.value,
                              )}
                            </Text>
                          ))}
                        </Stack.H>
                      )}
                      {item.variantNames && item.variantNames.length > 0 && (
                        <Stack.H flexWrap="wrap" gap="8px">
                          <Text variant="code">variants: </Text>
                          {item.variantNames.map((arrayDiffItem, j) => {
                            const elementId = item.path[item.path.length - 1];
                            const targetComponent = findComponent(
                              metadataMap[elementId]?.componentID ?? '',
                            );
                            const variants = targetComponent?.variants ?? [];
                            const findVariantName = (id: string): string => {
                              const variant = variants.find(
                                (variant) => variant.id === id,
                              );
                              return variant?.name ?? '';
                            };

                            return (
                              <Text key={j} variant="code">
                                {describeDiffItem(
                                  arrayDiffItem,
                                  (variantName) =>
                                    findVariantName(variantName.variantID),
                                )}
                              </Text>
                            );
                          })}
                        </Stack.H>
                      )}
                      {item.children && item.children.length > 0 && (
                        <Stack.H flexWrap="wrap" gap="8px">
                          <Text variant="code">children: </Text>
                          {item.children.map((arrayDiffItem, j) => (
                            <Text key={j} variant="code">
                              {describeDiffItem(
                                arrayDiffItem,
                                (child) => child.name || child.id,
                              )}
                            </Text>
                          ))}
                        </Stack.H>
                      )}
                      {item.name && (
                        <Stack.H flexWrap="wrap" gap="8px">
                          <Text variant="code">name: </Text>
                          <Text variant="code">{item.name}</Text>
                        </Stack.H>
                      )}
                      {item.textValue && (
                        <Stack.H flexWrap="wrap" gap="8px">
                          <Text variant="code">textValue: </Text>
                          <Text variant="code">{item.textValue}</Text>
                        </Stack.H>
                      )}
                      {item.props && item.props.length > 0 && (
                        <Stack.H flexWrap="wrap" gap="8px">
                          <Text variant="code">props: </Text>
                          {item.props.map((arrayDiffItem, j) => (
                            <Text key={j} variant="code">
                              {describeDiffItem(
                                arrayDiffItem,
                                (prop) => prop.name,
                              )}
                            </Text>
                          ))}
                        </Stack.H>
                      )}
                    </Stack.V>
                  </ListView.Row>
                ))}
              </ListView.Root>
            </Stack.V>
          </InspectorSection>
        )}
      </ScrollArea>
    </Stack.V>
  );
}

function createDescriptionPrompt(
  component: NoyaComponent,
  resolvedNode: NoyaResolvedNode,
) {
  return `You are a professional UI designer helping me write documentation. I will provide the name and code of a UI component. Respond with ONLY a short summary of the component that I can use as the intro section for this component on its documentation page. Focus on the purpose of the component rather than its implementation details or individual elements, as these may be customized by the designer. Use simple, easy-to-understand language. Response with no more than a few lines of text.

\`\`\`
Component Name: "${component.name}"
Component Code:
${exportLayout(resolvedNode)}
\`\`\`

Your response should begin with: The **${component.name}**...`;
}

function createTagsPrompt(
  component: NoyaComponent,
  resolvedNode: NoyaResolvedNode,
) {
  return `You are a professional UI designer helping me write documentation. I will provide the name, description, and code of a UI component. Respond with a JSON array of keywords that can be used to categorize and search for thsi component. These tags should be short and lowercase. E.g. ["marketing", "application", "e-commerce", ...]

\`\`\`
Component Name: "${component.name}"
Component Description: "${component.description}"
Component Code:
${exportLayout(resolvedNode)}
\`\`\`  
`;
}

const PropEditor = memo(function PropEditor({
  component,
  onChangeNode,
  resolvedNode,
  configureProp,
  onClose,
}: {
  component: NoyaComponent;
  onChangeNode: (newResolvedNode: NoyaResolvedNode) => void;
  resolvedNode: NoyaResolvedNode;
  configureProp: { path: string[]; prop: string };
  onClose: () => void;
}) {
  const theme = useDesignSystemTheme();

  const element = ResolvedHierarchy.find<NoyaResolvedPrimitiveElement>(
    resolvedNode,
    (el): el is NoyaResolvedPrimitiveElement => {
      return (
        el.type === 'noyaPrimitiveElement' &&
        el.path.join('/') === configureProp.path.join('/')
      );
    },
  );

  const handleSetData = useCallback(
    (newData: any) => {
      if (!element) return;

      const newProps = element.props.map((prop) => {
        if (prop.name !== configureProp.prop) return prop;
        return { ...prop, data: newData };
      });

      const indexPath = ResolvedHierarchy.findIndexPath(
        resolvedNode,
        (el) => el.path.join('/') === element.path.join('/'),
      );

      if (!indexPath) return;

      const newResolvedNode = ResolvedHierarchy.replace(resolvedNode, {
        at: indexPath,
        node: { ...element, props: newProps },
      });

      onChangeNode(newResolvedNode);
    },
    [configureProp.prop, element, onChangeNode, resolvedNode],
  );

  if (!element) return null;

  const prop = element.props.find((prop) => prop.name === configureProp.prop);

  if (!prop || prop.type !== 'generator') return null;

  return (
    <Stack.V width="400px" background="white">
      <ScrollArea>
        <Stack.V gap="1px" background={theme.colors.canvas.background}>
          <InspectorSection
            title={
              <>
                <IconButton
                  iconName="ChevronLeftIcon"
                  size={20}
                  color={theme.colors.textMuted}
                  onClick={onClose}
                />
                <Spacer.Horizontal size={2} inline />
                Configure
                <Spacer.Horizontal size={8} inline />
                <Chip size="medium" monospace style={{ alignSelf: 'center' }}>
                  {prop.name}
                </Chip>
              </>
            }
            titleTextStyle="heading4"
          >
            <JSONForm data={prop.data} setData={handleSetData} />
          </InspectorSection>
        </Stack.V>
      </ScrollArea>
    </Stack.V>
  );
});
