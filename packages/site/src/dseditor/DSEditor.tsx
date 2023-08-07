import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { DS } from 'noya-api';
import {
  DividerVertical,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { loadDesignSystem } from 'noya-module-loader';
import { useDeepState } from 'noya-react-utils';
import { uuid } from 'noya-utils';
import React, { useCallback, useEffect, useMemo } from 'react';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { DSComponentInspector } from './DSComponentInspector';
import { DSProjectInspector } from './DSProjectInspector';
import { DSRenderProps, DSRenderer, IDSRenderer } from './DSRenderer';
import { DSRendererOverlay } from './DSRendererOverlay';
import { Model } from './builders';
import { initialComponents } from './builtins';
import { contentReducer } from './contentReducer';
import { mergeDiffs } from './diff';
import { SerializedSelection } from './dom';
import { renderDSOverview } from './renderDSOverview';
import { findStringElementPath, renderDSPreview } from './renderDSPreview';
import { createResolvedNode } from './traversal';
import { NoyaComponent, NoyaCompositeElement } from './types';

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
    NoyaCompositeElement | undefined
  >();

  const [highlightedPath, setHighlightedPath] = React.useState<
    string[] | undefined
  >();

  const [serializedSelection, setSerializedSelection] = useDeepState<
    SerializedSelection | undefined
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
          Model.diff([
            Model.diffItem({
              path: path.slice(1),
              textValue: value,
            }),
          ]),
        );

        return selection ? { ...selection, diff: merged } : undefined;
      });
    },
    [],
  );

  const resolvedNode = useMemo(() => {
    if (!selection) return undefined;

    return createResolvedNode(findComponent, selection);
  }, [findComponent, selection]);

  const handleRenderContent = React.useCallback(
    (props: DSRenderProps) => {
      if (selection && resolvedNode) {
        return renderDSPreview({
          renderProps: props,
          handleSetTextAtPath,
          highlightedPath,
          primary,
          resolvedNode,
          serializedSelection,
          canvasBackgroundColor: theme.colors.canvas.background,
          selectionOutlineColor: theme.colors.primary,
          setHighlightedPath,
          setSerializedSelection,
        });
      }

      return renderDSOverview({
        ...props,
        backgroundColor: theme.colors.canvas.background,
      });
    },
    [
      handleSetTextAtPath,
      highlightedPath,
      primary,
      resolvedNode,
      selection,
      serializedSelection,
      setSerializedSelection,
      theme.colors.canvas.background,
      theme.colors.primary,
    ],
  );

  const handleBeforeInput = useCallback(
    (event: InputEvent) => {
      event.preventDefault();

      const ranges = event.getTargetRanges();
      const range = ranges[0];

      if (!range || !range.startContainer.isSameNode(range.endContainer)) {
        return;
      }

      const path = findStringElementPath(range.startContainer.parentElement);

      if (!path) return;

      const content = contentReducer(range.startContainer.textContent, {
        insertText: event.data,
        range: [range.startOffset, range.endOffset],
      });

      handleSetTextAtPath({ path, value: content.string });

      if (serializedSelection) {
        setSerializedSelection({
          ...serializedSelection,
          anchorOffset: content.range[0],
          focusOffset: content.range[1],
        });
      }
    },
    [handleSetTextAtPath, serializedSelection, setSerializedSelection],
  );

  const rendererRef = React.useRef<IDSRenderer>(null);

  return (
    <Stack.H flex="1" separator={<DividerVertical />}>
      {viewType !== 'preview' && (
        <DSProjectInspector
          name={fileName}
          onChangeName={onChangeName}
          system={system}
          ds={ds}
          setDS={setDS}
          selection={selection}
          setSelection={setSelection}
          components={components}
          onNewComponent={handleNewComponent}
          onDeleteComponent={handleDeleteComponent}
        />
      )}
      <Stack.V flex="1" overflow="hidden" position="relative">
        <DSRenderer
          ref={rendererRef}
          sourceName={sourceName}
          primary={primary}
          renderContent={handleRenderContent}
          serializedSelection={serializedSelection}
          onBeforeInput={handleBeforeInput}
          setSerializedSelection={setSerializedSelection}
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
