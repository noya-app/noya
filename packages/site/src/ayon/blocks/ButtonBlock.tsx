import { Button } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { buttonColors } from './blockTheme';
import { isWithinRectRange } from './score';
import { buttonSymbolId } from './symbols';

const globalHashtags = [
  'light',
  'dark',
  'primary',
  'secondary',
  'warning',
  'danger',
  'disabled',
];

const parser = 'regular';

export const ButtonBlock: BlockDefinition = {
  id: buttonSymbolId,
  parser,
  hashtags: globalHashtags,
  infer: ({ frame, blockText }) =>
    isWithinRectRange(frame, 60, 30, 300, 80) ? 0.8 : 0,
  render: (props) => {
    const {
      content,
      parameters: {
        light,
        dark,
        primary,
        secondary,
        warning,
        danger,
        disabled,
      },
    } = parseBlock(props.blockText, parser);

    const buttonColorKey = light
      ? 'light'
      : dark
      ? 'dark'
      : primary
      ? 'primary'
      : secondary
      ? 'secondary'
      : warning
      ? 'warning'
      : danger
      ? 'danger'
      : 'default';

    const colors = buttonColors[buttonColorKey];

    let size;
    if (props.frame.height < 30) {
      size = 'xs' as const;
    } else if (props.frame.height > 50) {
      size = 'lg' as const;
    } else {
      size = 'md' as const;
    }

    return (
      <Button
        size={size}
        isFullWidth
        backgroundColor={colors.backgroundColor}
        color={colors.color}
        isDisabled={!!disabled}
      >
        {content}
      </Button>
    );
  },
};
