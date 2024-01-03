import {
  SketchColorPicker,
  hexToRgba,
  validHex,
} from '@noya-app/noya-colorpicker';
import {
  InputField,
  Label,
  LabeledElementView,
  rgbaToSketchColor,
  sketchColorToHex,
} from '@noya-app/noya-designsystem';
import type { Sketch } from '@noya-app/noya-file-format';
import { clamp } from '@noya-app/noya-utils';
import { SetNumberMode } from 'noya-state';
import React, { memo, useCallback } from 'react';
import { DimensionInput } from './DimensionInput';
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

export const ColorInspector = memo(function ColorInspector({
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
        <SketchColorPicker value={displayColor} onChange={onChangeColor} />
        <InspectorPrimitives.VerticalSeparator />
        <InspectorPrimitives.Row id={id}>
          <LabeledElementView renderLabel={renderLabel}>
            <InputField.Root id={hexInputId} labelPosition="start">
              <InputField.Input
                value={color ? sketchColorToHex(displayColor).slice(1) : ''}
                placeholder={color ? '' : 'multiple'}
                onSubmit={(value) => {
                  if (validHex(value)) {
                    onChangeColor(
                      rgbaToSketchColor(hexToRgba(value, color?.alpha)),
                    );
                  }
                }}
              />
              <InputField.Label>#</InputField.Label>
            </InputField.Root>
            <InspectorPrimitives.HorizontalSeparator />
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
