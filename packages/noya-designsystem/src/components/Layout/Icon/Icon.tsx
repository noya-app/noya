import { memo } from 'react';
import styled from 'styled-components';

import selectionFile from './selection.json';
import { createGlyphsMap } from './utils';
import { IconProps } from './types';

const ghlyps = createGlyphsMap(selectionFile);

const Icon = styled.span<IconProps>(
  ({ theme, name, color, selected, size }) => ({
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
    color: color ?? (selected ? theme.colors.iconSelected : theme.colors.icon),
    fontSize: size ? `${size}px` : '15px',
  }),
);

export default memo(Icon);
