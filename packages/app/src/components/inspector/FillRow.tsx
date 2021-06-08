import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  InputField,
  Label,
  LabeledElementView,
  Select,
  sketchColorToHex,
  Spacer,
} from 'noya-designsystem';
import { memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import ColorInputFieldWithPicker from './ColorInputFieldWithPicker';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

type Pattern = {
  _class: 'pattern';
  image?: Sketch.FileRef | Sketch.DataRef;
  patternFillType: Sketch.PatternFillType;
  patternTileScale: number;
};

interface Props {
  id: string;
  color: Sketch.Color | Sketch.Gradient | Pattern;
  onChangeColor: (color: Sketch.Color) => void;
  onChangeType: (type: Sketch.FillType) => void;
  onChangeGradientColor: (
    color: Sketch.Color,
    index: number,
    position: number,
  ) => void;
  onChangeGradientType: (type: Sketch.GradientType) => void;
  onChangeOpacity: (amount: number) => void;
  onNudgeOpacity: (amount: number) => void;
  prefix?: ReactNode;
}

export default memo(function ColorFillRow({
  id,
  color,
  onChangeColor,
  onChangeType,
  onChangeOpacity,
  onNudgeOpacity,
  onChangeGradientColor,
  onChangeGradientType,
  prefix,
}: Props) {
  const colorInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;
  const gradientTypeId = `${id}-gradient-type`;

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case colorInputId:
          return <Label.Label>Color</Label.Label>;
        case hexInputId:
          return <Label.Label>Hex</Label.Label>;
        case opacityInputId:
          return <Label.Label>Opacity</Label.Label>;
        case gradientTypeId:
          return <Label.Label>Type</Label.Label>;
        default:
          return null;
      }
    },
    [colorInputId, hexInputId, opacityInputId, gradientTypeId],
  );

  const handleSubmitOpacity = useCallback(
    (opacity: number) => {
      onChangeOpacity(opacity / 100);
    },
    [onChangeOpacity],
  );

  const handleNudgeOpacity = useCallback(
    (amount: number) => {
      onNudgeOpacity(amount / 100);
    },
    [onNudgeOpacity],
  );

  if (color._class === 'pattern') return <></>;

  return (
    <Row id={id}>
      <LabeledElementView renderLabel={renderLabel}>
        {prefix}
        {prefix && <Spacer.Horizontal size={8} />}
        <ColorInputFieldWithPicker
          id={colorInputId}
          value={color}
          onChange={onChangeColor}
          onChangeType={onChangeType}
          onChangeGradientColor={onChangeGradientColor}
          onChangeGradientType={onChangeGradientType}
        />
        <Spacer.Horizontal size={8} />
        {color._class === 'color' ? (
          <InputField.Root id={hexInputId} labelPosition="start">
            <InputField.Input
              value={sketchColorToHex(color).replace('#', '')}
              onSubmit={() => {}}
            />
            <InputField.Label>#</InputField.Label>
          </InputField.Root>
        ) : (
          <InputField.Root id={gradientTypeId}>
            <Select
              id={''}
              value={'Linear'}
              options={['Linear', 'Angular', 'Radial']}
              onChange={() => {}}
            />
          </InputField.Root>
        )}
        <Spacer.Horizontal size={8} />
        {color._class === 'color' ? (
          <InputField.Root id={opacityInputId} size={50}>
            <InputField.NumberInput
              value={Math.round(color.alpha * 100)}
              onSubmit={handleSubmitOpacity}
              onNudge={handleNudgeOpacity}
            />
            <InputField.Label>%</InputField.Label>
          </InputField.Root>
        ) : (
          <InputField.Root id={opacityInputId} size={50}>
            <InputField.NumberInput
              value={Math.round(100)}
              onSubmit={handleSubmitOpacity}
              onNudge={handleNudgeOpacity}
            />
            <InputField.Label>%</InputField.Label>
          </InputField.Root>
        )}
      </LabeledElementView>
    </Row>
  );
});
