import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { DS } from 'noya-api';
import {
  DividerVertical,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { loadDesignSystem } from 'noya-module-loader';
import React, { ReactNode, useEffect } from 'react';
import { parametersToTailwindStyle } from '../ayon/tailwind/tailwind';
import { DSProjectInspector } from './DSProjectInspector';
import { DSRenderProps, DSRenderer } from './DSRenderer';
import { renderDSOverview } from './renderDSOverview';
import {
  ResolvedElementHierarchy,
  components,
  elements,
  getIdPath,
  resolveComponentHierarchy,
} from './traversal';

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
  } = ds;

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

  const [selectedElementId, setSelectedElementId] = React.useState<
    string | undefined
  >();

  const handleRenderContent = React.useCallback(
    (props: DSRenderProps) => {
      if (selectedElementId) {
        const element = elements.find(
          (element) => element.componentID === selectedElementId,
        );

        if (!element) return null;

        const findComponent = (id: string) =>
          components.find((component) => component.componentID === id);

        const resolved = resolveComponentHierarchy(findComponent, element);

        console.info(
          ResolvedElementHierarchy.diagram(resolved, (node, indexPath) => {
            if (!node) return '()';

            if (node._class === 'noyaString') return `"${node.value}"`;

            return [node.name, `(${getIdPath(resolved, indexPath)})`]
              .filter(Boolean)
              .join(' ');
          }),
        );

        return ResolvedElementHierarchy.map<ReactNode>(
          resolved,
          (element, transformedChildren, indexPath) => {
            if (!element) return null;

            if (element._class === 'noyaString') return element.value;

            const idPath = getIdPath(resolved, indexPath);

            const PrimitiveComponent: React.FC<any> =
              props.system.components[element.componentID];

            if (!PrimitiveComponent) return null;

            const style = parametersToTailwindStyle(element.classNames);

            return (
              <PrimitiveComponent style={style} key={idPath}>
                {transformedChildren}
              </PrimitiveComponent>
            );
          },
        );
      }

      return renderDSOverview({
        ...props,
        backgroundColor: theme.colors.canvas.background,
      });
    },
    [selectedElementId, theme.colors.canvas.background],
  );

  return (
    <Stack.H flex="1">
      {viewType !== 'preview' && (
        <>
          <DSProjectInspector
            name={fileName}
            onChangeName={onChangeName}
            system={system}
            ds={ds}
            setDS={setDS}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
          />
          <DividerVertical />
        </>
      )}
      <DSRenderer
        sourceName={sourceName}
        primary={primary}
        renderContent={handleRenderContent}
      />
    </Stack.H>
  );
}
