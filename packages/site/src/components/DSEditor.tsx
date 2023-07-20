import {
  AvatarProps,
  ButtonProps,
  CheckboxProps,
  DesignSystemDefinition,
  InputProps,
  LinkProps,
  RadioProps,
  RenderableRoot,
  SelectProps,
  SwitchProps,
  TagProps,
  Theme,
  component,
  transform,
} from '@noya-design-system/protocol';
import { produce } from 'immer';
import { DS } from 'noya-api';
import {
  Button,
  DividerVertical,
  InputField,
  ListView,
  Popover,
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
import { SketchModel } from 'noya-sketch-model';
import { upperFirst } from 'noya-utils';
import React, {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import { heroSymbol } from '../ayon/symbols/composed/HeroSymbol';
import { librarySymbolMap } from '../ayon/symbols/symbols';
import { tailwindColors } from '../ayon/tailwind/tailwind.config';
import { renderDynamicContent } from '../ayon/utils/renderDynamicContent';
import { useProject } from '../contexts/ProjectContext';
import { InspectorSection } from './InspectorSection';
import { ProjectTitle } from './ProjectTitle';

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

  const [root, setRoot] = React.useState<RenderableRoot | undefined>();

  const {
    source: { name: sourceName },
    config: {
      colors: { primary },
    },
  } = state;

  const { setCenterToolbar } = useProject();

  useLayoutEffect(() => {
    setCenterToolbar(
      <Popover
        trigger={
          <ProjectTitle projectType="io.noya.ds">{fileName}</ProjectTitle>
        }
      >
        <Stack.V width={240}>
          <InspectorPrimitives.Section>
            <InspectorPrimitives.SectionHeader>
              <InspectorPrimitives.Title>
                Project Name
              </InspectorPrimitives.Title>
            </InspectorPrimitives.SectionHeader>
            <InspectorPrimitives.VerticalSeparator />
            <InspectorPrimitives.Row>
              <InputField.Root>
                <InputField.Input value={fileName} onSubmit={onChangeName} />
              </InputField.Root>
            </InspectorPrimitives.Row>
          </InspectorPrimitives.Section>
        </Stack.V>
      </Popover>,
    );
  }, [fileName, onChangeName, setCenterToolbar, sourceName]);

  useEffect(() => {
    onChangeDocument(state);
  }, [onChangeDocument, state]);

  const [system, setSystem] = React.useState<
    DesignSystemDefinition | undefined
  >();

  useEffect(() => {
    async function fetchLibrary() {
      const system = await loadDesignSystem(sourceName, {
        Function: ref.current!.contentWindow!['Function' as any] as any,
        enableCache: false,
      });

      setSystem(system);
    }

    setSystem(undefined);
    fetchLibrary();
  }, [sourceName]);

  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (system && !root) {
      setRoot(system.createRoot(ref.current!.contentDocument!.body));
    } else if (!system && root) {
      root.unmount();
      setRoot(undefined);
    }
  }, [root, system]);

  const dsTheme = useMemo(() => {
    if (!system || !system.themeTransformer) return undefined;

    const t: Theme = {
      colors: {
        primary: (tailwindColors as any)[primary as any],
        neutral: tailwindColors.slate,
      },
    };

    const themeValue = transform({ theme: t }, system.themeTransformer);

    return themeValue;
  }, [primary, system]);

  useLayoutEffect(() => {
    if (!root || !system) return;

    const Provider = system.components[component.id.Provider];
    const Button: React.FC<ButtonProps> =
      system.components[component.id.Button];
    const Checkbox: React.FC<CheckboxProps> =
      system.components[component.id.Checkbox];
    const Radio: React.FC<RadioProps> = system.components[component.id.Radio];
    const Select: React.FC<SelectProps> =
      system.components[component.id.Select];
    const Switch: React.FC<SwitchProps> =
      system.components[component.id.Switch];
    const Tag: React.FC<TagProps> = system.components[component.id.Tag];
    const Link: React.FC<LinkProps> = system.components[component.id.Link];
    const Input: React.FC<InputProps> = system.components[component.id.Input];
    const Textarea: React.FC<InputProps> =
      system.components[component.id.Textarea];
    const Avatar: React.FC<AvatarProps> =
      system.components[component.id.Avatar];

    // const renderBox = boxSymbol.blockDefinition!.render!;

    const getSymbolMaster = (symbolId: string) => librarySymbolMap[symbolId];

    const hero = renderDynamicContent(
      system,
      SketchModel.artboard({
        layers: [
          SketchModel.symbolInstance({
            symbolID: heroSymbol.symbolID,
          }),
        ],
      }),
      getSymbolMaster,
      undefined,
      dsTheme,
      'automatic-layout',
    );

    const sectionStyle: CSSProperties = {
      padding: '20px',
      borderRadius: '4px',
      background: 'white',
      border: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative',
    } as const;

    const subSectionStyle = {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
      alignItems: 'center',
      position: 'relative',
    } as const;

    const content = (
      <div
        style={{
          padding: '20px',
          gap: '12px',
          display: 'flex',
          flexDirection: 'column',
          background: theme.colors.canvas.background,
          minHeight: '100%',
        }}
      >
        <span>Primitive Elements</span>
        <div style={sectionStyle}>
          <div style={subSectionStyle}>
            <Button variant="solid">Button</Button>
            <Button variant="outline">Button</Button>
            <Button variant="text">Button</Button>
            <Tag variant="solid">Tag</Tag>
            <Tag variant="outline">Tag</Tag>
            <Link href="#">Link</Link>
            <Avatar
              name="Devin Abbott"
              style={{
                width: '32px',
                height: '32px',
              }}
            />
            <Avatar
              style={{
                width: '32px',
                height: '32px',
              }}
            />
          </div>
          <div style={subSectionStyle}>
            <Checkbox checked label="Checkbox" />
            <Radio checked label="Radio" />
            <Select
              options={['Option 1', 'Option 2', 'Option 3']}
              value="Option 1"
            />
            <Switch checked />
          </div>
          <div style={subSectionStyle}>
            <Input placeholder="Input" />
            <Textarea placeholder="Textarea" />
          </div>
        </div>
        <span>Hero</span>
        <div style={sectionStyle}>{hero}</div>
      </div>
    );

    const withProvider = Provider ? (
      <Provider theme={dsTheme}>{content}</Provider>
    ) : (
      content
    );

    root.render(withProvider);
  }, [dsTheme, root, state, system, theme.colors.canvas.background]);

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
          {system && (
            <InspectorSection title="Library Details" titleTextStyle="heading4">
              {/* <InspectorPrimitives.LabeledRow label="Template">
          <Text variant="code" fontSize="12px">
            {sourceName}
          </Text>
        </InspectorPrimitives.LabeledRow>
        <InspectorPrimitives.LabeledRow label="Template Version">
          <Text variant="code" fontSize="12px">
            {system.version}
          </Text>
        </InspectorPrimitives.LabeledRow> */}
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
      <Stack.V flex="1" position="relative">
        <iframe
          title="Design System Preview"
          ref={ref}
          srcDoc="<!DOCTYPE html>"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        {!system && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '4px 8px',
              color: '#aaa',
              pointerEvents: 'none',
            }}
          >
            Loading design system...
          </div>
        )}
      </Stack.V>
    </Stack.H>
  );
}
