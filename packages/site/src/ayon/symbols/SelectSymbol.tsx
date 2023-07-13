import { SelectProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import { getBlockThemeColors } from '../blocks/blockTheme';
import { isWithinRectRange } from '../infer/score';
import { getParameters } from '../utils/getMappedParameters';
import { selectSymbolId } from './symbolIds';
import { RenderProps } from './types';

const globalHashtags = ['dark', 'accent', 'disabled'];

const placeholderText = `
Role
Guest
Member
Admin`.trim();

export const selectSymbol = SketchModel.symbolMaster({
  symbolID: selectSymbolId,
  name: 'Select',
  blockDefinition: {
    hashtags: globalHashtags,
    placeholderText,
    infer: ({ frame }) =>
      isWithinRectRange({
        rect: frame,
        minWidth: 60,
        minHeight: 25,
        maxWidth: 400,
        maxHeight: 80,
      })
        ? 0.7
        : 0,
    render: ({ Components, instance }: RenderProps) => {
      const Select: React.FC<SelectProps> = Components[selectSymbolId];

      const items: { content: string; parameters: Record<string, boolean> }[] =
        [
          {
            content: instance.blockText ?? placeholderText,
            parameters: {},
          },
        ];

      const { dark, accent, disabled } = getParameters(
        instance.blockParameters,
      );

      const { backgroundColor, color, borderColor } = getBlockThemeColors({
        dark,
        accent,
      });

      return (
        <Select
          style={{
            backgroundColor,
            color,
            borderColor,
          }}
          disabled={!!disabled}
          value={items[0].content}
          options={items.map((item) => item.content)}
        />
      );
    },
  },
});
