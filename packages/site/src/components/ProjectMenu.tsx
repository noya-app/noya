import { DS, NoyaAPI, useNoyaClient } from 'noya-api';
import { useApplicationState } from 'noya-app-state-context';
import {
  Button,
  Divider,
  DropdownMenu,
  InputField,
  RegularMenuItem,
  Spacer,
  createSectionedMenu,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { ChevronDownIcon } from 'noya-icons';
import { DimensionInput, InspectorPrimitives } from 'noya-inspector';
import { Layers, Selectors } from 'noya-state';
import React, { useEffect, useState } from 'react';

const designSystems = {
  '@noya-design-system/mui': 'Material Design',
  '@noya-design-system/antd': 'Ant Design',
  '@noya-design-system/chakra': 'Chakra UI',
};

const DEFAULT_DESIGN_SYSTEM: Sketch.DesignSystem = {
  type: 'standard',
  id: '@noya-design-system/chakra',
};

export function ProjectMenu({
  name,
  designSystem,
  onChangeName,
  onChangeDesignSystem,
  onDuplicate,
}: {
  name: string;
  designSystem?: DS;
  onChangeName: (name: string) => void;
  onChangeDesignSystem: (type: 'standard' | 'custom', name: string) => void;
  onDuplicate: () => void;
}) {
  const [state, dispatch] = useApplicationState();
  const [files, setFiles] = useState<NoyaAPI.File[]>([]);
  const client = useNoyaClient();

  useEffect(() => {
    client.networkClient.files.list().then(setFiles);
  }, [client.networkClient.files]);

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

  if (!artboard) return null;

  return (
    <>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Project Name</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.VerticalSeparator />
        <InspectorPrimitives.Row>
          <InputField.Root>
            <InputField.Input value={name} onSubmit={onChangeName} />
          </InputField.Root>
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
      <Divider />
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Canvas Size</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.VerticalSeparator />
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
      </InspectorPrimitives.Section>
      <Divider />
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Design System</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.VerticalSeparator />
        <InspectorPrimitives.Row>
          <DropdownMenu
            items={designSystemMenu}
            onSelect={(value) => {
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
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
      <Divider />
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Project Actions</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.VerticalSeparator />
        <Button onClick={onDuplicate}>Duplicate Project</Button>
      </InspectorPrimitives.Section>
    </>
  );
}
