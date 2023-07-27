import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { DS } from 'noya-api';
import {
  DividerVertical,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { loadDesignSystem } from 'noya-module-loader';
import { findLast, uuid } from 'noya-utils';
import React, { ReactNode, useCallback, useEffect, useMemo } from 'react';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { parametersToTailwindStyle } from '../ayon/tailwind/tailwind';
import { DSLayerInspector } from './DSLayerInspector';
import { DSProjectInspector } from './DSProjectInspector';
import { DSRenderProps, DSRenderer } from './DSRenderer';
import { Model } from './builders';
import { initialComponents } from './builtins';
import { renderDSOverview } from './renderDSOverview';
import { ResolvedHierarchy, createResolvedNode } from './traversal';
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

  const resolvedNode = useMemo(() => {
    if (!selection) return undefined;

    return createResolvedNode(findComponent, selection);
  }, [findComponent, selection]);

  const handleRenderContent = React.useCallback(
    (props: DSRenderProps) => {
      if (selection && resolvedNode) {
        console.info(
          ResolvedHierarchy.diagram(resolvedNode, (node, indexPath) => {
            if (!node) return '()';

            if (node.type === 'noyaString') return `"${node.value}"`;

            return [node.name, `(${node.path.join('/')})`]
              .filter(Boolean)
              .join(' ');
          }),
        );

        const content = ResolvedHierarchy.map<ReactNode>(
          resolvedNode,
          (element, transformedChildren) => {
            if (element.status === 'removed') return null;

            if (element.type === 'noyaString') return element.value;

            if (element.type === 'noyaCompositeElement')
              return transformedChildren;

            const PrimitiveComponent: React.FC<any> =
              props.system.components[element.componentID];

            if (!PrimitiveComponent) return null;

            const classNames = element.classNames
              .filter((className) => className.status !== 'removed')
              .map((className) => {
                return className.value.replace(/-primary-/, `-${primary}-`);
              });

            const style = parametersToTailwindStyle(classNames);

            const variantClassName = findLast(classNames, (className) =>
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
                // _passthrough={{
                //   contentEditable:
                //     element.componentID === buttonSymbolId ||
                //     element.componentID === tagSymbolId ||
                //     element.componentID === linkSymbolId ||
                //     element.componentID === textSymbolId,
                // }}
              >
                {transformedChildren}
              </PrimitiveComponent>
            );
          },
        );

        return (
          <div
            // onInput={(e) => {
            //   console.log('input', e.nativeEvent.target);
            // }}
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
    [primary, resolvedNode, selection, theme.colors.canvas.background],
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
          selection={selection}
          setSelection={setSelection}
          components={components}
          onNewComponent={handleNewComponent}
          onDeleteComponent={handleDeleteComponent}
        />
      )}
      <DSRenderer
        sourceName={sourceName}
        primary={primary}
        renderContent={handleRenderContent}
      />
      {viewType !== 'preview' && selection && resolvedNode && (
        <DSLayerInspector
          selection={selection}
          setSelection={setSelection}
          findComponent={findComponent}
          onChangeComponent={handleChangeComponent}
          resolvedNode={resolvedNode}
        />
      )}
    </Stack.H>
  );
}
