import React, { memo, useCallback } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { ImageBackground } from 'react-native';
import styled from 'styled-components';

import BackgroundImage from 'app-mobile/assets/images/background.png';
import { useColorPicker } from '../contexts/ColorPickerContext';
import { hsvaToHslaString } from '../utils/convert';
import { Interactive } from './Interactive';
import { Interaction } from './types';
import Pointer from './Pointer';

const Container = styled(LinearGradient)({
  height: 12,
  borderRadius: 6,
});

const Background = styled(ImageBackground)({
  height: 12,
  borderRadius: 6,
  overflow: 'hidden',
});

export default memo(function AlphaBase() {
  const [hsva, onChange] = useColorPicker();

  const handleMove = useCallback(
    (interaction: Interaction) => {
      onChange({ a: interaction.left });
    },
    [onChange],
  );

  // We use `Object.assign` instead of the spread operator
  // to prevent adding the polyfill (about 150 bytes gzipped)
  const colorFrom = hsvaToHslaString(Object.assign({}, hsva, { a: 0 }));
  const colorTo = hsvaToHslaString(Object.assign({}, hsva, { a: 1 }));

  return (
    <Interactive onMove={handleMove}>
      {/* @ts-ignore */}
      <Background source={BackgroundImage} resizeMode="repeat">
        <Container
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          colors={[colorFrom, colorTo]}
          pointerEvents="none"
        />
      </Background>
      <Pointer left={hsva.a} />
    </Interactive>
  );
});
