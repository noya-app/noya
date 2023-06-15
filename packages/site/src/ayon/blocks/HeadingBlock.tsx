import Sketch from 'noya-file-format';
import { BlockDefinition } from 'noya-state';
import { partition } from 'noya-utils';
import { getTextAlign, parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { isWithinRectRange } from './score';
import { boxSymbolId, textSymbolId } from './symbolIds';
import {
  heading1Symbol,
  heading2Symbol,
  heading3Symbol,
  heading4Symbol,
  heading5Symbol,
  heading6Symbol,
} from './symbols';
import {
  classGroups,
  getBlockClassName,
  getLastClassInGroup,
  tailwindTextClasses,
} from './tailwind';
import { resolveColor } from './tailwindColors';

const createHeadingBlock = (
  symbol: Sketch.SymbolMaster,
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
): BlockDefinition => ({
  symbol,
  parser: 'regular',
  hashtags: ['left', 'right', 'center', ...tailwindTextClasses],
  isComposedBlock: true,
  infer: ({ frame, blockText }) =>
    variant === 'h3' &&
    isWithinRectRange({
      rect: frame,
      minWidth: 400,
      minHeight: 30,
      maxWidth: 2000,
      maxHeight: 80,
    })
      ? 0.5
      : 0,
  render: (
    { h, Components: { [textSymbolId]: Text, [boxSymbolId]: Box } },
    props,
  ) => {
    const { content, parameters } = parseBlock(props.blockText, 'regular');

    let hashtags = Object.keys(parameters);
    const colorKey = getLastClassInGroup('textColor', hashtags);
    const color = colorKey ? resolveColor(colorKey) : undefined;
    hashtags = hashtags.filter((hashtag) => hashtag !== colorKey);

    const [flexClasses, otherClasses] = partition(hashtags, (hashtag) => {
      return (
        classGroups.flex.test(hashtag) ||
        classGroups.alignSelf.test(hashtag) ||
        /m[xytrbl]?-/.test(hashtag)
      );
    });

    return h(
      Box,
      {
        ...applyCommonProps(props),
        style: {
          display: 'flex',
        },
        className: getBlockClassName(flexClasses),
      },
      h(
        Text,
        {
          style: {
            flex: '1',
            textAlign: getTextAlign(hashtags),
            color,
          },
          className: getBlockClassName(otherClasses),
          variant,
        },
        content,
      ),
    );
  },
});

export const Heading1Block = createHeadingBlock(heading1Symbol, 'h1');
export const Heading2Block = createHeadingBlock(heading2Symbol, 'h2');
export const Heading3Block = createHeadingBlock(heading3Symbol, 'h3');
export const Heading4Block = createHeadingBlock(heading4Symbol, 'h4');
export const Heading5Block = createHeadingBlock(heading5Symbol, 'h5');
export const Heading6Block = createHeadingBlock(heading6Symbol, 'h6');
