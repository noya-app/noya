import {
  ComponentInstanceIcon,
  ImageIcon,
  LetterCaseCapitalizeIcon,
  Pencil1Icon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Spacer, TreeView } from 'noya-designsystem';
import { memo, ReactNode, useMemo, useCallback } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';
import { Overrides } from 'noya-state';

interface Props {
  layers: Sketch.AnyLayer[];
  overrideProperties: Sketch.OverrideProperty[];
  allowsOverrides: boolean;
  setAllowsOverrides: (value: boolean) => void;
}
const PropertyTypesData: {
  [key in Overrides.PropertyType]: { label: string; icon: ReactNode };
} = {
  stringValue: {
    label: 'Text Value',
    icon: <LetterCaseCapitalizeIcon />,
  },
  symbolID: {
    label: 'Symbol',
    icon: <ComponentInstanceIcon />,
  },
  image: {
    label: 'Image',
    icon: <ImageIcon />,
  },
  textStyle: {
    label: 'Text Style',
    icon: <Pencil1Icon />,
  },
  layerStyle: {
    label: 'Layer Style',
    icon: <Pencil2Icon />,
  },
};

const OverrideElements = memo(function OverrideElements({
  layers,
  overrideProperties,
}: {
  layers: Sketch.AnyLayer[];
  overrideProperties: Sketch.OverrideProperty[];
}) {
  const overrides = overrideProperties.flatMap((property, index) => {
    const {
      layerIdPath: [layerId, ...remainingLayerIdPath],
      propertyType,
    } = Overrides.decodeName(property.overrideName);

    const propertyId =
      remainingLayerIdPath.length > 1
        ? remainingLayerIdPath[remainingLayerIdPath.length - 1]
        : layerId;

    const value = layers.find((l) => l.do_objectID === propertyId);
    if (!value) return [];

    return [
      {
        propertyType,
        value: value.name.substring(0, 120),
        canOverride: property.canOverride,
      },
    ];
  });

  const layerElements = useMemo(() => {
    return overrides.map(({ propertyType, value, canOverride }, index) => {
      return [
        <TreeView.Row isSectionHeader depth={0} key={index} scrollable={false}>
          {PropertyTypesData[propertyType].icon}
          <Spacer.Horizontal size={6} />
          {value}
        </TreeView.Row>,
        <TreeView.Row depth={1} onClick={() => {}}>
          <InspectorPrimitives.Checkbox
            type="checkbox"
            checked={canOverride}
            onChange={(evt) => {}}
          />
          <Spacer.Horizontal size={6} />
          <TreeView.RowTitle>
            {PropertyTypesData[propertyType].label}
          </TreeView.RowTitle>
        </TreeView.Row>,
      ];
    });
  }, [overrides]);

  return <TreeView.Root>{layerElements}</TreeView.Root>;
});

export default memo(function SymbolInspector({
  layers,
  allowsOverrides,
  overrideProperties,
  setAllowsOverrides,
}: Props) {
  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Title>Manage Overrides</InspectorPrimitives.Title>
      <Spacer.Vertical size={2} />
      <InspectorPrimitives.Row>
        <InspectorPrimitives.Checkbox
          type="checkbox"
          checked={allowsOverrides}
          onChange={useCallback(
            (evt) => setAllowsOverrides(evt.target.checked),
            [setAllowsOverrides],
          )}
        />
        <Spacer.Horizontal size={8} />
        <InspectorPrimitives.Text>Allow Overrides</InspectorPrimitives.Text>
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={6} />
      <OverrideElements
        layers={layers}
        overrideProperties={overrideProperties}
      />
    </InspectorPrimitives.Section>
  );
});
