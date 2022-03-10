import React, { memo, PropsWithChildren } from 'react';
import styled from 'styled-components';

const Center: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return <CenterView>{children}</CenterView>;
};

export default memo(Center);

const CenterView = styled.div((_p) => ({
  justifyContent: 'center',
  alignItems: 'center',
}));
