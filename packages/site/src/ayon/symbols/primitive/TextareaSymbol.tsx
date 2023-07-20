import { InputProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import { getParameters } from '../../utils/getMappedParameters';
import { textareaSymbolId } from '../symbolIds';
import { getBlockThemeColors } from '../symbolTheme';
import { RenderProps } from '../types';

const globalHashtags = ['dark', 'accent', 'disabled'];

export const textareaSymbol = SketchModel.symbolMaster({
  symbolID: textareaSymbolId,
  name: 'Textarea',
  blockDefinition: {
    supportsBlockText: true,
    hashtags: globalHashtags,
    infer: ({ frame }) => 0.1,
    render: ({ Components, instance, passthrough }: RenderProps) => {
      const Textarea: React.FC<InputProps> = Components[textareaSymbolId];

      const content = instance.blockText;
      const { dark, accent, disabled } = getParameters(
        instance.blockParameters,
      );

      const { backgroundColor, color, borderColor } = getBlockThemeColors({
        dark,
        accent,
      });

      return (
        <Textarea
          {...passthrough}
          value={content}
          disabled={!!disabled}
          style={{
            backgroundColor,
            color,
            borderColor,
          }}
        />
      );
    },
  },
});
