import { Button } from '@chakra-ui/react';
import { BlockDefinition } from 'noya-state';
import React from 'react';
import { parseBlock } from '../parse';
import { buttonColors } from './blockTheme';
import { isWithinRectRange } from './score';
import { buttonSymbol } from './symbols';

const placeholderText = 'Submit';

const globalHashtags = [
  'light',
  'dark',
  'primary',
  'secondary',
  'warning',
  'danger',
  'disabled',
  'xs',
  'md',
  'lg',
];

const parser = 'regular';

export const ButtonBlock: BlockDefinition = {
  symbol: buttonSymbol,
  parser,
  hashtags: globalHashtags,
  placeholderText,
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
        xs,
        lg,
        md,
      },
    } = parseBlock(props.blockText, parser, { placeholder: placeholderText });

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

    let size = xs ? 'xs' : lg ? 'lg' : md ? 'md' : undefined;

    if (props.frame && size === undefined) {
      if (props.frame.height < 30) {
        size = 'xs' as const;
      } else if (props.frame.height > 50) {
        size = 'lg' as const;
      } else {
        size = 'md' as const;
      }
    }

    return (
      <Button
        {...(props.frame && {
          width: `${props.frame.width}px`,
        })}
        size={size}
        backgroundColor={colors.backgroundColor}
        color={colors.color}
        isDisabled={!!disabled}
      >
        {content}
      </Button>
    );
  },
};
