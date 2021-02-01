import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { memo, ReactNode } from 'react';
// import EditableInput from '../components/input/EditableInput';
import styled from 'styled-components';
import ColorInputField from '../ColorInputField';
import * as InputField from '../InputField';
import * as Spacer from '../Spacer';
import * as Label from '../Label';
import LabeledElementView from '../LabeledElementView';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  id: string;
  color: FileFormat.Color;
  prefix?: ReactNode;
}

export default memo(function FillRow({ id, color, prefix }: Props) {
  const colorInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;

  return (
    <Row id={id}>
      <LabeledElementView
        renderLabel={({ id }) => {
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
        }}
      >
        {prefix}
        {prefix && <Spacer.Horizontal size={8} />}
        <ColorInputField id={colorInputId} color={color} />
        <Spacer.Horizontal size={8} />
        <InputField.Root id={hexInputId} labelPosition="start">
          <InputField.Input value={'FFFFFF'} />
          <InputField.Label>#</InputField.Label>
        </InputField.Root>
        <Spacer.Horizontal size={8} />
        <InputField.Root id={opacityInputId} size={50}>
          <InputField.Input value={String(Math.round(color.alpha * 100))} />
          <InputField.Label>%</InputField.Label>
        </InputField.Root>
      </LabeledElementView>
    </Row>
  );
});
