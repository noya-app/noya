import React, { memo } from 'react';
import { createDrawing } from '@shopify/react-native-skia';

import { ParagraphNative, Rect as RNSRect } from 'noya-native-canvaskit';
import { Rect } from 'canvaskit-types';
import useRect from '../hooks/useRect';

interface TextProps {
  rect: Rect;
  paragraph: ParagraphNative;
}

const onDraw = createDrawing<TextProps>(function onDraw(
  { canvas },
  { paragraph, ...params },
) {
  const rect = params.rect as unknown as RNSRect;

  // rn-skia uses y as bottom line
  paragraph.draw(canvas, rect.x, rect.y + rect.height);
});

const Text: React.FC<TextProps> = (props) => {
  const rect = useRect(props.rect);

  const elementProps = { ...props, rect };

  return <skDrawing onDraw={onDraw} {...elementProps} skipProcessing />;
};

export default memo(Text);
