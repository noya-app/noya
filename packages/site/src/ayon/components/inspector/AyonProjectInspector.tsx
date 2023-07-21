import { NoyaAPI, useNoyaClient } from 'noya-api';
import { useApplicationState } from 'noya-app-state-context';
import {
  Button,
  DropdownMenu,
  InputField,
  RegularMenuItem,
  Spacer,
  Stack,
  createSectionedMenu,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { ChevronDownIcon } from 'noya-icons';
import { DimensionInput, InspectorPrimitives } from 'noya-inspector';
import { Layers, Selectors } from 'noya-state';
import React, { useEffect, useState } from 'react';
import { DEFAULT_DESIGN_SYSTEM } from '../../../components/DSContext';
import { InspectorSection } from '../../../components/InspectorSection';

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
  onChangeDesignSystem = noop,
}: {
  name: string;
  onChangeName?: (name: string) => void;
  onDuplicate?: () => void;
  onChangeDesignSystem?: (type: 'standard' | 'custom', name: string) => void;
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
        <InspectorPrimitives.LabeledRow label="Name">
          <InputField.Root>
            <InputField.Input
              placeholder="Untitled"
              value={name}
              onChange={onChangeName}
            />
          </InputField.Root>
        </InspectorPrimitives.LabeledRow>
        <InspectorPrimitives.LabeledRow label="Canvas Size">
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
        </InspectorPrimitives.LabeledRow>
        <InspectorPrimitives.LabeledRow label="Design System">
          <DropdownMenu
            items={designSystemMenu}
            onSelect={(value) => {
              if (loading) return;

              if (value.startsWith('@noya-design-system')) {
                onChangeDesignSystem('standard', value);
              } else {
                onChangeDesignSystem('custom', value);
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
      <InspectorSection title="Actions" titleTextStyle="heading4">
        <Button onClick={onDuplicate}>Duplicate Project</Button>
      </InspectorSection>
    </Stack.V>
  );
}
