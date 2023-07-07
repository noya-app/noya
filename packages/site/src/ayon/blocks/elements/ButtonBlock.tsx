import {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { isWithinRectRange } from '../../infer/score';
import { parametersToTailwindStyle } from '../../tailwind/tailwind';
import { getMappedParameters } from '../../utils/getMappedParameters';
import { applyCommonProps } from '../applyCommonProps';
import { buttonColors } from '../blockTheme';
import { buttonSymbolId } from '../symbolIds';
import { buttonSymbol } from '../symbols';

const placeholderText = 'Submit';
const colorSchemeKeys = ['dark', 'light'];
const sizeKeys: ButtonSize[] = ['small', 'medium', 'large'];
const positionKeys = ['left', 'center', 'right'];
const variantKeys: ButtonVariant[] = ['outline', 'solid', 'text'];

const globalHashtags = [
  ...variantKeys,
  ...sizeKeys,
  ...colorSchemeKeys,
  ...positionKeys,
  'disabled',
];

export const ButtonBlock: BlockDefinition = {
  symbol: buttonSymbol,
  hashtags: globalHashtags,
  placeholderText,
  infer: ({ frame, blockText }) =>
    isWithinRectRange({
      rect: frame,
      minWidth: 60,
      minHeight: 30,
      maxWidth: 300,
      maxHeight: 80,
    })
      ? 0.8
      : 0,
  render: ({ h, Components: { [buttonSymbolId]: Button } }, props) => {
    const content = props.blockText ?? placeholderText;
    const style = parametersToTailwindStyle(props.blockParameters);
    const parameters = new Set(props.blockParameters);

    const { variant, size, position, colorScheme } = getMappedParameters(
      parameters,
      {
        variant: variantKeys,
        size: sizeKeys,
        position: positionKeys,
        colorScheme: colorSchemeKeys,
      },
    );
    const disabled = parameters.has('disabled');

    if (colorScheme === 'dark') {
      Object.assign(
        style,
        disabled ? buttonColors.darkDisabled : buttonColors.dark,
      );
    } else if (colorScheme === 'light') {
      Object.assign(
        style,
        disabled ? buttonColors.lightDisabled : buttonColors.light,
      );
    }

    return h<ButtonProps>(
      Button,
      {
        ...applyCommonProps(props),
        ...(disabled && { disabled: true }),
        ...(variant && { variant }),
        ...(size && { size }),
        style: {
          ...style,
          ...(position &&
            position !== 'center' && {
              textAlign: position as 'left' | 'center' | 'right',
              justifyContent: position as 'left' | 'center' | 'right',
            }),
          ...(props.frame && {
            width: `${props.frame.width}px`,
          }),
        },
      },
      content,
    );
  },
};
