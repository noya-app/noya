import {
  Button,
  Chip,
  Divider,
  IconButton,
  ListView,
  ScrollArea,
  Select,
  Spacer,
  Stack,
  Text,
  useDesignSystemTheme,
  useOpenInputDialog,
  withSeparatorElements,
} from 'noya-designsystem';
import { CaretRightIcon, CheckCircledIcon, CrossCircledIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import { isDeepEqual, partition } from 'noya-utils';
import React, { useMemo } from 'react';
import { AutoResizingTextArea } from '../ayon/components/inspector/DescriptionTextArea';
import { InspectorSection } from '../components/InspectorSection';
import { DSLayoutTree } from './DSLayoutTree';
import { describeDiffItem } from './arrayDiff';
import { Model } from './builders';
import { enforceSchema } from './layoutSchema';
import { ResolvedHierarchy } from './resolvedHierarchy';
import {
  FindComponent,
  diffResolvedTrees,
  instantiateResolvedComponent,
  unresolve,
} from './traversal';
import {
  NoyaComponent,
  NoyaResolvedNode,
  NoyaVariant,
  SelectedComponent,
} from './types';
import { getNodeName } from './utils/nodeUtils';

interface Props {
  selection: SelectedComponent;
  setSelection: (selection: SelectedComponent) => void;
  findComponent: FindComponent;
  onChangeComponent: (component: NoyaComponent) => void;
  resolvedNode: NoyaResolvedNode;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
  onCreateComponent: (component: NoyaComponent) => void;
  components: NoyaComponent[];
  // activeDiff?: NoyaDiff;
}

export function DSComponentInspector({
  selection,
  setSelection,
  findComponent,
  onChangeComponent,
  resolvedNode,
  highlightedPath,
  setHighlightedPath,
  onCreateComponent,
  components,
}: // activeDiff,
Props) {
  const openInputDialog = useOpenInputDialog();
  const theme = useDesignSystemTheme();
  const component = findComponent(selection.componentID)!;

  const variantsWithDefault = useMemo(
    (): (NoyaVariant | undefined)[] => [
      undefined,
      ...(component.variants ?? []),
    ],
    [component.variants],
  );

  const activeDiff = selection.diff;

  const nameMap = useMemo(() => {
    return ResolvedHierarchy.reduce<Record<string, string>>(
      resolvedNode,
      (result, node) => {
        result[node.id] = getNodeName(node, findComponent);
        return result;
      },
      {},
    );
  }, [findComponent, resolvedNode]);

  return (
    <Stack.V width="400px" background="white">
      <ScrollArea>
        <Stack.V gap="1px" background={theme.colors.canvas.background}>
          <InspectorSection title="Component" titleTextStyle="heading3">
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
            <InspectorPrimitives.LabeledRow label="Description">
              <AutoResizingTextArea
                value={component.description || ''}
                onChangeText={(description) =>
                  onChangeComponent({ ...component, description })
                }
              />
            </InspectorPrimitives.LabeledRow>
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
                      if (
                        !selection.diff ||
                        selection.diff.items.length === 0
                      ) {
                        return;
                      }

                      if (selection.variantID) {
                        // TODO: Merge variant and diff
                        alert('Not implemented');
                        return;
                      }

                      // Partition diff into nodes that apply to a primitive element and nodes that apply
                      // to a composite element. If a diff path is within a composite element, that should
                      // be applied to the composite element, not the primitive element.
                      const [primitivesDiff, compositesDiff] = partition(
                        selection.diff.items || [],
                        (item) => {
                          const indexPath = ResolvedHierarchy.findIndexPath(
                            resolvedNode,
                            (n) => isDeepEqual(n.path, item.path),
                          );
                          if (!indexPath) return false;
                          const nodePath = ResolvedHierarchy.accessPath(
                            resolvedNode,
                            indexPath,
                          );
                          // Remove the root node which is the component itself
                          const indexOfFirstComposite = nodePath
                            .slice(1)
                            .findIndex(
                              (node) => node.type === 'noyaCompositeElement',
                            );
                          return indexOfFirstComposite === -1;
                        },
                      );

                      const instance = instantiateResolvedComponent(
                        findComponent,
                        {
                          componentID: selection.componentID,
                          variantID: selection.variantID,
                          diff: { items: primitivesDiff },
                        },
                      );

                      const newRootElement = enforceSchema(
                        unresolve(instance, { items: compositesDiff }),
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
            <DSLayoutTree
              onChange={(newResolvedNode) => {
                const instance = instantiateResolvedComponent(findComponent, {
                  componentID: selection.componentID,
                  variantID: selection.variantID,
                });
                const diff = diffResolvedTrees(instance, newResolvedNode);
                setSelection({ ...selection, diff });
              }}
              findComponent={findComponent}
              setHighlightedPath={setHighlightedPath}
              highlightedPath={highlightedPath}
              resolvedNode={resolvedNode}
              onCreateComponent={onCreateComponent}
              components={components}
            />
          </InspectorSection>
        </Stack.V>
        {activeDiff && (
          <InspectorSection title="Diff" titleTextStyle="heading4">
            <Stack.V>
              <Stack.V background={theme.colors.codeBackground}>
                <ListView.Root>
                  {activeDiff.items.map((item, i) => (
                    <ListView.Row key={i}>
                      <Stack.V
                        margin="0 -6px"
                        gap="6px"
                        flex="1"
                        separator={<Divider />}
                      >
                        <Stack.H alignItems="center">
                          {withSeparatorElements(
                            item.path.map((id) => (
                              <Chip key={id} variant="outlined">
                                {nameMap[id]}
                              </Chip>
                            )),
                            <CaretRightIcon />,
                          )}
                        </Stack.H>
                        {item.classNames && item.classNames.length > 0 && (
                          <Stack.H flexWrap="wrap" gap="8px">
                            <Text variant="code">classes: </Text>
                            {item.classNames.map((arrayDiffItem, j) => (
                              <Text variant="code">
                                {describeDiffItem(
                                  arrayDiffItem,
                                  (className) => className.value,
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
            </Stack.V>
          </InspectorSection>
        )}
      </ScrollArea>
    </Stack.V>
  );
}
