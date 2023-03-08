import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { linkSymbolId } from './symbolIds';
import { linkSymbol } from './symbols';
import {
  getBlockClassName,
  getLastClassInGroup,
  tailwindTextClasses,
} from './tailwind';
import { resolveColor } from './tailwindColors';

const placeholderText = 'Read More';

const parser = 'regular';

export const LinkBlock: BlockDefinition = {
  symbol: linkSymbol,
  parser,
  hashtags: [
    'icon-arrow-forward',
    'left',
    'center',
    'right',
    ...tailwindTextClasses,
    'flex-1',
  ],
  placeholderText,
  infer: ({ frame, blockText }) => 0,
  render: ({ h, Components: { [linkSymbolId]: Link } }, props) => {
    const { content, parameters } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
    });

    const hashtags = Object.keys(parameters);
    const colorKey = getLastClassInGroup('textColor', hashtags);
    const color = colorKey ? resolveColor(colorKey) : 'dodgerblue';
    const textDecoration = getLastClassInGroup('textDecoration', hashtags);

    return h(
      Link,
      {
        ...(props.dataSet && {
          key: props.dataSet.id,
          'data-noya-id': props.dataSet.id,
          'data-noya-parent-id': props.dataSet.parentId,
        }),
        style: {
          fontWeight: 'semibold',
          color,
          textDecorationColor: color,
          textDecoration:
            textDecoration === 'no-underline'
              ? 'none'
              : textDecoration === 'line-through'
              ? 'line-through'
              : textDecoration === 'overline'
              ? 'overline'
              : undefined,
        },
        className: getBlockClassName(hashtags),
      },
      content,
    );
  },
};

/* {parameters['icon-arrow-forward'] && (
  <>
    {' '}
    <ArrowForwardIcon
      style={{
        verticalAlign: 'text-bottom',
      }}
    />
  </>
)} */
