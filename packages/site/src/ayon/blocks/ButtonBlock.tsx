import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { buttonColors } from './blockTheme';
import { isWithinRectRange } from './score';
import { buttonSymbolId } from './symbolIds';
import { buttonSymbol } from './symbols';
import { getBlockClassName } from './tailwind';

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
    isWithinRectRange({
      rect: frame,
      minWidth: 60,
      minHeight: 30,
      maxWidth: 300,
      maxHeight: 80,
    })
      ? 0.8
      : 0,
  render: ({ h, Components: { [buttonSymbolId]: Button } }, props) => {
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

    return h(
      Button,
      {
        ...(props.dataSet && {
          key: props.dataSet.id,
          'data-noya-id': props.dataSet.id,
          'data-noya-parent-id': props.dataSet.parentId,
        }),
        disabled: !!disabled,
        style: {
          color: colors.color,
          backgroundColor: colors.backgroundColor,
          ...(props.frame && {
            width: `${props.frame.width}px`,
          }),
        },
        className: getBlockClassName(hashtags),
      },
      content,
    );
  },
};
