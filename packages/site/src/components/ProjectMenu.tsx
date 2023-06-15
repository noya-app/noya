import { useApplicationState } from 'noya-app-state-context';
import {
  Button,
  Divider,
  DropdownMenu,
  InputField,
  Spacer,
} from 'noya-designsystem';
import { ChevronDownIcon } from 'noya-icons';
import { DimensionInput, InspectorPrimitives } from 'noya-inspector';
import { Layers, Selectors } from 'noya-state';
import React from 'react';

const designSystems = {
  mui: 'Material Design',
  antd: 'Ant Design',
  chakra: 'Chakra UI',
};

export function ProjectMenu({
  name,
  designSystem,
  onChangeName,
  onChangeDesignSystem,
  onDuplicate,
}: {
  name: string;
  designSystem: string;
  onChangeName: (name: string) => void;
  onChangeDesignSystem: (name: string) => void;
  onDuplicate: () => void;
}) {
  const [state, dispatch] = useApplicationState();

  const artboard = Layers.find(
    Selectors.getCurrentPage(state),
    Layers.isArtboard,
  );

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
            items={Object.entries(designSystems).map(([key, value]) => ({
              value: key as keyof typeof designSystems,
              title: value,
            }))}
            onSelect={(value) => {
              onChangeDesignSystem(value);
            }}
          >
            <Button flex="1">
              {designSystems[designSystem as keyof typeof designSystems]}
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
