import React, { useMemo } from 'react';
import styled from 'styled-components';

const Container = styled.div(() => ({
  width: '10px',
  height: '10px',
  borderRadius: '10px',
  border: '2px solid white',
  boxShadow: '0 0 1px 1px rgba(0,0,0,0.4), 0 0 1px 1px rgba(0,0,0,0.4) inset',
  zIndex: 1,
  transform: 'translate(-50%, -50%)',
  ...({ position: 'absolute' } as any),
}));

interface Props {
  top?: number;
  left: number;
}

export const Pointer = ({ left, top = 0.5 }: Props): JSX.Element => {
  const style = useMemo(
    () => ({
      top: `${top * 100}%`,
      left: `${left * 100}%`,
    }),
    [left, top],
  );

  return <Container style={style} />;
};
