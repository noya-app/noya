import type FileFormat from '@sketch-hq/sketch-file-format-ts';
// import EditableInput from '../components/input/EditableInput';
import styled from 'styled-components';
import * as InputField from '../InputField';
import * as Spacer from '../Spacer';
import { DimensionValue } from './DimensionsInspector';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  color: FileFormat.Color;
}

export default function FillRow({ color }: Props) {
  return (
    <Row>
      <div
        style={{
          width: '60px',
          height: '27px',
          borderRadius: '4px',
          border: '1px solid rgba(0,0,0,0.1)',
          backgroundColor: `rgba(${color.red * 255}, ${color.green * 255}, ${
            color.blue * 255
          }, ${color.alpha})`,
        }}
      />
      <Spacer.Horizontal size={8} />
      <InputField.Root labelPosition="start">
        <InputField.Input value={'FFFFFF'} />
        <InputField.Label>#</InputField.Label>
      </InputField.Root>
      <Spacer.Horizontal size={8} />
      <InputField.Root size={50}>
        <InputField.Input value={String(Math.round(color.alpha * 100))} />
        <InputField.Label>%</InputField.Label>
      </InputField.Root>
    </Row>
  );
}
