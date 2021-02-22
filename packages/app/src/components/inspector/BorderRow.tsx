import Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import ColorInputField from '../ColorInputField';
import BorderOutsideIcon from '../icons/BorderOutsideIcon';
import BorderInsideIcon from '../icons/BorderInsideIcon';
import BorderCenterIcon from '../icons/BorderCenterIcon';
import * as InputField from '../InputField';
import * as Label from '../Label';
import LabeledElementView from '../LabeledElementView';
import * as Spacer from '../Spacer';
import { DimensionValue } from './DimensionsInspector';
import * as RadioGroup from '../RadioGroup';

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

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  id: string;
  color: Sketch.Color;
  width: DimensionValue;
  position: Sketch.BorderPosition;
  onChangeColor: (color: Sketch.Color) => void;
  onChangePosition: (value: Sketch.BorderPosition) => void;
  onChangeWidth: (amount: number) => void;
  onNudgeWidth: (amount: number) => void;
  prefix?: ReactNode;
}

export default memo(function BorderRow({
  id,
  color,
  width,
  position,
  onChangeColor,
  onChangeWidth,
  onChangePosition,
  onNudgeWidth,
  prefix,
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

  const handleSubmitWidth = useCallback(
    (value: number) => {
      onChangeWidth(value);
    },
    [onChangeWidth],
  );

  const handleChangePosition = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangePosition(toPositionEnum(event.target.value));
    },
    [onChangePosition],
  );

  return (
    <Row>
      <LabeledElementView renderLabel={renderLabel}>
        {prefix}
        {prefix && <Spacer.Horizontal size={8} />}
        <ColorInputField
          id={colorInputId}
          value={color}
          onChange={onChangeColor}
        />
        <Spacer.Horizontal size={8} />
        <RadioGroup.Root
          id={borderPositionId}
          value={toPositionString(position)}
          onValueChange={handleChangePosition}
        >
          <RadioGroup.Item value="inside">
            <BorderInsideIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="center">
            <BorderCenterIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="outside">
            <BorderOutsideIcon />
          </RadioGroup.Item>
        </RadioGroup.Root>
        <Spacer.Horizontal size={8} />
        <InputField.Root id={widthInputId} size={50}>
          <InputField.NumberInput
            value={width}
            onNudge={onNudgeWidth}
            onSubmit={handleSubmitWidth}
            placeholder={width === undefined ? 'multi' : ''}
          />
        </InputField.Root>
      </LabeledElementView>
    </Row>
  );
});
