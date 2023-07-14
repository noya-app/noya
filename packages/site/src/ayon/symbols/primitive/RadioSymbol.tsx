import { RadioProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import { isWithinRectRange } from '../../infer/score';
import { getParameters } from '../../utils/getMappedParameters';
import { radioSymbolId } from '../symbolIds';
import { RenderProps } from '../types';

const placeholderText = '#off Daily';

const globalHashtags = ['on', 'off', 'disabled', 'no-label'];

export const radioSymbol = SketchModel.symbolMaster({
  symbolID: radioSymbolId,
  name: 'Radio',
  blockDefinition: {
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
      const Radio: React.FC<RadioProps> = Components[radioSymbolId];

      const content = instance.blockText ?? placeholderText;
      const {
        on,
        disabled,
        'no-label': noLabel,
      } = getParameters(instance.blockParameters);

      return (
        <Radio
          {...passthrough}
          checked={!!on}
          disabled={!!disabled}
          {...(!noLabel && { label: content })}
        />
      );
    },
  },
});
