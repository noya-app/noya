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
  color: FileFormat.Color;
}

export default function ColorInputField({ color }: Props) {
  return (
    <Row
      color={`rgba(${color.red * 255}, ${color.green * 255}, ${
        color.blue * 255
      }, ${color.alpha})`}
    />
  );
}
