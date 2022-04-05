import React, { memo, useCallback, useMemo } from 'react';

import type Sketch from 'noya-file-format';
import { useApplicationState } from 'noya-app-state-context';
import {
  validHex,
  hexToRgba,
  sketchColorToHex,
  rgbaToSketchColor,
} from 'noya-colorpicker';
import { InputField, LabeledView, GradientPicker } from 'noya-designsystem';
import { clamp } from 'noya-utils';
import { Primitives } from './primitives';

interface Props {
  id: string;
  gradient: Sketch.GradientStop[];
  onChangeColor?: (color: Sketch.Color, index: number) => void;
  onChangeOpacity?: (amount: number) => void;
  onNudgeOpacity?: (amount: number) => void;
  onChangePosition?: (index: number, position: number) => void;
  onAddStop?: (color: Sketch.Color, position: number) => void;
  onDeleteStop?: (index: number) => void;
}

export default memo(function GradientInspector({
  id,
  gradient,
  onChangeOpacity,
  onNudgeOpacity,
  onChangeColor = (color: Sketch.Color, index: number) => {},
  onChangePosition = (position: number, index: number) => {},
  onAddStop = (color: Sketch.Color, position: number) => {},
  onDeleteStop = (index: number) => {},
}: Props) {
  const [state, dispatch] = useApplicationState();

  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;

  const clampedSelectedStopIndex = state.selectedGradient?.stopIndex ?? 0;

  const selectedcolor = gradient[clampedSelectedStopIndex].color;
  const selectedColorHex = sketchColorToHex(selectedcolor);
  const hexValue = useMemo(() => selectedColorHex.slice(1), [selectedColorHex]);

  const handleSubmitOpacity = useCallback(
    (opacity: number) => {
      if (onChangeOpacity) {
        onChangeOpacity(opacity / 100);
      } else {
        onChangeColor(
          {
            ...selectedcolor,
            alpha: clamp(opacity / 100, 0, 1),
          },
          clampedSelectedStopIndex,
        );
      }
    },
    [selectedcolor, clampedSelectedStopIndex, onChangeOpacity, onChangeColor],
  );

  const handleNudgeOpacity = useCallback(
    (amount: number) => {
      if (onNudgeOpacity) {
        onNudgeOpacity(amount / 100);
      } else {
        onChangeColor(
          {
            ...selectedcolor,
            alpha: clamp(selectedcolor.alpha + amount / 100, 0, 1),
          },
          clampedSelectedStopIndex,
        );
      }
    },
    [selectedcolor, clampedSelectedStopIndex, onNudgeOpacity, onChangeColor],
  );

  const handleChangeColor = useCallback(
    (color: Sketch.Color) => {
      onChangeColor(color, clampedSelectedStopIndex);
    },
    [clampedSelectedStopIndex, onChangeColor],
  );

  const handleChangePosition = useCallback(
    (position: number) => {
      onChangePosition(position, clampedSelectedStopIndex);
    },
    [clampedSelectedStopIndex, onChangePosition],
  );

  const handleAddStop = useCallback(
    (color: Sketch.Color, position: number) => {
      onAddStop(color, position);
      dispatch('setSelectedGradientStopIndex', gradient.length);
    },
    [gradient, onAddStop, dispatch],
  );

  const handleDeleteStop = useCallback(() => {
    if (gradient.length === 2) return;

    onDeleteStop(clampedSelectedStopIndex);
    dispatch(
      'setSelectedGradientStopIndex',
      clampedSelectedStopIndex - 1 > 0 ? 0 : clampedSelectedStopIndex - 1,
    );
  }, [gradient, clampedSelectedStopIndex, onDeleteStop, dispatch]);

  return (
    <Primitives.Section>
      <Primitives.Column>
        <GradientPicker
          value={gradient}
          selectedStop={clampedSelectedStopIndex}
          onChangeColor={handleChangeColor}
          onChangePosition={handleChangePosition}
          onAdd={handleAddStop}
          onDelete={handleDeleteStop}
          onSelectStop={useCallback(
            (index: number) => dispatch('setSelectedGradientStopIndex', index),
            [dispatch],
          )}
        />
        <Primitives.VerticalSeparator />
        <Primitives.Row id={id}>
          <LabeledView label="Hex" labelPosition="start" flex={1}>
            <InputField.Root id={hexInputId} labelPosition="start">
              <InputField.Input
                value={hexValue ?? ''}
                placeholder={hexValue ? '' : 'Multiple'}
                onSubmit={(value) => {
                  if (validHex(value)) {
                    handleChangeColor(
                      rgbaToSketchColor(hexToRgba(value, selectedcolor.alpha)),
                    );
                  }
                }}
              />
              <InputField.Label>#</InputField.Label>
            </InputField.Root>
          </LabeledView>
          <Primitives.HorizontalSeparator />
          <LabeledView label="Opacity" size={50} labelPosition="start">
            <InputField.Root id={opacityInputId}>
              <InputField.NumberInput
                value={Math.round(selectedcolor.alpha * 100)}
                onSubmit={handleSubmitOpacity}
                onNudge={handleNudgeOpacity}
              />
              <InputField.Label>%</InputField.Label>
            </InputField.Root>
          </LabeledView>
        </Primitives.Row>
      </Primitives.Column>
    </Primitives.Section>
  );
});
