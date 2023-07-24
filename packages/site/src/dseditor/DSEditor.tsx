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
import { Model } from './builders';
import { renderDSOverview } from './renderDSOverview';
import {
  ResolvedElementHierarchy,
  getIdPath,
  initialComponents,
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

  const [selectedComponentId, setSelectedComponentId] = React.useState<
    string | undefined
  >();

  const handleRenderContent = React.useCallback(
    (props: DSRenderProps) => {
      if (selectedComponentId) {
        const findComponent = (id: string) =>
          initialComponents.find((component) => component.componentID === id);

        const rootComponent = findComponent(selectedComponentId);

        if (!rootComponent) return null;

        const resolved = resolveComponentHierarchy(
          findComponent,
          Model.compositeElement(rootComponent.componentID),
        );

        console.info(
          ResolvedElementHierarchy.diagram(resolved, (node, indexPath) => {
            if (!node) return '()';

            if (node.type === 'noyaString') return `"${node.value}"`;

            return [node.name, `(${getIdPath(resolved, indexPath)})`]
              .filter(Boolean)
              .join(' ');
          }),
        );

        const content = ResolvedElementHierarchy.map<ReactNode>(
          resolved,
          (element, transformedChildren, indexPath) => {
            if (!element) return null;

            if (element.type === 'noyaString') return element.value;

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

        return (
          <div
            style={{
              padding: '20px',
              background: theme.colors.canvas.background,
              minHeight: '100%',
            }}
          >
            {content}
          </div>
        );
      }

      return renderDSOverview({
        ...props,
        backgroundColor: theme.colors.canvas.background,
      });
    },
    [selectedComponentId, theme.colors.canvas.background],
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
            selectedComponentId={selectedComponentId}
            setSelectedComponentId={setSelectedComponentId}
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
