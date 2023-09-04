import { Label, LabeledElementView, RadioGroup } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import {
  BorderCenterIcon,
  BorderInsideIcon,
  BorderOutsideIcon,
} from 'noya-icons';
import { SetNumberMode } from 'noya-state';
import React, { ReactNode, memo, useCallback } from 'react';
import { DimensionInput, DimensionValue } from './DimensionInput';
import {
  ColorFillProps,
  FillInputFieldWithPicker,
  GradientFillProps,
} from './FillInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';

function toPositionString(position: Sketch.BorderPosition) {
  switch (position) {
    case Sketch.BorderPosition.Inside:
      return 'inside';
    case Sketch.BorderPosition.Center:
      return 'center';
    case Sketch.BorderPosition.Outside:
      return 'outside';
  }
}

function toPositionEnum(position: string): Sketch.BorderPosition {
  switch (position) {
    case 'inside':
      return Sketch.BorderPosition.Inside;
    case 'center':
      return Sketch.BorderPosition.Center;
    case 'outside':
      return Sketch.BorderPosition.Outside;
    default:
      throw new Error('Bad border position value');
  }
}

interface Props {
  id: string;
  prefix?: ReactNode;
  fillType?: Sketch.FillType;
  hasMultipleFills: boolean;
  width: DimensionValue;
  position: Sketch.BorderPosition;
  onSetWidth: (amount: number, mode: SetNumberMode) => void;
  onChangePosition: (value: Sketch.BorderPosition) => void;
  onChangeFillType: (type: Sketch.FillType) => void;
  colorProps: ColorFillProps;
  gradientProps: GradientFillProps;
}

export const BorderRow = memo(function BorderRow({
  id,
  prefix,
  fillType,
  hasMultipleFills,
  width,
  position,
  onSetWidth,
  onChangePosition,
  onChangeFillType,
  colorProps,
  gradientProps,
}: Props) {
  const colorInputId = `${id}-color`;
  const borderPositionId = `${id}-hex`;
  const widthInputId = `${id}-width`;

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case colorInputId:
          return <Label.Label>Color</Label.Label>;
        case borderPositionId:
          return <Label.Label>Position</Label.Label>;
        case widthInputId:
          return <Label.Label>Width</Label.Label>;
        default:
          return null;
      }
    },
    [colorInputId, borderPositionId, widthInputId],
  );

  const handleChangePosition = useCallback(
    (value: string) => onChangePosition(toPositionEnum(value)),
    [onChangePosition],
  );

  return (
    <InspectorPrimitives.Row>
      <LabeledElementView renderLabel={renderLabel}>
        {prefix}
        {prefix && <InspectorPrimitives.HorizontalSeparator />}
        <FillInputFieldWithPicker
          id={colorInputId}
          fillType={fillType}
          hasMultipleFills={hasMultipleFills}
          onChangeType={onChangeFillType}
          colorProps={colorProps}
          gradientProps={gradientProps}
        />
        <InspectorPrimitives.HorizontalSeparator />
        <RadioGroup.Root
          colorScheme="primary"
          id={borderPositionId}
          value={toPositionString(position)}
          onValueChange={handleChangePosition}
        >
          <RadioGroup.Item value="inside" tooltip="Inside">
            <BorderInsideIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="center" tooltip="Center">
            <BorderCenterIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="outside" tooltip="Outside">
            <BorderOutsideIcon />
          </RadioGroup.Item>
        </RadioGroup.Root>
        <InspectorPrimitives.HorizontalSeparator />
        <DimensionInput
          id={widthInputId}
          size={50}
          value={width}
          onSetValue={onSetWidth}
        />
      </LabeledElementView>
    </InspectorPrimitives.Row>
  );
});
