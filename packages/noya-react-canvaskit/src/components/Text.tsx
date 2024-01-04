import { Paragraph } from '@noya-app/noya-canvaskit';
import { createElement, memo, useMemo } from 'react';
import useRect, { RectParameters } from '../hooks/useRect';
import { TextComponentProps } from '../types';

interface TextProps {
  rect: RectParameters;
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
