import { SketchModel } from '@noya-app/noya-sketch-model';
import { isExternalUrl } from '@noya-app/noya-utils';
import { AvatarProps } from '@noya-design-system/protocol';
import { parametersToTailwindStyle } from 'noya-tailwind';
import React from 'react';
import { isApproximatelySquare, isWithinRectRange } from '../../infer/score';
import { avatarSymbolId } from '../symbolIds';
import { RenderProps } from '../types';

export const avatarSymbol = SketchModel.symbolMaster({
  symbolID: avatarSymbolId,
  name: 'Avatar',
  blockDefinition: {
    supportsBlockText: true,
    infer: ({ frame }) =>
      isWithinRectRange({
        rect: frame,
        minWidth: 30,
        minHeight: 30,
        maxWidth: 120,
        maxHeight: 120,
      }) && isApproximatelySquare(frame, 0.2)
        ? 0.8
        : 0,
    render({ Components, instance, passthrough }: RenderProps) {
      const Avatar: React.FC<AvatarProps> = Components[avatarSymbolId];

      const content = instance.blockText ?? '';
      const style = parametersToTailwindStyle(instance.blockParameters);
      const src = isExternalUrl(content) ? content : undefined;

      return (
        <Avatar
          {...passthrough}
          src={src}
          name={content}
          style={{
            ...style,
            ...(instance.frame && {
              width: `${instance.frame.width}px`,
              height: `${instance.frame.height}px`,
            }),
          }}
        />
      );
    },
  },
});
