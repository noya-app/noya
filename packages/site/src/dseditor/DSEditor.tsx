import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { DS } from 'noya-api';
import {
  DividerVertical,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { loadDesignSystem } from 'noya-module-loader';
import { uuid } from 'noya-utils';
import React, { useCallback, useEffect, useMemo } from 'react';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { DSComponentInspector } from './DSComponentInspector';
import { DSControlledRenderer } from './DSControlledRenderer';
import { DSProjectInspector } from './DSProjectInspector';
import { DSRenderProps, IDSRenderer } from './DSRenderer';
import { DSRendererOverlay } from './DSRendererOverlay';
import { Model } from './builders';
import { initialComponents } from './builtins';
import { mergeDiffs } from './diff';
import { renderDSOverview } from './renderDSOverview';
import { renderDSPreview } from './renderDSPreview';
import { ResolvedHierarchy, createResolvedNode } from './traversal';
import { NoyaComponent, NoyaResolvedString, SelectedComponent } from './types';

const noop = () => {};

interface Props {
  name: string;
  initialDocument: DS;
  onChangeDocument?: (document: DS) => void;
  onChangeName?: (name: string) => void;
  viewType?: 'preview';
}
export function DSEditor({
  initialDocument,
  onChangeDocument = noop,
  name: fileName,
  onChangeName = noop,
  viewType,
}: Props) {
  const theme = useDesignSystemTheme();
  const [ds, setDS] = React.useState(initialDocument);

  const {
    source: { name: sourceName },
    config: {
      colors: { primary },
    },
    components = initialComponents,
  } = ds as DS & {
    components: NoyaComponent[];
  };

  const setComponents = useCallback((components: NoyaComponent[]) => {
    setDS((ds) => ({
      ...ds,
      components,
    }));
  }, []);

  useEffect(() => {
    onChangeDocument(ds);
  }, [onChangeDocument, ds]);

  const [system, setSystem] = React.useState<
    DesignSystemDefinition | undefined
  >();

  useEffect(() => {
    async function fetchLibrary() {
      const system = await loadDesignSystem(sourceName);

      setSystem(system);
    }

    setSystem(undefined);
    fetchLibrary();
  }, [sourceName]);

  const [selection, setSelection] = React.useState<
    SelectedComponent | undefined
  >();

  const [highlightedPath, setHighlightedPath] = React.useState<
    string[] | undefined
  >();

  const findComponent = useCallback(
    (id: string) =>
      components.find((component) => component.componentID === id),
    [components],
  );

  const handleNewComponent = useCallback(() => {
    const newComponent = Model.component({
      componentID: uuid(),
      rootElement: Model.primitiveElement({
        componentID: boxSymbolId,
      }),
    });

    setComponents([...components, newComponent]);
  }, [components, setComponents]);

  const handleDeleteComponent = useCallback(
    (componentID: string) => {
      setSelection(undefined);
      setComponents(components.filter((c) => c.componentID !== componentID));
    },
    [components, setComponents],
  );

  const handleChangeComponent = useCallback(
    (component: NoyaComponent) => {
      setComponents(
        components.map((c) =>
          c.componentID === component.componentID ? component : c,
        ),
      );
    },
    [components, setComponents],
  );

  const handleSetTextAtPath = useCallback(
    ({ path, value }: { path: string[]; value: string }) => {
      setSelection((selection) => {
        const merged = mergeDiffs(
          selection?.diff,
          Model.diff([Model.diffItem({ path, textValue: value })]),
        );

        return selection ? { ...selection, diff: merged } : undefined;
      });
    },
    [],
  );

  const resolvedNode = useMemo(() => {
    if (!selection) return undefined;

    const instance = Model.compositeElement({
      id: 'root',
      componentID: selection.componentID,
      variantID: selection.variantID,
      diff: selection.diff,
    });

    let resolvedNode = createResolvedNode(findComponent, instance);

    ResolvedHierarchy.visit(resolvedNode, (node) => {
      // Remove the root prefix
      node.path = node.path.slice(1);
    });

    if (resolvedNode.type !== 'noyaCompositeElement') return undefined;

    return resolvedNode.rootElement;
  }, [findComponent, selection]);

  const handleRenderContent = React.useCallback(
    (props: DSRenderProps) => {
      if (selection && resolvedNode) {
        return renderDSPreview({
          renderProps: props,
          highlightedPath,
          primary,
          resolvedNode,
          canvasBackgroundColor: theme.colors.canvas.background,
          selectionOutlineColor: theme.colors.primary,
        });
      }

      return renderDSOverview({
        ...props,
        backgroundColor: theme.colors.canvas.background,
      });
    },
    [
      highlightedPath,
      primary,
      resolvedNode,
      selection,
      theme.colors.canvas.background,
      theme.colors.primary,
    ],
  );

  const rendererRef = React.useRef<IDSRenderer>(null);

  const handleSelectComponent = useCallback(
    (componentId: string) => {
      setSelection({ componentID: componentId });
    },
    [setSelection],
  );

  return (
    <Stack.H flex="1" separator={<DividerVertical />}>
      {viewType !== 'preview' && (
        <DSProjectInspector
          name={fileName}
          onChangeName={onChangeName}
          system={system}
          ds={ds}
          setDS={setDS}
          selectedComponentID={selection?.componentID}
          onSelectComponent={handleSelectComponent}
          components={components}
          onNewComponent={handleNewComponent}
          onDeleteComponent={handleDeleteComponent}
        />
      )}
      <Stack.V flex="1" overflow="hidden" position="relative">
        <DSControlledRenderer
          ref={rendererRef}
          sourceName={sourceName}
          primary={primary}
          renderContent={handleRenderContent}
          getStringValueAtPath={(path) => {
            if (!resolvedNode) return undefined;

            return ResolvedHierarchy.find<NoyaResolvedString>(
              resolvedNode,
              (node): node is NoyaResolvedString =>
                node.type === 'noyaString' &&
                node.path.join('/') === path.join('/'),
            )?.value;
          }}
          onChangeTextAtPath={handleSetTextAtPath}
        />
        <DSRendererOverlay rendererRef={rendererRef} />
      </Stack.V>
      {viewType !== 'preview' && selection && resolvedNode && (
        <DSComponentInspector
          selection={selection}
          setSelection={setSelection}
          findComponent={findComponent}
          onChangeComponent={handleChangeComponent}
          resolvedNode={resolvedNode}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
        />
      )}
    </Stack.H>
  );
}
