import { createElement, memo, useMemo } from 'react';

import { Paragraph, Rect } from 'canvaskit-types';
import { TextComponentProps } from '../types';
import useRect from '../hooks/useRect';

interface TextProps {
  rect: Rect;
  paragraph: Paragraph;
}

export default memo(function Text(props: TextProps) {
  const rect = useRect(props.rect);
  const elementProps: TextComponentProps = useMemo(
    () => ({
      paragraph: props.paragraph,
      rect,
    }),
    [props.paragraph, rect],
  );

  return createElement('Text', elementProps);
});
