import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  ColorPicker,
  InputField,
  Label,
  LabeledElementView,
  sketchColorToHex,
  Spacer,
} from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { clamp } from 'noya-utils';
import { memo, useCallback } from 'react';
import DimensionInput from './DimensionInput';
import * as InspectorPrimitives from './InspectorPrimitives';

const DEFAULT_SKETCH_COLOR: Sketch.Color = {
  _class: 'color',
  red: 0,
  green: 0,
  blue: 0,
  alpha: 1,
};

interface Props {
  id: string;
  color?: Sketch.Color;
  /**
   * The only required change handler is `onChangeColor`. However, to handle
   * more granular changes specially, e.g. nudging opacity, you can pass other
   * handlers.
   */
  onChangeColor: (color: Sketch.Color) => void;
  onSetOpacity?: (value: number, mode: SetNumberMode) => void;
}

export default memo(function ColorInspector({
  id,
  color,
  onChangeColor,
  onSetOpacity,
}: Props) {
  const colorInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;

  const displayColor = color ?? DEFAULT_SKETCH_COLOR;

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case colorInputId:
          return <Label.Label>Color</Label.Label>;
        case hexInputId:
          return <Label.Label>Hex</Label.Label>;
        case opacityInputId:
          return <Label.Label>Opacity</Label.Label>;
        default:
          return null;
      }
    },
    [colorInputId, hexInputId, opacityInputId],
  );

  const handleSetOpacity = useCallback(
    (amount: number, mode: SetNumberMode) => {
      const scaledAmount = amount / 100;

      if (onSetOpacity) {
        onSetOpacity(scaledAmount, mode);
      } else {
        const newValue =
          mode === 'replace' ? scaledAmount : displayColor.alpha + scaledAmount;

        onChangeColor({
          ...displayColor,
          alpha: clamp(newValue, 0, 1),
        });
      }
    },
    [displayColor, onChangeColor, onSetOpacity],
  );

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Column>
        <ColorPicker value={displayColor} onChange={onChangeColor} />
        <Spacer.Vertical size={10} />
        <InspectorPrimitives.Row id={id}>
          <LabeledElementView renderLabel={renderLabel}>
            <Spacer.Vertical size={8} />
            <InputField.Root id={hexInputId} labelPosition="start">
              <InputField.Input
                value={color ? sketchColorToHex(displayColor).slice(1) : ''}
                placeholder={color ? '' : 'multiple'}
                onSubmit={useCallback(() => {}, [])}
              />
              <InputField.Label>#</InputField.Label>
            </InputField.Root>
            <Spacer.Horizontal size={8} />
            <DimensionInput
              id={opacityInputId}
              size={50}
              label="%"
              value={color ? Math.round(color.alpha * 100) : undefined}
              onSetValue={handleSetOpacity}
            />
          </LabeledElementView>
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Column>
    </InspectorPrimitives.Section>
  );
});
