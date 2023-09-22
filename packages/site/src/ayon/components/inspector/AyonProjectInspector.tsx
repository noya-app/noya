import { NoyaAPI, useNoyaClient } from 'noya-api';
import { useApplicationState } from 'noya-app-state-context';
import {
  Button,
  DropdownMenu,
  GridView,
  RegularMenuItem,
  Spacer,
  Stack,
  createSectionedMenu,
  lightTheme,
  useDesignSystemTheme,
} from 'noya-designsystem';
import {
  ChevronDownIcon,
  DesktopIcon,
  LaptopIcon,
  MobileIcon,
} from 'noya-icons';
import { DimensionInput, InspectorPrimitives } from 'noya-inspector';
import { Layers, Selectors } from 'noya-state';
import React, { useEffect, useState } from 'react';
import { DEFAULT_DESIGN_SYSTEM } from '../../../components/DSContext';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSThemeInspector } from '../../../dseditor/DSThemeInspector';

const sizeList = [
  {
    name: 'Desktop',
    width: 1440,
    height: 900,
    icon: <DesktopIcon width={30} height={30} />,
  },
  {
    name: 'Laptop',
    width: 1280,
    height: 720,
    icon: <LaptopIcon width={30} height={30} />,
  },
  {
    name: 'Tablet',
    width: 1024,
    height: 768,
    icon: <MobileIcon width={30} height={30} transform="rotate(270)" />,
  },
  {
    name: 'Mobile',
    width: 390,
    height: 844,
    icon: <MobileIcon width={30} height={30} />,
  },
];

const designSystems = {
  '@noya-design-system/mui': 'Material Design',
  '@noya-design-system/antd': 'Ant Design',
  '@noya-design-system/chakra': 'Chakra UI',
};

const noop = () => {};

export function AyonProjectInspector({
  name,
  onChangeName = noop,
  onDuplicate = noop,
}: {
  name: string;
  onChangeName?: (name: string) => void;
  onDuplicate?: () => void;
}) {
  const [state, dispatch] = useApplicationState();
  const [{ files, loading }, setFiles] = useState<{
    files: NoyaAPI.File[];
    loading: boolean;
  }>({ files: [], loading: true });
  const client = useNoyaClient();

  useEffect(() => {
    client.networkClient.files.list().then((files) => {
      setFiles({ files, loading: false });
    });
  }, [client]);

  const customDesignSystems = files
    .filter((file) => file.data.type === 'io.noya.ds')
    .map((file): RegularMenuItem<string> => {
      return {
        value: file.id,
        title: file.data.name,
      };
    });

  const designSystemMenu = createSectionedMenu(
    Object.entries(designSystems).map(([key, value]) => ({
      value: key as keyof typeof designSystems,
      title: value,
    })),
    customDesignSystems,
  );

  const artboard = Layers.find(
    Selectors.getCurrentPage(state),
    Layers.isArtboard,
  );

  const currentDesignSystem =
    state.sketch.document.designSystem ?? DEFAULT_DESIGN_SYSTEM;

  const theme = useDesignSystemTheme();

  if (!artboard) return null;

  return (
    <Stack.V
      gap="1px"
      position="relative"
      background={theme.colors.canvas.background}
    >
      <InspectorSection title="Project" titleTextStyle="heading3">
        {/* <InspectorPrimitives.LabeledRow label="Name">
          <InputField.Root>
            <InputField.Input
              placeholder="Untitled"
              value={name}
              onChange={onChangeName}
            />
          </InputField.Root>
        </InspectorPrimitives.LabeledRow> */}
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Canvas Size</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <Stack.V flex="1">
          <GridView.Root
            scrollable={false}
            size="xs"
            textPosition="overlay"
            bordered
          >
            <GridView.Section padding={0}>
              {sizeList.map(({ name, width, height, icon }, index) => {
                return (
                  <GridView.Item
                    key={index}
                    id={name}
                    title={name}
                    subtitle={`${width}×${height}`}
                    onClick={() => {
                      dispatch('batch', [
                        [
                          'setLayerWidth',
                          artboard.do_objectID,
                          width,
                          'replace',
                          'scale',
                        ],
                        [
                          'setLayerHeight',
                          artboard.do_objectID,
                          height,
                          'replace',
                          'translate',
                        ],
                        [
                          'zoomToFit*',
                          { type: 'layer', value: artboard.do_objectID },
                          { padding: 20, max: 1, position: 'top' },
                        ],
                      ]);
                    }}
                    selected={
                      width === artboard.frame.width &&
                      height === artboard.frame.height
                    }
                  >
                    <Stack.V
                      tabIndex={-1}
                      background={'white'}
                      width="100%"
                      height="100%"
                      color={lightTheme.colors.icon}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {icon}
                    </Stack.V>
                  </GridView.Item>
                );
              })}
            </GridView.Section>
          </GridView.Root>
        </Stack.V>
        <InspectorPrimitives.Row>
          <DimensionInput
            value={artboard.frame.width}
            onSetValue={(value, mode) => {
              dispatch('setLayerWidth', artboard.do_objectID, value, mode);
              dispatch(
                'zoomToFit*',
                { type: 'layer', value: artboard.do_objectID },
                { padding: 20, max: 1, position: 'top' },
              );
            }}
            label="W"
          />
          <Spacer.Horizontal size={16} />
          <DimensionInput
            value={artboard.frame.height}
            onSetValue={(value, mode) => {
              dispatch('setLayerHeight', artboard.do_objectID, value, mode);
              dispatch(
                'zoomToFit*',
                { type: 'layer', value: artboard.do_objectID },
                { padding: 20, max: 1, position: 'top' },
              );
            }}
            label="H"
          />
        </InspectorPrimitives.Row>
        <InspectorPrimitives.LabeledRow label="Design System">
          <DropdownMenu
            items={designSystemMenu}
            onSelect={(value) => {
              if (loading) return;

              if (value.startsWith('@noya-design-system')) {
                dispatch('setDesignSystem', 'standard', value);
              } else {
                dispatch('setDesignSystem', 'custom', value);
              }
            }}
          >
            <Button flex="1">
              {currentDesignSystem.type === 'standard'
                ? designSystems[
                    currentDesignSystem.id as keyof typeof designSystems
                  ]
                : customDesignSystems.find(
                    (item) => item.value === currentDesignSystem.id,
                  )?.title ?? null}
              <Spacer.Horizontal />
              <ChevronDownIcon />
            </Button>
          </DropdownMenu>
        </InspectorPrimitives.LabeledRow>
      </InspectorSection>
      <DSThemeInspector
        dsConfig={currentDesignSystem.config}
        onChangeDSConfig={(config) => {
          dispatch('setDesignSystemConfig', config);
        }}
      />
      <InspectorSection title="Actions" titleTextStyle="heading4">
        <Button onClick={onDuplicate}>Duplicate Project</Button>
      </InspectorSection>
    </Stack.V>
  );
}
