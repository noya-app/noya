import React, { memo, useCallback } from 'react';

import {
  validHex,
  hexToRgba,
  sketchColorToHex,
  rgbaToSketchColor,
} from 'noya-colorpicker';
import { clamp } from 'noya-utils';
import type Sketch from 'noya-file-format';
import { SetNumberMode } from 'noya-state';
import { ColorPicker, InputField, LabeledView } from 'noya-designsystem';
import { DimensionInput } from './DimensionsInspector';
import { Primitives } from './primitives';

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
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;

  const displayColor = color ?? DEFAULT_SKETCH_COLOR;

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
    <Primitives.Section>
      <Primitives.Column>
        <ColorPicker value={displayColor} onChange={onChangeColor} />
        <Primitives.VerticalSeparator />
        <Primitives.Row id={id}>
          <LabeledView label="Hex" flex={1} labelPosition="start">
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
          </LabeledView>
          <Primitives.HorizontalSeparator />
          <LabeledView label="Opacity" size={50} labelPosition="start">
            <DimensionInput
              id={opacityInputId}
              label="%"
              value={color ? Math.round(color.alpha * 100) : undefined}
              onSetValue={handleSetOpacity}
            />
          </LabeledView>
        </Primitives.Row>
      </Primitives.Column>
    </Primitives.Section>
  );
});
