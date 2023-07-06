import {
  TagProps,
  TagSize,
  TagVariant,
  component,
} from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { getMappedParameters } from '../utils/getMappedParameters';
import { applyCommonProps } from './applyCommonProps';
import { buttonColors } from './blockTheme';
import { tagSymbol } from './symbols';
import { parametersToTailwindStyle } from './tailwind';

const placeholderText = 'New';

const variantKeys: TagVariant[] = ['outline', 'solid'];
const sizeKeys: TagSize[] = ['small', 'medium'];
const colorSchemeKeys = ['dark', 'light'];

export const TagBlock: BlockDefinition = {
  symbol: tagSymbol,
  hashtags: [...variantKeys, ...sizeKeys, ...colorSchemeKeys],
  placeholderText,
  infer: ({ frame, blockText }) => 0,
  render: ({ h, Components: { [component.id.Tag]: Tag } }, props) => {
    const content = props.blockText ?? placeholderText;
    const style = parametersToTailwindStyle(props.blockParameters);
    const parameters = new Set(props.blockParameters);

    const { variant, size, colorScheme } = getMappedParameters(parameters, {
      variant: variantKeys,
      size: sizeKeys,
      colorScheme: colorSchemeKeys,
    });

    if (colorScheme === 'dark') {
      Object.assign(style, buttonColors.darkDisabled);
    } else if (colorScheme === 'light') {
      Object.assign(style, buttonColors.lightDisabled);
    }

    return h<TagProps>(
      Tag,
      {
        ...applyCommonProps(props),
        style,
        ...(variant && { variant }),
        ...(size && { size }),
      },
      content,
    );
  },
};
