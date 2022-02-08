import React, { FunctionComponent } from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components';
import { useFPSMetric } from '../hooks/useFPSMetric';

export const FpsCounter: FunctionComponent<{ visible: boolean }> = ({
  visible,
}) => {
  const { fps, average } = useFPSMetric();
  if (!visible) return null;
  return (
    <View pointerEvents={'none'}>
      <Txt>
        FPS/AVG: {fps}/{average.toFixed(2)}
      </Txt>
    </View>
  );
};

const Txt = styled(Text)((p) => ({
  color: p.theme.colors.text,
}));
