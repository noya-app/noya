import React, { memo } from 'react';
import { Text as SkiaText } from '@shopify/react-native-skia';

import { Paragraph } from 'canvaskit';
import useRect, { RectParameters } from '../hooks/useRect';

// TODO: move to shared directory f.e. PropTypes
// To avoid doubling the type
interface TextProps {
  rect: RectParameters;
  paragraph: Paragraph;
}

const Text: React.FC<TextProps> = (props) => {
  return null;
};

export default memo(Text);
