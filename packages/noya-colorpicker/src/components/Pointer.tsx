import React, { memo, useMemo } from 'react';
import styled from 'styled-components';

import type { PointerProps } from './types';

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

export default memo(function Pointer({
  top = 0.5,
  left,
  index,
  selected = false,
  onClick,
}: PointerProps): JSX.Element {
  const style = useMemo(
    () => ({
      top: `${top * 100}%`,
      left: `${left * 100}%`,
    }),
    [left, top],
  );

  return (
    <Container
      data-index={index}
      className={'pointer'}
      style={style}
      onClick={onClick}
      selected={selected}
    />
  );
});
