import { InputField, Spacer } from 'noya-designsystem';
import styled from 'styled-components';

export type DimensionValue = number | undefined;

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
          <InputField.NumberInput
            value={x}
            placeholder={x === undefined ? 'multi' : undefined}
            onSubmit={() => {}}
          />
          <InputField.Label>X</InputField.Label>
        </InputField.Root>
        <Spacer.Horizontal size={16} />
        <InputField.Root>
          <InputField.NumberInput
            value={y}
            placeholder={y === undefined ? 'multi' : undefined}
            onSubmit={() => {}}
          />
          <InputField.Label>Y</InputField.Label>
        </InputField.Root>
      </Row>
      <Spacer.Vertical size={10} />
      <Row>
        <InputField.Root>
          <InputField.NumberInput
            value={width}
            placeholder={width === undefined ? 'multi' : undefined}
            onSubmit={() => {}}
          />
          <InputField.Label>W</InputField.Label>
        </InputField.Root>
        <Spacer.Horizontal size={16} />
        <InputField.Root>
          <InputField.NumberInput
            value={height}
            placeholder={height === undefined ? 'multi' : undefined}
            onSubmit={() => {}}
          />
          <InputField.Label>H</InputField.Label>
        </InputField.Root>
      </Row>
    </>
  );
}
