import { SketchModel } from '@noya-app/noya-sketch-model';
import { TagProps, TagSize, TagVariant } from '@noya-design-system/protocol';
import { parametersToTailwindStyle } from 'noya-tailwind';
import React from 'react';
import { getMappedParameters } from '../../utils/getMappedParameters';
import { tagSymbolId } from '../symbolIds';
import { buttonColors } from '../symbolTheme';
import { RenderProps } from '../types';

const placeholderText = 'New';

const variantKeys: TagVariant[] = ['outline', 'solid'];
const sizeKeys: TagSize[] = ['small', 'medium'];
const colorSchemeKeys = ['dark', 'light'];

export const tagSymbol = SketchModel.symbolMaster({
  symbolID: tagSymbolId,
  name: 'Tag',
  blockDefinition: {
    supportsBlockText: true,
    hashtags: [...variantKeys, ...sizeKeys, ...colorSchemeKeys],
    placeholderText,
    infer: ({ frame }) => 0,
    render: ({ Components, instance, passthrough }: RenderProps) => {
      const Tag: React.FC<TagProps> = Components[tagSymbolId];

      const content = instance.blockText ?? placeholderText;
      const style = parametersToTailwindStyle(instance.blockParameters);
      const parameters = new Set(instance.blockParameters);

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

      return (
        <Tag
          {...passthrough}
          style={style}
          {...(variant && { variant })}
          {...(size && { size })}
        >
          {content}
        </Tag>
      );
    },
  },
});
