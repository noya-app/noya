import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  InputField,
  Label,
  LabeledElementView,
  Select,
  sketchColorToHex,
  Spacer,
} from 'noya-designsystem';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ColorInputFieldWithPicker, {
  SketchPattern,
} from './ColorInputFieldWithPicker';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  id: string;
  value: Sketch.Color | Sketch.Gradient | SketchPattern;
  onChangeColor: (color: Sketch.Color) => void;
  onChangeFillType: (type: Sketch.FillType) => void;
  onChangeGradientColor: (color: Sketch.Color, index: number) => void;
  onChangeGradientPosition: (index: number, position: number) => void;
  onAddGradientStop: (color: Sketch.Color, position: number) => void;
  onChangeGradientType: (type: Sketch.GradientType) => void;
  onChangeOpacity: (amount: number) => void;
  onNudgeOpacity: (amount: number) => void;
  prefix?: ReactNode;
}

export default memo(function ColorFillRow({
  id,
  value,
  onChangeColor,
  onChangeOpacity,
  onNudgeOpacity,
  onChangeFillType,
  onChangeGradientColor,
  onChangeGradientPosition,
  onAddGradientStop,
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

  const gradientTypeOptions = useMemo(
    () => [
      Sketch.GradientType.Linear.toString(),
      Sketch.GradientType.Angular.toString(),
      Sketch.GradientType.Radial.toString(),
    ],
    [],
  );

  const getGradientTypeTitle = useCallback(
    (id: string) => Sketch.GradientType[parseInt(id)],
    [],
  );

  const handleSelectGradientType = useCallback(
    (value: string) => onChangeGradientType(parseInt(value)),
    [onChangeGradientType],
  );

  return (
    <Row id={id}>
      <LabeledElementView renderLabel={renderLabel}>
        {prefix}
        {prefix && <Spacer.Horizontal size={8} />}
        <ColorInputFieldWithPicker
          id={colorInputId}
          value={value}
          onChange={onChangeColor}
          onChangeType={onChangeFillType}
          onChangeGradientColor={onChangeGradientColor}
          onChangeGradientPosition={onChangeGradientPosition}
          onAddGradientStop={onAddGradientStop}
          onChangeGradientType={onChangeGradientType}
        />
        <Spacer.Horizontal size={8} />
        {value._class === 'color' ? (
          <InputField.Root id={hexInputId} labelPosition="start">
            <InputField.Input
              value={sketchColorToHex(value).replace('#', '')}
              onSubmit={() => {}}
            />
            <InputField.Label>#</InputField.Label>
          </InputField.Root>
        ) : value._class === 'gradient' ? (
          <InputField.Root id={gradientTypeId}>
            <Select
              id={'gradient-type-selector'}
              value={value.gradientType.toString()}
              options={gradientTypeOptions}
              getTitle={getGradientTypeTitle}
              onChange={handleSelectGradientType}
            />
          </InputField.Root>
        ) : (
          <InputField.Root id={gradientTypeId} labelPosition="start">
            <InputField.Input value={'Pattern'} onSubmit={() => {}} />
          </InputField.Root>
        )}
        <Spacer.Horizontal size={8} />
        {value._class === 'color' ? (
          <InputField.Root id={opacityInputId} size={50}>
            <InputField.NumberInput
              value={Math.round(value.alpha * 100)}
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
