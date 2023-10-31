import {
  Button,
  InputField,
  ScrollArea,
  Select,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { CheckCircledIcon, CrossCircledIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import { isDeepEqual, partition } from 'noya-utils';
import React, { useMemo } from 'react';
import { AutoResizingTextArea } from '../ayon/components/inspector/DescriptionTextArea';
import { InspectorSection } from '../components/InspectorSection';
import { DSLayoutTree } from './DSLayoutTree';
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

interface Props {
  selection: SelectedComponent;
  setSelection: (selection: SelectedComponent) => void;
  findComponent: FindComponent;
  onChangeComponent: (component: NoyaComponent) => void;
  resolvedNode: NoyaResolvedNode;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
  onCreateComponent: (component: NoyaComponent) => void;
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
}: Props) {
  const theme = useDesignSystemTheme();
  const component = findComponent(selection.componentID)!;

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
                      if (!selection.diff) return;

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
            />
          </InspectorSection>
        </Stack.V>
      </ScrollArea>
    </Stack.V>
  );
}
