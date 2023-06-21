import { ButtonProps, ButtonVariant } from '@noya-design-system/protocol';
import { BlockDefinition } from 'noya-state';
import { parseBlock } from '../parse';
import { applyCommonProps } from './applyCommonProps';
import { buttonColors } from './blockTheme';
import { isWithinRectRange } from './score';
import { buttonSymbolId } from './symbolIds';
import { buttonSymbol } from './symbols';
import { parametersToTailwindStyle } from './tailwind';

const placeholderText = 'Submit';
const colorSchemeKeys = ['dark', 'light'];
const sizeKeys = ['small', 'medium', 'large'];
const positionKeys = ['left', 'center', 'right'];
const variantKeys: ButtonVariant[] = ['outline', 'solid', 'text'];

const globalHashtags = [
  ...variantKeys,
  ...sizeKeys,
  ...colorSchemeKeys,
  ...positionKeys,
  'disabled',
];

const parser = 'regular';

export const ButtonBlock: BlockDefinition = {
  symbol: buttonSymbol,
  parser,
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
    const { content, parameters } = parseBlock(props.blockText, parser, {
      placeholder: placeholderText,
      mutuallyExclusiveParameters: {
        colorScheme: colorSchemeKeys,
        size: sizeKeys,
        variant: variantKeys,
        position: positionKeys,
      },
    });

    const style = parametersToTailwindStyle(parameters);

    if (parameters.colorScheme === 'dark') {
      Object.assign(
        style,
        parameters.disabled ? buttonColors.darkDisabled : buttonColors.dark,
      );
    } else if (parameters.colorScheme === 'light') {
      Object.assign(
        style,
        parameters.disabled ? buttonColors.lightDisabled : buttonColors.light,
      );
    }

    // if (props.frame && size === undefined) {
    //   if (props.frame.height < 30) {
    //     size = 'xs' as const;
    //   } else if (props.frame.height > 50) {
    //     size = 'lg' as const;
    //   } else {
    //     size = 'md' as const;
    //   }
    // }

    return h<ButtonProps>(
      Button,
      {
        ...applyCommonProps(props),
        ...(parameters.disabled && { disabled: true }),
        ...(parameters.variant && {
          variant: parameters.variant as ButtonProps['variant'],
        }),
        ...(parameters.size && {
          size: parameters.size as ButtonProps['size'],
        }),
        style: {
          ...style,
          ...(parameters.position &&
            parameters.position !== 'center' && {
              textAlign: parameters.position as 'left' | 'center' | 'right',
              justifyContent: parameters.position as
                | 'left'
                | 'center'
                | 'right',
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
