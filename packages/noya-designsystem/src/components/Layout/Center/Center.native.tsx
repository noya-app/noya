import React, { memo, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

const Center: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return <CenterView>{children}</CenterView>;
};

export default memo(Center);

const CenterView = styled(View)((_p) => ({
  justifyContent: 'center',
  alignItems: 'center',
}));
