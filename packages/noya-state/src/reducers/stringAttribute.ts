import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';

export type StringAttributeAction =
  | [type: 'setTextColor', value: Sketch.Color]
  | [type: 'setTextFontName', value: string]
  | [type: 'setTextFontSize', value: number]
  | [type: 'setTextLetterSpacing', value: number]
  | [type: 'setTextLineSpacing', value: number]
  | [type: 'setTextParagraphSpacing', value: number]
  | [type: 'setTextHorizontalAlignment', value: number]
  | [type: 'setTextVerticalAlignment', value: number];

type CommonStringAttributes =
  | Sketch.StringAttribute['attributes']
  | Sketch.TextStyle['encodedAttributes'];

export function stringAttributeReducer<T extends CommonStringAttributes>(
  state: T,
  action: StringAttributeAction,
): T {
  switch (action[0]) {
    case 'setTextColor': {
      const [, color] = action;

      return produce(state, (draft) => {
        draft.MSAttributedStringColorAttribute = color;
      });
    }
    case 'setTextFontName': {
      const [, value] = action;

      return produce(state, (draft) => {
        const attributes = draft.MSAttributedStringFontAttribute.attributes;

        // This logic is temporary and will be replaced when we handle fonts
        const split = attributes.name.split('-');
        const face = split[1] ? '-' + split[1] : '';

        attributes.name = value.startsWith('-')
          ? split[0] + value
          : value + face;
      });
    }
    case 'setTextFontSize': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.MSAttributedStringFontAttribute.attributes.size = value;
      });
    }
    case 'setTextLetterSpacing': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.kerning = value;
      });
    }
    case 'setTextLineSpacing': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.paragraphStyle = draft.paragraphStyle ?? {
          _class: 'paragraphStyle',
          alignment: 0,
        };

        draft.paragraphStyle.maximumLineHeight = value;
        draft.paragraphStyle.maximumLineHeight = value;
      });
    }
    case 'setTextParagraphSpacing': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.paragraphStyle = draft.paragraphStyle ?? {
          _class: 'paragraphStyle',
          alignment: 0,
        };

        draft.paragraphStyle.paragraphSpacing = value;
      });
    }
    case 'setTextHorizontalAlignment': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.paragraphStyle = draft.paragraphStyle ?? {
          _class: 'paragraphStyle',
          alignment: 0,
        };

        draft.paragraphStyle.alignment = value;
      });
    }
    case 'setTextVerticalAlignment': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.textStyleVerticalAlignmentKey = value;
      });
    }
    default:
      return state;
  }
}
