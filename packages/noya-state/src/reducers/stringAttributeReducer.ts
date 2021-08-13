import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { decodeFontName, encodeFontName } from 'noya-fonts';
import { SetNumberMode } from './styleReducer';

export type StringAttributeAction =
  | [type: 'setTextColor', value: Sketch.Color]
  | [type: 'setTextFontName', value: string]
  | [type: 'setTextFontVariant', value?: string]
  | [type: 'setTextFontSize', value: number, mode: SetNumberMode]
  | [type: 'setTextLetterSpacing', value: number, mode: SetNumberMode]
  | [type: 'setTextLineSpacing', value: number, mode: SetNumberMode]
  | [type: 'setTextParagraphSpacing', value: number, mode: SetNumberMode]
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

        const { fontVariant: variant } = decodeFontName(attributes.name);

        attributes.name = encodeFontName(value, variant);
      });
    }
    case 'setTextFontVariant': {
      const [, value] = action;

      return produce(state, (draft) => {
        const attributes = draft.MSAttributedStringFontAttribute.attributes;

        const { fontFamily } = decodeFontName(attributes.name);

        attributes.name = encodeFontName(fontFamily, value);
      });
    }
    case 'setTextFontSize': {
      const [, value, mode] = action;

      return produce(state, (draft) => {
        const newValue =
          mode === 'replace'
            ? value
            : value + draft.MSAttributedStringFontAttribute.attributes.size;

        draft.MSAttributedStringFontAttribute.attributes.size = Math.max(
          newValue,
          1,
        );
      });
    }
    case 'setTextLetterSpacing': {
      const [, value, mode] = action;

      return produce(state, (draft) => {
        const newValue =
          mode === 'replace' ? value : value + (draft.kerning ?? 0);

        draft.kerning = newValue;
      });
    }
    case 'setTextLineSpacing': {
      const [, value, mode] = action;

      return produce(state, (draft) => {
        draft.paragraphStyle = draft.paragraphStyle ?? {
          _class: 'paragraphStyle',
          alignment: 0,
        };

        const newValue =
          mode === 'replace'
            ? value
            : value + (draft.paragraphStyle.maximumLineHeight ?? 0);

        draft.paragraphStyle.minimumLineHeight = newValue;
        draft.paragraphStyle.maximumLineHeight = newValue;
      });
    }
    case 'setTextParagraphSpacing': {
      const [, value, mode] = action;

      return produce(state, (draft) => {
        draft.paragraphStyle = draft.paragraphStyle ?? {
          _class: 'paragraphStyle',
          alignment: 0,
        };

        const newValue =
          mode === 'replace'
            ? value
            : value + (draft.paragraphStyle.paragraphSpacing ?? 0);

        draft.paragraphStyle.paragraphSpacing = newValue;
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
