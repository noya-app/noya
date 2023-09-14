import React, { memo } from 'react';
import styled, { keyframes } from 'styled-components';

interface Props {
  size?: number;
  opacity?: number;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${({ opacity }: Props) => opacity};
`;

// Use css syntax to support keyframes
const SpinnerCircle = styled.div<Props>`
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top: 2px solid black;
  border-radius: 50%;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
  animation: ${spin} 1s linear infinite;
`;

export const ActivityIndicator = memo(function ActivityIndicator({
  size = 16,
  opacity = 1,
}: Props) {
  return (
    <Spinner opacity={opacity}>
      <SpinnerCircle size={size} />
    </Spinner>
  );
});
