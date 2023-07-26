import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { DS } from 'noya-api';
import {
  DividerVertical,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { loadDesignSystem } from 'noya-module-loader';
import { findLast } from 'noya-utils';
import React, { ReactNode, useCallback, useEffect } from 'react';
import { parametersToTailwindStyle } from '../ayon/tailwind/tailwind';
import { DSLayerInspector } from './DSLayerInspector';
import { DSProjectInspector } from './DSProjectInspector';
import { DSRenderProps, DSRenderer } from './DSRenderer';
import { Model } from './builders';
import { initialComponents } from './builtins';
import { renderDSOverview } from './renderDSOverview';
import {
  ResolvedElementHierarchy,
  resolveComponentHierarchy,
} from './traversal';
import { SelectedComponent } from './types';

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

  const [selectedComponent, setSelectedComponent] = React.useState<
    SelectedComponent | undefined
  >();

  const findComponent = useCallback(
    (id: string) =>
      initialComponents.find((component) => component.componentID === id),
    [],
  );

  const handleRenderContent = React.useCallback(
    (props: DSRenderProps) => {
      if (selectedComponent) {
        const resolved = resolveComponentHierarchy(
          findComponent,
          Model.compositeElement({
            id: 'root',
            componentID: selectedComponent.componentID,
            variantID: selectedComponent.variantID,
          }),
          [],
        );

        console.info(
          ResolvedElementHierarchy.diagram(resolved, (node, indexPath) => {
            if (!node) return '()';

            if (node.type === 'noyaString') return `"${node.value}"`;

            return [node.name, `(${node.path.join('/')})`]
              .filter(Boolean)
              .join(' ');
          }),
        );

        const content = ResolvedElementHierarchy.map<ReactNode>(
          resolved,
          (element, transformedChildren, indexPath) => {
            if (!element) return null;

            if (element.type === 'noyaString') return element.value;

            const PrimitiveComponent: React.FC<any> =
              props.system.components[element.componentID];

            if (!PrimitiveComponent) return null;

            const style = parametersToTailwindStyle(
              element.classNames.map((className) => {
                return className.replace(/-primary-/, `-${primary}-`);
              }),
            );

            const variantClassName = findLast(element.classNames, (className) =>
              className.startsWith('variant-'),
            );
            const variant = variantClassName
              ? variantClassName.split('-')[1]
              : undefined;

            return (
              <PrimitiveComponent
                style={style}
                key={element.path.join('/')}
                {...(variant && { variant })}
              >
                {transformedChildren}
              </PrimitiveComponent>
            );
          },
        );

        return (
          <div
            style={{
              backgroundImage: `radial-gradient(circle at 0px 0px, rgba(0,0,0,0.25) 1px, ${theme.colors.canvas.background} 0px)`,
              backgroundSize: '10px 10px',
              minHeight: '100%',
              display: 'flex',
              alignItems: 'stretch',
              flexDirection: 'column',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                background: 'white',
              }}
            >
              {content}
            </div>
          </div>
        );
      }

      return renderDSOverview({
        ...props,
        backgroundColor: theme.colors.canvas.background,
      });
    },
    [findComponent, primary, selectedComponent, theme.colors.canvas.background],
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
          selectedComponent={selectedComponent}
          setSelectedComponent={setSelectedComponent}
        />
      )}
      <DSRenderer
        sourceName={sourceName}
        primary={primary}
        renderContent={handleRenderContent}
      />
      {viewType !== 'preview' && selectedComponent && (
        <DSLayerInspector
          selectedComponent={selectedComponent}
          setSelectedComponent={setSelectedComponent}
          findComponent={findComponent}
        />
      )}
    </Stack.H>
  );
}
