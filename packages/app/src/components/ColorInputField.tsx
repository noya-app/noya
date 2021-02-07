import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import styled from 'styled-components';
import * as Popover from '@radix-ui/react-popover';
import DualAxisColorPicker from './color/DualAxisColorPicker';

const Trigger = styled(Popover.Trigger)(({ color }) => ({
  width: '60px',
  height: '27px',
  borderRadius: '4px',
  border: '1px solid rgba(0,0,0,0.1)',
  backgroundColor: color,
}));

const StyledContent = styled(Popover.Content)({
  width: '240px',
  borderRadius: 4,
  padding: '10px',
  fontSize: 14,
  backgroundColor: 'white',
  color: 'black',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
});

const StyledArrow = styled(Popover.Arrow)({
  fill: 'white',
});

interface Props {
  id?: string;
  color: FileFormat.Color;
}

export default function ColorInputField({ id, color }: Props) {
  const colorString = `rgba(${color.red * 255}, ${color.green * 255}, ${
    color.blue * 255
  }, ${color.alpha})`;

  return (
    <Popover.Root>
      <Trigger color={colorString} id={id} />
      <StyledContent>
        <DualAxisColorPicker color={{ h: 0, s: 1, l: 0.5, a: 1 }} />
        <StyledArrow />
      </StyledContent>
    </Popover.Root>
  );
}
