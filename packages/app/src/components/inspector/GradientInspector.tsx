import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  GradientPicker,
  InputField,
  Label,
  LabeledElementView,
  sketchColorToHex,
  Spacer,
} from 'noya-designsystem';
import { clamp } from 'noya-utils';
import { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const Column = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

interface Props {
  id: string;
  gradient: Sketch.GradientStop[];
  onChangeColor?: (color: Sketch.Color, index: number) => void;
  onChangePosition?: (index: number, position: number) => void;
  onAddStop?: (color: Sketch.Color, position: number) => void;
  onDeleteStop?: (index: number) => void;
}

export default memo(function GradientInspector({
  id,
  gradient,
  onChangeColor = (color: Sketch.Color, index: number) => {},
  onChangePosition = (position: number, index: number) => {},
  onAddStop = (color: Sketch.Color, position: number) => {},
  onDeleteStop = (index: number) => {},
}: Props) {
  const colorInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;

  const [selectedStopIndex, setSelectedStopIndex] = useState(0);

  const clampedSelectedStopIndex = !gradient[selectedStopIndex]
    ? 0
    : selectedStopIndex;

  const selectedcolor = gradient[clampedSelectedStopIndex].color;
  const selectedColorHex = sketchColorToHex(selectedcolor);
  const hexValue = useMemo(() => selectedColorHex.slice(1), [selectedColorHex]);

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

  const handleSubmitOpacity = useCallback(
    (opacity: number) => {
      onChangeColor(
        {
          ...selectedcolor,
          alpha: clamp(opacity / 100, 0, 1),
        },
        clampedSelectedStopIndex,
      );
    },
    [selectedcolor, clampedSelectedStopIndex, onChangeColor],
  );

  const handleNudgeOpacity = useCallback(
    (amount: number) => {
      onChangeColor(
        {
          ...selectedcolor,
          alpha: clamp(selectedcolor.alpha + amount / 100, 0, 1),
        },
        clampedSelectedStopIndex,
      );
    },
    [selectedcolor, clampedSelectedStopIndex, onChangeColor],
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
      setSelectedStopIndex(gradient.length);
    },
    [gradient, onAddStop, setSelectedStopIndex],
  );

  const handleDeleteStop = useCallback(() => {
    if (gradient.length === 2) return;

    onDeleteStop(clampedSelectedStopIndex);
    setSelectedStopIndex(
      clampedSelectedStopIndex - 1 > 0 ? 0 : clampedSelectedStopIndex - 1,
    );
  }, [gradient, clampedSelectedStopIndex, onDeleteStop, setSelectedStopIndex]);

  return (
    <Column>
      <GradientPicker
        value={gradient}
        selectedStop={clampedSelectedStopIndex}
        onChangeColor={handleChangeColor}
        onChangePosition={handleChangePosition}
        onAdd={handleAddStop}
        onSelectStop={useCallback(
          (index: number) => setSelectedStopIndex(index),
          [setSelectedStopIndex],
        )}
        onDelete={handleDeleteStop}
      />
      <Spacer.Vertical size={10} />
      <Row id={id}>
        <LabeledElementView renderLabel={renderLabel}>
          <Spacer.Vertical size={8} />
          <InputField.Root id={hexInputId} labelPosition="start">
            <InputField.Input
              value={hexValue ?? ''}
              placeholder={hexValue ? '' : 'Multiple'}
              onSubmit={useCallback(() => {}, [])}
            />
            <InputField.Label>#</InputField.Label>
          </InputField.Root>
          <Spacer.Horizontal size={8} />
          <InputField.Root id={opacityInputId} size={50}>
            <InputField.NumberInput
              value={Math.round(selectedcolor.alpha * 100)}
              onSubmit={handleSubmitOpacity}
              onNudge={handleNudgeOpacity}
            />
            <InputField.Label>%</InputField.Label>
          </InputField.Root>
        </LabeledElementView>
      </Row>
    </Column>
  );
});
