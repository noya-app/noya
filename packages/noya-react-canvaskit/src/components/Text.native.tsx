import React, { memo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { RectParameters } from '../hooks/useRect';
import { SkiaParagraph } from 'noya-native-canvaskit';

interface TextProps {
  rect: RectParameters;
  paragraph: SkiaParagraph;
}

const Text: React.FC<TextProps> = (props) => {
  const onDraw = useDrawing(props, ({ canvas }, { rect, paragraph }) => {
    // rn-skia uses y as bottom line
    paragraph.draw(canvas, rect[0], rect[3]);
  });

  return <Drawing onDraw={onDraw} {...props} skipProcessing />;
};

export default memo(Text);
