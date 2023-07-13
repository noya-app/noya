import {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React from 'react';
import { isWithinRectRange } from '../infer/score';
import { parametersToTailwindStyle } from '../tailwind/tailwind';
import { getMappedParameters } from '../utils/getMappedParameters';
import { buttonSymbolId } from './symbolIds';
import { RenderProps } from './types';

const colorSchemeKeys = ['dark', 'light'];
const sizeKeys: ButtonSize[] = ['small', 'medium', 'large'];
const positionKeys = ['left', 'center', 'right'];
const variantKeys: ButtonVariant[] = ['outline', 'solid', 'text'];
const schema = {
  variant: variantKeys,
  size: sizeKeys,
  position: positionKeys,
  colorScheme: colorSchemeKeys,
};

export const buttonSymbol = SketchModel.symbolMaster({
  symbolID: buttonSymbolId,
  name: 'Button',
  blockDefinition: {
    placeholderText: 'Submit',
    schema,
    hashtags: Object.values(schema).flat(),
    stylePresets: [
      { name: 'Default', parameters: [] },
      { name: 'Small', parameters: ['small'] },
      { name: 'Large', parameters: ['large'] },
      { name: 'Outlined', parameters: ['outline'] },
      { name: 'Text', parameters: ['text'] },
      { name: 'Dark', parameters: ['bg-slate-800'] },
    ],
    infer: ({ frame }) =>
      isWithinRectRange({
        rect: frame,
        minWidth: 60,
        minHeight: 30,
        maxWidth: 300,
        maxHeight: 80,
      })
        ? 0.8
        : 0,
    render({ Components, instance, getSymbolMaster }: RenderProps) {
      const Button: React.FC<ButtonProps> = Components[buttonSymbolId];

      const master = getSymbolMaster(instance.symbolID);

      const content =
        instance.blockText ?? master.blockDefinition?.placeholderText;
      const style = parametersToTailwindStyle(instance.blockParameters);
      const parameters = new Set(instance.blockParameters);

      const { variant, size, position } = getMappedParameters(
        parameters,
        schema,
      );

      const disabled = parameters.has('disabled');

      // if (colorScheme === 'dark') {
      //   Object.assign(
      //     style,
      //     disabled ? buttonColors.darkDisabled : buttonColors.dark,
      //   );
      // } else if (colorScheme === 'light') {
      //   Object.assign(
      //     style,
      //     disabled ? buttonColors.lightDisabled : buttonColors.light,
      //   );
      // }

      return (
        <Button
          key={instance.do_objectID}
          {...(disabled && { disabled: true })}
          {...(variant && { variant })}
          {...(size && { size })}
          style={{
            ...style,
            ...(position &&
              position !== 'center' && {
                textAlign: position as 'left' | 'center' | 'right',
                justifyContent: position as 'left' | 'center' | 'right',
              }),
          }}
        >
          {content}
        </Button>
      );
    },
  },
});
