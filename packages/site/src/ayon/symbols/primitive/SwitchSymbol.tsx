import { SwitchProps } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import { getParameters } from '../../utils/getMappedParameters';
import { switchSymbolId } from '../symbolIds';
import { RenderProps } from '../types';

const globalHashtags = ['on', 'off', 'disabled'];

export const switchSymbol = SketchModel.symbolMaster({
  symbolID: switchSymbolId,
  name: 'Switch',
  blockDefinition: {
    hashtags: globalHashtags,
    infer: ({ frame }) => 0.1,
    render: ({ Components, instance }: RenderProps) => {
      const Switch: React.FC<SwitchProps> = Components[switchSymbolId];

      const { on, disabled } = getParameters(instance.blockParameters);

      return <Switch checked={!!on} disabled={!!disabled} />;
    },
  },
});
