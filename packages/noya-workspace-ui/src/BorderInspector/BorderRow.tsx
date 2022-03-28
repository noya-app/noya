import React, { memo, ReactNode, useCallback } from 'react';

import Sketch from 'noya-file-format';
import { SetNumberMode } from 'noya-state';
import { LabeledView, Layout, RadioGroup } from 'noya-designsystem';
import { DimensionInput, DimensionValue } from '../DimensionsInspector';
import { Primitives } from '../primitives';
import {
  ColorFillProps,
  GradientFillProps,
  FillInputFieldWithPicker,
} from '../FillInspector';

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

export default memo(function BorderRow({
  id,
  width,
  prefix,
  position,
  fillType,
  onSetWidth,
  colorProps,
  gradientProps,
  onChangePosition,
  onChangeFillType,
  hasMultipleFills,
}: Props) {
  const colorInputId = `${id}-color`;
  const borderPositionId = `${id}-hex`;
  const widthInputId = `${id}-width`;

  const handleChangePosition = useCallback(
    (value: string) => onChangePosition(toPositionEnum(value)),
    [onChangePosition],
  );

  return (
    <Primitives.Row>
      <LabeledView>{prefix}</LabeledView>
      {prefix && <Primitives.HorizontalSeparator />}
      <LabeledView label="Color">
        <FillInputFieldWithPicker
          id={colorInputId}
          fillType={fillType}
          hasMultipleFills={hasMultipleFills}
          onChangeType={onChangeFillType}
          colorProps={colorProps}
          gradientProps={gradientProps}
        />
      </LabeledView>
      <Primitives.HorizontalSeparator />
      <LabeledView label="Position" flex={1}>
        <RadioGroup.Root
          id={borderPositionId}
          value={toPositionString(position)}
          onValueChange={handleChangePosition}
        >
          <RadioGroup.Item value="inside" tooltip="Inside">
            <Layout.Icon name="border-inside" size={16} />
          </RadioGroup.Item>
          <RadioGroup.Item value="center" tooltip="Center">
            <Layout.Icon name="border-center" size={16} />
          </RadioGroup.Item>
          <RadioGroup.Item value="outside" tooltip="Outside">
            <Layout.Icon name="border-outside" size={16} />
          </RadioGroup.Item>
        </RadioGroup.Root>
      </LabeledView>
      <Primitives.HorizontalSeparator />
      <LabeledView label="Width" size={50}>
        <DimensionInput
          id={widthInputId}
          value={width}
          onSetValue={onSetWidth}
        />
      </LabeledView>
    </Primitives.Row>
  );
});
