import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import styled from 'styled-components';

const Row = styled.div<{ color: string }>(({ theme, color }) => ({
  width: '60px',
  height: '27px',
  borderRadius: '4px',
  border: '1px solid rgba(0,0,0,0.1)',
  backgroundColor: color,
}));

interface Props {
  id?: string;
  color: FileFormat.Color;
}

export default function ColorInputField({ id, color }: Props) {
  return (
    <Row
      id={id}
      color={`rgba(${color.red * 255}, ${color.green * 255}, ${
        color.blue * 255
      }, ${color.alpha})`}
    />
  );
}
