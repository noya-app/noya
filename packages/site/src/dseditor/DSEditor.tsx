import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { produce } from 'immer';
import { DS } from 'noya-api';
import {
  Button,
  DividerVertical,
  InputField,
  ListView,
  ScrollArea,
  Select,
  Spacer,
  Stack,
  Text,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { ChevronDownIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import { loadDesignSystem } from 'noya-module-loader';
import { upperFirst, uuid } from 'noya-utils';
import React, { ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { withOptions } from 'tree-visit';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  heroSymbolId,
  heroWithImageSymbolId,
  linkSymbolId,
} from '../ayon/symbols/symbolIds';
import { parametersToTailwindStyle } from '../ayon/tailwind/tailwind';
import { tailwindColors } from '../ayon/tailwind/tailwind.config';
import { InspectorSection } from '../components/InspectorSection';
import { DSRenderProps, DSRenderer } from './DSRenderer';
import { renderDSOverview } from './renderDSOverview';
import {
  NoyaComponent,
  NoyaElement,
  NoyaNode,
  NoyaResolvedNode,
} from './types';

const elements: NoyaElement[] = [
  {
    _class: 'noyaPrimitiveElement',
    name: 'Avatar',
    classNames: [],
    componentID: avatarSymbolId,
    do_objectID: uuid(),
    children: [
      {
        _class: 'noyaString',
        do_objectID: uuid(),
        value: 'Devin Abbott',
      },
    ],
  },
  {
    _class: 'noyaPrimitiveElement',
    name: 'Button',
    classNames: [],
    componentID: buttonSymbolId,
    do_objectID: uuid(),
    children: [
      {
        _class: 'noyaString',
        do_objectID: uuid(),
        value: 'Submit',
      },
    ],
  },
  {
    _class: 'noyaCompositeElement',
    name: 'Hero',
    componentID: heroSymbolId,
    do_objectID: uuid(),
  },
  {
    _class: 'noyaCompositeElement',
    name: 'Hero with Image',
    componentID: heroWithImageSymbolId,
    do_objectID: uuid(),
  },
];

const components: NoyaComponent[] = [
  {
    name: 'Hero',
    _class: 'noyaComponent',
    do_objectID: uuid(),
    componentID: heroSymbolId,
    rootElement: {
      name: 'Box',
      _class: 'noyaPrimitiveElement',
      classNames: ['flex', 'items-center', 'gap-4'],
      componentID: boxSymbolId,
      do_objectID: uuid(),
      children: [
        {
          name: 'Button',
          _class: 'noyaPrimitiveElement',
          classNames: [],
          componentID: buttonSymbolId,
          do_objectID: uuid(),
          children: [
            {
              _class: 'noyaString',
              do_objectID: uuid(),
              value: 'Get Started',
            },
          ],
        },
        {
          name: 'Link',
          _class: 'noyaPrimitiveElement',
          classNames: [],
          componentID: linkSymbolId,
          do_objectID: uuid(),
          children: [
            {
              _class: 'noyaString',
              do_objectID: uuid(),
              value: 'Learn More',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Hero with Image',
    _class: 'noyaComponent',
    do_objectID: uuid(),
    componentID: heroWithImageSymbolId,
    rootElement: {
      name: 'Hero (i)',
      _class: 'noyaCompositeElement',
      componentID: heroSymbolId,
      do_objectID: uuid(),
    },
  },
];

// const CompositeElementHierarchy = withOptions<NoyaNode>({
//   getChildren: (node) => {
//     if (
//       node._class === 'noyaString' ||
//       node._class === 'noyaCompositeElement'
//     ) {
//       return [];
//     }

//     return node.children;
//   },
// });

const ResolvedElementHierarchy = withOptions<NoyaResolvedNode>({
  getChildren: (node) => {
    if (!node) return [];

    if (node._class === 'noyaString') {
      return [];
    }

    return node.children;
  },
});

function resolveComponentHierarchy(
  getCompositeComponent: (id: string) => NoyaComponent | undefined,
  node: NoyaNode,
): NoyaResolvedNode {
  if (node._class === 'noyaString') return node;

  if (node._class === 'noyaPrimitiveElement') {
    const children = node.children.map<NoyaResolvedNode>((child) =>
      resolveComponentHierarchy(getCompositeComponent, child),
    );

    return {
      ...node,
      children,
    };
  }

  if (node._class === 'noyaCompositeElement') {
    const component = getCompositeComponent(node.componentID);

    if (!component) {
      throw new Error(
        `Failed to resolve composite element ${node.name} with Component ID ${node.componentID}`,
      );
    }

    return resolveComponentHierarchy(
      getCompositeComponent,
      component.rootElement,
    );
  }

  return null;
}

interface Props {
  name: string;
  initialDocument: DS;
  onChangeDocument?: (document: DS) => void;
  onChangeName?: (name: string) => void;
  viewType?: 'preview';
}

const designSystems = {
  '@noya-design-system/mui': 'Material Design',
  '@noya-design-system/antd': 'Ant Design',
  '@noya-design-system/chakra': 'Chakra UI',
};

const colorGroups = Object.entries(tailwindColors).flatMap(([name, colors]) => {
  if (typeof colors === 'string') return [];

  return name;
});

const noop = () => {};

const SwatchGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(24px, 1fr))',
  gap: '4px',
});

export function DSEditor({
  initialDocument,
  onChangeDocument = noop,
  name: fileName,
  onChangeName = noop,
  viewType,
}: Props) {
  const theme = useDesignSystemTheme();
  const [state, setState] = React.useState(initialDocument);

  const {
    source: { name: sourceName },
    config: {
      colors: { primary },
    },
  } = state;

  useEffect(() => {
    onChangeDocument(state);
  }, [onChangeDocument, state]);

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
          ResolvedElementHierarchy.diagram(resolved, (node) =>
            !node
              ? '(null)'
              : node._class === 'noyaString'
              ? 's:' + node.value
              : node.name ?? '',
          ),
        );

        return ResolvedElementHierarchy.map<ReactNode>(
          resolved,
          (element, transformedChildren) => {
            if (!element) return null;

            if (element._class === 'noyaString') return element.value;

            const PrimitiveComponent: React.FC<any> =
              props.system.components[element.componentID];

            if (!PrimitiveComponent) return null;

            const style = parametersToTailwindStyle(element.classNames);

            return (
              <PrimitiveComponent style={style}>
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

  const inspector = (
    <Stack.V width="300px" background="white">
      <ScrollArea>
        <Stack.V gap="1px" background={theme.colors.canvas.background}>
          <InspectorSection title="Design System" titleTextStyle="heading3">
            <InspectorPrimitives.LabeledRow label="Name">
              <InputField.Root>
                <InputField.Input value={fileName} onChange={onChangeName} />
              </InputField.Root>
            </InspectorPrimitives.LabeledRow>
            <InspectorPrimitives.LabeledRow label="Base Library">
              <Select
                id="design-system"
                value={sourceName}
                options={Object.keys(designSystems)}
                getTitle={(value) =>
                  designSystems[value as keyof typeof designSystems]
                }
                onChange={(value) => {
                  setState((state) =>
                    produce(state, (draft) => {
                      draft.source.name = value;
                    }),
                  );
                }}
              >
                <Button flex="1">
                  {designSystems[sourceName as keyof typeof designSystems]}
                  <Spacer.Horizontal />
                  <ChevronDownIcon />
                </Button>
              </Select>
            </InspectorPrimitives.LabeledRow>
          </InspectorSection>
          <InspectorSection title="Theme" titleTextStyle="heading4">
            <InspectorPrimitives.LabeledRow label="Primary Color">
              <Select
                id="primary-color"
                value={primary}
                options={colorGroups}
                getTitle={upperFirst}
                onChange={(value) => {
                  setState((state) =>
                    produce(state, (draft) => {
                      draft.config.colors.primary = value;
                    }),
                  );
                }}
              >
                <Button flex="1">
                  {primary}
                  <Spacer.Horizontal />
                  <ChevronDownIcon />
                </Button>
              </Select>
            </InspectorPrimitives.LabeledRow>
            <SwatchGrid>
              {colorGroups.map((name) => (
                <div
                  key={name}
                  role="button"
                  onClick={() => {
                    setState((state) =>
                      produce(state, (draft) => {
                        draft.config.colors.primary = name;
                      }),
                    );
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: (tailwindColors as any)[name as any][500],
                    // Selected
                    boxShadow:
                      name === primary
                        ? `0 0 0 2px ${theme.colors.primary}, 0 0 0 1px white inset`
                        : undefined,
                  }}
                />
              ))}
            </SwatchGrid>
          </InspectorSection>
          <InspectorSection title="Components" titleTextStyle="heading4">
            <InspectorPrimitives.SectionHeader>
              <InspectorPrimitives.Title>Components</InspectorPrimitives.Title>
            </InspectorPrimitives.SectionHeader>
            <ListView.Root>
              {elements.map((element) => (
                <ListView.Row
                  key={element.componentID}
                  selected={element.componentID === selectedElementId}
                  onPress={() => setSelectedElementId(element.componentID)}
                >
                  <Text variant="code" flex="1">
                    {element.name}
                  </Text>
                </ListView.Row>
              ))}
            </ListView.Root>
          </InspectorSection>
          {system && (
            <InspectorSection title="Library Details" titleTextStyle="heading4">
              {system.dependencies && (
                <Stack.V>
                  <InspectorPrimitives.SectionHeader>
                    <InspectorPrimitives.Title>
                      Dependencies
                    </InspectorPrimitives.Title>
                  </InspectorPrimitives.SectionHeader>
                  <Spacer.Vertical size={8} />
                  <Stack.V background={theme.colors.codeBackground}>
                    <ListView.Root>
                      {Object.entries(system.dependencies).map(
                        ([key, value]) => (
                          <ListView.Row key={key}>
                            <Text variant="code" flex="1">
                              {key}
                            </Text>
                            <Text variant="code">{value}</Text>
                          </ListView.Row>
                        ),
                      )}
                    </ListView.Root>
                  </Stack.V>
                </Stack.V>
              )}
            </InspectorSection>
          )}
        </Stack.V>
      </ScrollArea>
    </Stack.V>
  );

  return (
    <Stack.H flex="1">
      {viewType !== 'preview' && (
        <>
          {inspector}
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
