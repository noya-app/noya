import { Paragraph } from 'canvaskit-wasm';
import { createElement, memo, useMemo } from 'react';
import { TextComponentProps } from '../types';
import useRect, { RectParameters } from '../hooks/useRect';

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
