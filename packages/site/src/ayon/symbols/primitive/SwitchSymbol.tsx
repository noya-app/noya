import { SketchModel } from '@noya-app/noya-sketch-model';
import { SwitchProps } from '@noya-design-system/protocol';
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
    render: ({ Components, instance, passthrough }: RenderProps) => {
      const Switch: React.FC<SwitchProps> = Components[switchSymbolId];

      const { on, disabled } = getParameters(instance.blockParameters);

      return <Switch {...passthrough} checked={!!on} disabled={!!disabled} />;
    },
  },
});
