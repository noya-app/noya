import { InputProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import { getBlockThemeColors } from '../blocks/blockTheme';
import { getParameters } from '../utils/getMappedParameters';
import { textareaSymbolId } from './symbolIds';
import { RenderProps } from './types';

const globalHashtags = ['dark', 'accent', 'disabled'];

export const textareaSymbol = SketchModel.symbolMaster({
  symbolID: textareaSymbolId,
  name: 'Textarea',
  blockDefinition: {
    hashtags: globalHashtags,
    infer: ({ frame }) => 0.1,
    render: ({ Components, instance }: RenderProps) => {
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
