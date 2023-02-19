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

type ButtonColorKey = keyof typeof buttonColors;

const colorsKeys = new Set<ButtonColorKey>([
  'light',
  'dark',
  'primary',
  'secondary',
  'warning',
  'danger',
]);

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
      parameters: { xs, lg, md, disabled, ...parameters },
    } = parseBlock(props.blockText, parser, { placeholder: placeholderText });

    const hashtags = Object.keys(parameters);

    const colorKey = hashtags
      .slice()
      .reverse()
      .find((key) => colorsKeys.has(key as ButtonColorKey)) as
      | ButtonColorKey
      | undefined;

    const buttonColorKey = colorKey ?? 'default';

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
        {...(props.dataSet && {
          key: props.dataSet.id,
          'data-noya-id': props.dataSet.id,
          'data-noya-parent-id': props.dataSet.parentId,
        })}
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
