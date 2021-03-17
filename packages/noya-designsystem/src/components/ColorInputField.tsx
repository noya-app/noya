import * as Popover from '@radix-ui/react-popover';
import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo, useMemo } from 'react';
import styled from 'styled-components';
import { sketchColorToRgbaString } from '../utils/sketchColor';
import ColorPicker from './ColorPicker';

const Trigger = styled(Popover.Trigger)(({ color }) => ({
  width: '40px',
  height: '27px',
  borderRadius: '4px',
  border: '1px solid rgba(0,0,0,0.1)',
  backgroundColor: color,
}));

const Content = styled(Popover.Content)(({ theme }) => ({
  width: '240px',
  borderRadius: 4,
  padding: '10px',
  fontSize: 14,
  backgroundColor: theme.colors.popover.background,
  color: 'black',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
}));

const StyledArrow = styled(Popover.Arrow)(({ theme }) => ({
  fill: theme.colors.popover.background,
}));

interface Props {
  id?: string;
  value: Sketch.Color;
  onChange: (color: Sketch.Color) => void;
}

export default memo(function ColorInputField({ id, value, onChange }: Props) {
  const colorString = useMemo(() => sketchColorToRgbaString(value), [value]);

  return (
    <Popover.Root>
      <Trigger color={colorString} id={id} />
      <Content side="bottom" align="center">
        <ColorPicker value={value} onChange={onChange} />
        <StyledArrow />
      </Content>
    </Popover.Root>
  );
});
