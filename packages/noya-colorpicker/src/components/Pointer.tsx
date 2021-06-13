import React, { memo, useMemo } from 'react';
import styled from 'styled-components';

const Container = styled.div<{ selected: boolean }>(({ theme, selected }) => ({
  width: '10px',
  height: '10px',
  borderRadius: '10px',
  border: '2px solid white',
  boxShadow: '0 0 1px 1px rgba(0,0,0,0.4), 0 0 1px 1px rgba(0,0,0,0.4) inset',
  zIndex: 1,
  borderColor: selected ? theme.colors.primary : 'white',
  transform: 'translate(-50%, -50%)',
  ...({ position: 'absolute' } as any),
}));

interface Props {
  top?: number;
  left: number;
  selected?: boolean;
  onClick?: () => void;
}

export default memo(function Pointer({
  left,
  top = 0.5,
  selected = false,
  onClick,
}: Props): JSX.Element {
  const style = useMemo(
    () => ({
      top: `${top * 100}%`,
      left: `${left * 100}%`,
    }),
    [left, top],
  );

  return (
    <Container
      style={style}
      selected={selected}
      onMouseEnter={onClick}
      onTouchStart={onClick}
    />
  );
});