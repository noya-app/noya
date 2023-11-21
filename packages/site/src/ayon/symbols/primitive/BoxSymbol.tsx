import { BoxProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import { parametersToTailwindStyle, tailwindBlockClasses } from 'noya-tailwind';
import { findLast } from 'noya-utils';
import React from 'react';
import { getParameters } from '../../utils/getMappedParameters';
import { boxSymbolId } from '../symbolIds';
import { getBlockThemeColors } from '../symbolTheme';
import { RenderProps } from '../types';

export const boxSymbol = SketchModel.symbolMaster({
  symbolID: boxSymbolId,
  name: 'Box',
  blockDefinition: {
    hashtags: tailwindBlockClasses,
    placeholderParameters: ['flex-1'],
    render({ Components, instance, children, passthrough }: RenderProps) {
      const Box: React.FC<BoxProps> = Components[boxSymbolId];
      const parameters = getParameters(instance.blockParameters);
      const hashtags = Object.keys(parameters);

      const themeStyle = parameters.dark
        ? {
            backgroundColor: getBlockThemeColors({ dark: true, accent: false })
              .backgroundColor,
          }
        : {};

      const { justify, items } = simpleFlex(hashtags);

      const style = parametersToTailwindStyle({
        ...parameters,
        ...(justify && { [justify]: true }),
        ...(items && { [items]: true }),
      });

      return (
        <Box
          {...passthrough}
          style={{
            display: 'flex',
            ...themeStyle,
            ...style,
          }}
          children={children}
        />
      );
    },
  },
});

// Simplify flexbox alignment by handling row vs. column automatically
function simpleFlex(hashtags: string[]) {
  const flexKey = findLast(hashtags, (value) =>
    /^(flex-row|flex-col)$/.test(value),
  );
  const alignmentKey = findLast(hashtags, (value) =>
    /^(left|center|right)$/.test(value),
  );

  let justify: string | undefined;
  let items: string | undefined;

  if (flexKey === 'flex-row') {
    switch (alignmentKey) {
      case 'left':
        justify = 'justify-start';
        break;
      case 'center':
        justify = 'justify-center';
        break;
      case 'right':
        justify = 'justify-end';
        break;
    }

    if (hashtags.includes('center')) {
      items = 'items-center';
    }
  } else if (flexKey === 'flex-col') {
    switch (alignmentKey) {
      case 'left':
        items = 'items-start';
        break;
      case 'center':
        items = 'items-center';
        break;
      case 'right':
        items = 'items-end';
        break;
    }

    if (hashtags.includes('center')) {
      justify = 'justify-center';
    }
  }

  return { justify, items };
}
