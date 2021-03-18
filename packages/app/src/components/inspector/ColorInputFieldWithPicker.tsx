import * as Popover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { ColorInputField } from 'noya-designsystem';
import { memo, useMemo } from 'react';
import styled from 'styled-components';
import ColorInspector from './ColorInspector';

const Content = styled(Popover.Content)(({ theme }) => ({
  width: '240px',
  borderRadius: 4,
  padding: '10px',
  fontSize: 14,
  backgroundColor: theme.colors.popover.background,
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

export default memo(function ColorInputFieldWithPicker({
  id,
  value,
  onChange,
}: Props) {
  // TODO: The value prop here can be an array, and other
  // inspector rows may also take arrays
  const values = useMemo(() => [value], [value]);

  return (
    <Popover.Root>
      <Popover.Trigger as={Slot}>
        <ColorInputField id={id} value={value} />
      </Popover.Trigger>
      <Content side="bottom" align="center">
        <ColorInspector
          id={`${id}--panel`}
          colors={values}
          onChangeColor={onChange}
        />
        <StyledArrow />
      </Content>
    </Popover.Root>
  );
});
