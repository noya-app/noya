import { BoxProps } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { partition } from 'noya-utils';
import { getTextAlign, parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { boxSymbolId, textSymbolId } from './symbolIds';
import { textSymbol } from './symbols';
import {
  classGroups,
  parametersToTailwindStyle,
  tailwindTextClasses,
} from './tailwind';

export const TextBlock: BlockDefinition = {
  symbol: textSymbol,
  parser: 'regular',
  hashtags: ['left', 'center', 'right', ...tailwindTextClasses, 'flex-1'],
  infer: ({ frame, blockText }) =>
    Math.max(
      blockText &&
        blockText.split(' ').filter((word) => word[0] !== '#').length > 0
        ? 0.7
        : 0,
      0.1,
    ),
  render: (
    { h, Components: { [textSymbolId]: Text, [boxSymbolId]: Box } },
    props,
  ) => {
    const { content, parameters } = parseBlock(props.blockText, 'regular');
    const hashtags = Object.keys(parameters);

    const [flexClasses, otherClasses] = partition(hashtags, (hashtag) => {
      return (
        classGroups.flex.test(hashtag) ||
        classGroups.alignSelf.test(hashtag) ||
        /m[xytrbl]?-/.test(hashtag)
      );
    });

    const boxStyle = parametersToTailwindStyle(flexClasses);
    const textStyle = parametersToTailwindStyle(otherClasses);

    const contentElement = h(
      Text,
      {
        style: {
          flex: '1',
          textAlign: getTextAlign(hashtags),
          ...textStyle,
        },
      },
      content,
    );

    if (Object.keys(boxStyle).length === 0) return contentElement;

    return h<BoxProps>(
      Box,
      {
        ...applyCommonProps(props),
        style: {
          display: 'flex',
          ...boxStyle,
        },
      },
      contentElement,
    );
  },
};
