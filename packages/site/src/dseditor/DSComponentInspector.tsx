import { useNoyaClient } from 'noya-api';
import { parseComponentLayout } from 'noya-compiler';
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
import React, { useMemo } from 'react';
import { InspectorSection } from '../components/InspectorSection';
import { DSLayoutTree } from './DSLayoutTree';
import { LayoutHierarchy, convertLayoutToComponent } from './componentLayout';
import { mergeDiffs } from './diff';
import { FindComponent, embedRootLevelDiff } from './traversal';
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
}

export function DSComponentInspector({
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
                      component.name ?? 'Untitled',
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

                      const newRootElement = embedRootLevelDiff(
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
            <DSLayoutTree
              rootNode={component.rootElement}
              setDiff={(diff) =>
                setSelection({
                  ...selection,
                  diff: mergeDiffs(selection.diff, diff),
                })
              }
              findComponent={findComponent}
              setHighlightedPath={setHighlightedPath}
              highlightedPath={highlightedPath}
              resolvedNode={resolvedNode}
            />
          </InspectorSection>
        </Stack.V>
      </ScrollArea>
    </Stack.V>
  );
}
