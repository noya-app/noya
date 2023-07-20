import { IconProps, LinkProps, component } from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import {
  parametersToTailwindStyle,
  tailwindTextClasses,
} from '../../tailwind/tailwind';
import { getParameters } from '../../utils/getMappedParameters';
import { linkSymbolId } from '../symbolIds';
import { RenderProps } from '../types';

const placeholderText = 'Read More';

export const linkSymbol = SketchModel.symbolMaster({
  symbolID: linkSymbolId,
  name: 'Link',
  blockDefinition: {
    supportsBlockText: true,
    hashtags: [
      'icon-arrow-forward',
      'left',
      'center',
      'right',
      ...tailwindTextClasses,
      'flex-1',
    ],
    placeholderText,
    infer: ({ frame }) => 0,
    render: ({ Components, instance, passthrough }: RenderProps) => {
      const Link: React.FC<LinkProps> = Components[linkSymbolId];
      const IconArrowForward: React.FC<IconProps> =
        Components[component.id.IconArrowForward];

      const content = instance.blockText ?? placeholderText;
      const parameters = getParameters(instance.blockParameters);

      const style = parametersToTailwindStyle(parameters);

      const hasIcon = parameters['icon-arrow-forward'];

      return (
        <Link {...passthrough} style={style} href="#">
          {content}
          {hasIcon && (
            <IconArrowForward
              size="16px"
              style={{
                verticalAlign: 'text-bottom',
                marginLeft: '4px',
              }}
            />
          )}
        </Link>
      );
    },
  },
});
