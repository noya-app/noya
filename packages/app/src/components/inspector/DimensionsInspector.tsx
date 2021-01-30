// import EditableInput from '../components/input/EditableInput';
import styled from 'styled-components';
import * as InputField from '../InputField';
import * as Spacer from '../Spacer';

export type DimensionValue = number | 'multi';

export interface Props {
  x: DimensionValue;
  y: DimensionValue;
  width: DimensionValue;
  height: DimensionValue;
}

const Row = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: '10px',
  paddingRight: '10px',
}));

export default function DimensionsInspector({ x, y, width, height }: Props) {
  return (
    <>
      <Row>
        <InputField.Root>
          <InputField.Input value={String(x)} />
          <InputField.Label>X</InputField.Label>
        </InputField.Root>
        <Spacer.Horizontal size={16} />
        <InputField.Root>
          <InputField.Input value={String(y)} />
          <InputField.Label>Y</InputField.Label>
        </InputField.Root>
      </Row>
      <Spacer.Vertical size={10} />
      <Row>
        <InputField.Root>
          <InputField.Input value={String(width)} />
          <InputField.Label>W</InputField.Label>
        </InputField.Root>
        <Spacer.Horizontal size={16} />
        <InputField.Root>
          <InputField.Input value={String(height)} />
          <InputField.Label>H</InputField.Label>
        </InputField.Root>
      </Row>
    </>
  );
}
