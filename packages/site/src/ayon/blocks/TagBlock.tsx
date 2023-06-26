import {
  TagProps,
  TagSize,
  TagVariant,
  component,
} from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { tagSymbol } from './symbols';
import { parametersToTailwindStyle } from './tailwind';

const placeholderText = 'New';

const parser = 'regular';

const variantKeys: TagVariant[] = ['outline', 'solid'];
const sizeKeys: TagSize[] = ['small', 'medium'];

export const TagBlock: BlockDefinition = {
  symbol: tagSymbol,
  parser,
  hashtags: [...variantKeys, ...sizeKeys],
  placeholderText,
  infer: ({ frame, blockText }) => 0,
  render: ({ h, Components: { [component.id.Tag]: Tag } }, props) => {
    const { content, parameters } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
      mutuallyExclusiveParameters: {
        variant: variantKeys,
        size: sizeKeys,
      },
    });

    const style = parametersToTailwindStyle(parameters);

    return h<TagProps>(
      Tag,
      {
        ...applyCommonProps(props),
        style,
        ...(parameters.variant && {
          variant: parameters.variant as TagVariant,
        }),
        ...(parameters.size && {
          size: parameters.size as TagSize,
        }),
      },
      content,
    );
  },
};
