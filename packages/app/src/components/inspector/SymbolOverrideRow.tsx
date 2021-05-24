import {
  ComponentInstanceIcon,
  ImageIcon,
  LetterCaseCapitalizeIcon,
  Pencil1Icon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Spacer } from 'noya-designsystem';
import { memo } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';
import styled from 'styled-components';
import { Overrides } from 'noya-state';

interface Props {
  layers: Sketch.AnyLayer[];
  allowsOverrides: boolean;
  overrideProperties: Sketch.OverrideProperty[];
}

const Checkbox = styled.input(({ theme }) => ({
  margin: 0,
}));

export default memo(function SymbolInspector({
  layers,
  allowsOverrides,
  overrideProperties,
}: Props) {
  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Title>Manage Overrides</InspectorPrimitives.Title>
      <Spacer.Vertical size={2} />
      <InspectorPrimitives.Row>
        <Checkbox
          type="checkbox"
          checked={allowsOverrides}
          onChange={(evt) => {}}
        />
        <Spacer.Horizontal size={8} />
        <InspectorPrimitives.Text>Allow Overrides</InspectorPrimitives.Text>
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={6} />

      {overrideProperties.map((property) => {
        const {
          layerIdPath: [layerId],
          propertyType,
        } = Overrides.decodeName(property.overrideName);

        const propertyIcon = () => {
          switch (propertyType) {
            case 'stringValue':
              return <LetterCaseCapitalizeIcon />;
            case 'symbolID':
              return <ComponentInstanceIcon />;
            case 'image':
              return <ImageIcon />;
            case 'textStyle': {
              return <Pencil1Icon />;
            }
            case 'layerStyle': {
              return <Pencil2Icon />;
            }
          }
        };

        const propertyLabel = () => {
          switch (propertyType) {
            case 'stringValue':
              return 'Text Value';
            case 'symbolID':
              return 'Symbol';
            case 'image':
              return 'Image';
            case 'textStyle': {
              return 'Text Style';
            }
            case 'layerStyle': {
              return 'Layer Style';
            }
          }
        };

        const value = layers.find((l) => l.do_objectID === layerId);
        if (!value) return null;
        return (
          <>
            <InspectorPrimitives.Row>
              <InspectorPrimitives.Title>
                {propertyIcon()}
                <Spacer.Horizontal size={6} />
                {value.name.substring(0, 100)}
              </InspectorPrimitives.Title>
            </InspectorPrimitives.Row>
            <InspectorPrimitives.Row>
              <Checkbox
                type="checkbox"
                checked={property.canOverride}
                onChange={(evt) => {}}
              />
              <Spacer.Horizontal size={8} />
              <InspectorPrimitives.Text>
                {propertyLabel()}
              </InspectorPrimitives.Text>
            </InspectorPrimitives.Row>
            <Spacer.Vertical size={8} />
          </>
        );
      })}
    </InspectorPrimitives.Section>
  );
});
