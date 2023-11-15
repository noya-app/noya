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
import { ViewType } from '../ayon/types';
import { DSComponentInspector } from './DSComponentInspector';
import { DSControlledRenderer } from './DSControlledRenderer';
import { DSProjectInspector } from './DSProjectInspector';
import { DSRenderProps, IDSRenderer } from './DSRenderer';
import { DSRendererOverlay } from './DSRendererOverlay';
import { Model } from './builders';
import { initialComponents } from './builtins';
import { renderDSOverview } from './renderDSOverview';
import { renderDSPreview } from './renderDSPreview';
import { ResolvedHierarchy } from './resolvedHierarchy';
import { diffResolvedTrees, instantiateResolvedComponent } from './traversal';
import { NoyaComponent, NoyaResolvedString, SelectedComponent } from './types';

const noop = () => {};

interface Props {
  name: string;
  initialDocument: DS;
  onChangeDocument?: (document: DS) => void;
  onChangeName?: (name: string) => void;
  viewType?: ViewType;
  initialComponentId?: string;
}
export function DSEditor({
  initialDocument,
  onChangeDocument = noop,
  name: fileName,
  onChangeName = noop,
  viewType,
  initialComponentId,
}: Props) {
  const theme = useDesignSystemTheme();
  const [ds, setDS] = React.useState(initialDocument);

  const {
    source: { name: sourceName },
    config,
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
  >(initialComponentId ? { componentID: initialComponentId } : undefined);

  const [highlightedPath, setHighlightedPath] = React.useState<
    string[] | undefined
  >();

  const findComponent = useCallback(
    (id: string) =>
      components.find((component) => component.componentID === id),
    [components],
  );

  const handleNewComponent = useCallback(
    (componentID?: string) => {
      const newComponent = Model.component({
        componentID: componentID ?? uuid(),
        rootElement: Model.primitiveElement({
          componentID: boxSymbolId,
        }),
      });

      setComponents([...components, newComponent]);
      setSelection({
        componentID: newComponent.componentID,
      });
    },
    [components, setComponents],
  );

  const handleCreateComponent = useCallback(
    (component: NoyaComponent) => {
      setComponents([...components, component]);
    },
    [components, setComponents],
  );

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
        if (!selection) return selection;

        const instance = instantiateResolvedComponent(findComponent, {
          componentID: selection.componentID,
          variantID: selection.variantID,
          diff: selection.diff,
        });

        const indexPath = ResolvedHierarchy.findIndexPath(
          instance,
          (node) => node.path.join('/') === path.join('/'),
        );

        if (!indexPath) return selection;

        const originalNode = ResolvedHierarchy.access(
          instance,
          indexPath,
        ) as NoyaResolvedString;

        const newResolvedNode = ResolvedHierarchy.replace(instance, {
          at: indexPath,
          node: { ...originalNode, value },
        });

        const initialInstance = instantiateResolvedComponent(findComponent, {
          componentID: selection.componentID,
          variantID: selection.variantID,
        });

        const diff = diffResolvedTrees(initialInstance, newResolvedNode);

        return { ...selection, diff };
      });
    },
    [findComponent],
  );

  const resolvedNode = useMemo(() => {
    if (!selection) return undefined;
    return instantiateResolvedComponent(findComponent, selection);
  }, [findComponent, selection]);

  const handleRenderContent = React.useCallback(
    (props: DSRenderProps) => {
      if (selection && resolvedNode) {
        return renderDSPreview({
          renderProps: props,
          highlightedPath,
          dsConfig: config,
          resolvedNode,
          canvasBackgroundColor: theme.colors.canvas.background,
          selectionOutlineColor: theme.colors.primary,
          padding: viewType === 'preview' ? 0 : 20,
        });
      }

      return renderDSOverview({
        ...props,
        backgroundColor: theme.colors.canvas.background,
      });
    },
    [
      selection,
      resolvedNode,
      theme.colors.canvas.background,
      theme.colors.primary,
      highlightedPath,
      config,
      viewType,
    ],
  );

  const rendererRef = React.useRef<IDSRenderer>(null);

  const handleSelectComponent = useCallback(
    (componentId?: string) => {
      setSelection(componentId ? { componentID: componentId } : undefined);
    },
    [setSelection],
  );

  return (
    <Stack.H flex="1" separator={<DividerVertical />}>
      {viewType !== 'preview' && (
        <DSProjectInspector
          name={fileName}
          findComponent={findComponent}
          onChangeName={onChangeName}
          system={system}
          ds={ds}
          setDS={setDS}
          selectedComponentID={selection?.componentID}
          onSelectComponent={handleSelectComponent}
          components={components}
          onNewComponent={handleNewComponent}
          onDeleteComponent={handleDeleteComponent}
          onMoveComponent={(componentID, index) => {
            const removalIndex = components.findIndex(
              (c) => c.componentID === componentID,
            );

            if (removalIndex === -1) return;

            const component = components[removalIndex];
            const newComponents = [...components];

            newComponents.splice(removalIndex, 1);
            newComponents.splice(
              index < removalIndex ? index : index - 1,
              0,
              component,
            );

            setComponents(newComponents);
          }}
        />
      )}
      <Stack.V flex="1" overflow="hidden" position="relative">
        <DSControlledRenderer
          ref={rendererRef}
          sourceName={sourceName}
          config={config}
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
          onCreateComponent={handleCreateComponent}
          components={components}
        />
      )}
    </Stack.H>
  );
}
