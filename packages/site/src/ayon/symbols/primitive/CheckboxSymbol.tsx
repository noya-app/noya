import { CheckboxProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import { parametersToTailwindStyle } from 'noya-tailwind';
import React from 'react';
import { isWithinRectRange } from '../../infer/score';
import { getParameters } from '../../utils/getMappedParameters';
import { checkboxSymbolId } from '../symbolIds';
import { RenderProps } from '../types';

const placeholderText = '#off Remember me';

const globalHashtags = ['on', 'off', 'disabled', 'no-label'];

export const checkboxSymbol = SketchModel.symbolMaster({
  symbolID: checkboxSymbolId,
  name: 'Checkbox',
  blockDefinition: {
    supportsBlockText: true,
    hashtags: globalHashtags,
    placeholderText,
    infer: ({ frame }) =>
      isWithinRectRange({
        rect: frame,
        minWidth: 10,
        minHeight: 10,
        maxWidth: 300,
        maxHeight: 60,
      })
        ? 0.8
        : 0,
    render: ({ Components, instance, passthrough }: RenderProps) => {
      const Checkbox: React.FC<CheckboxProps> = Components[checkboxSymbolId];

      const {
        on,
        disabled,
        'no-label': noLabel,
      } = getParameters(instance.blockParameters);
      const content = instance.blockText ?? placeholderText;

      return (
        <Checkbox
          {...passthrough}
          checked={!!on}
          disabled={!!disabled}
          style={parametersToTailwindStyle(instance.blockParameters)}
          {...(!noLabel && { label: content })}
        />
      );
    },
  },
});
