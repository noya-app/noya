import { memo } from 'react';
import styled from 'styled-components';

import selectionFile from './selection.json';
import { createGlyphsMap, getIconColor } from './utils';
import { IconProps } from './types';

const ghlyps = createGlyphsMap(selectionFile);

const Icon = styled.span<IconProps>(
  ({ theme, name, color, selected, size, highlighted }) => ({
    fontFamily: 'icomoon',
    speak: 'never',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontVariant: 'normal',
    textTransform: 'none',
    lineHeight: 1,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    '&:before': {
      display: 'block',
      content: `"\\${ghlyps[name]}"`,
    },
    color: getIconColor(theme, color, selected, highlighted),
    fontSize: size ? `${size}px` : '15px',
  }),
);

export default memo(Icon);
