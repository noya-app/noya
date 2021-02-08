import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import ColorInputField from '../ColorInputField';
import * as InputField from '../InputField';
import * as Label from '../Label';
import LabeledElementView from '../LabeledElementView';
import * as Spacer from '../Spacer';
import { DimensionValue } from './DimensionsInspector';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  id: string;
  color: FileFormat.Color;
  width: DimensionValue;
  onChangeColor: (color: FileFormat.Color) => void;
  onNudgeWidth: (amount: number) => void;
  prefix?: ReactNode;
}

export default memo(function BorderRow({
  id,
  color,
  width,
  onChangeColor,
  onNudgeWidth,
  prefix,
}: Props) {
  const colorInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const widthInputId = `${id}-width`;

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case colorInputId:
          return <Label.Label>Color</Label.Label>;
        case hexInputId:
          return <Label.Label>Hex</Label.Label>;
        case widthInputId:
          return <Label.Label>Width</Label.Label>;
        default:
          return null;
      }
    },
    [colorInputId, hexInputId, widthInputId],
  );

  return (
    <Row>
      <LabeledElementView renderLabel={renderLabel}>
        {prefix}
        {prefix && <Spacer.Horizontal size={8} />}
        <ColorInputField
          id={colorInputId}
          color={color}
          onChange={onChangeColor}
        />
        <Spacer.Horizontal size={8} />
        <InputField.Root id={hexInputId} labelPosition="start">
          <InputField.Input value={'FFFFFF'} />
          <InputField.Label>#</InputField.Label>
        </InputField.Root>
        <Spacer.Horizontal size={8} />
        <InputField.Root id={widthInputId} size={50}>
          <InputField.Input value={String(width)} onNudge={onNudgeWidth} />
        </InputField.Root>
      </LabeledElementView>
    </Row>
  );
});
