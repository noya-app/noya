import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';

export type TextStyleAction =
  | [type: 'setTextColor', value: Sketch.Color]
  | [type: 'setTextFontName', value: string]
  | [type: 'setTextFontSize', value: number]
  | [type: 'setTextLetterSpacing', value: number]
  | [type: 'setTextLineSpacing', value: number]
  | [type: 'setTextParagraphSpacing', value: number]
  | [type: 'setTextAlignment', value: number]
  | [type: 'setTextHorizontalAlignment', value: number]
  | [type: 'setTextVerticalAlignment', value: number]
  | [type: 'setTextDecoration', value: number]
  | [type: 'setTextCase', value: number];

export function textStyleReducer(
  state: Sketch.TextStyle | Sketch.StringAttribute,
  action: TextStyleAction,
): Sketch.TextStyle | Sketch.StringAttribute {
  switch (action[0]) {
    case 'setTextColor': {
      const [, color] = action;

      return produce(state, (draft) => {
        const attributes =
          draft._class === 'stringAttribute'
            ? draft.attributes
            : draft.encodedAttributes;

        if (!attributes) return;

        attributes.MSAttributedStringColorAttribute = color;
      });
    }
    case 'setTextFontName': {
      const [, value] = action;

      return produce(state, (draft) => {
        const attributes =
          draft._class === 'stringAttribute'
            ? draft.attributes.MSAttributedStringFontAttribute.attributes
            : draft.encodedAttributes.MSAttributedStringFontAttribute
                .attributes;

        if (!attributes) return;

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
        const attributes =
          draft._class === 'stringAttribute'
            ? draft.attributes.MSAttributedStringFontAttribute.attributes
            : draft.encodedAttributes.MSAttributedStringFontAttribute
                .attributes;

        if (!attributes) return;

        attributes.size = value;
      });
    }
    case 'setTextLetterSpacing': {
      const [, value] = action;

      return produce(state, (draft) => {
        const attributes =
          draft._class === 'stringAttribute'
            ? draft.attributes
            : draft.encodedAttributes;

        if (!attributes) return;

        attributes.kerning = value;
      });
    }
    case 'setTextLineSpacing': {
      const [, value] = action;

      return produce(state, (draft) => {
        const attributes =
          draft._class === 'stringAttribute'
            ? draft.attributes
            : draft.encodedAttributes;

        if (!attributes) return;

        const paragraphStyle =
          attributes.paragraphStyle ||
          ({
            _class: 'paragraphStyle',
            alignment: 0,
          } as Sketch.ParagraphStyle);
        paragraphStyle.maximumLineHeight = value;
        paragraphStyle.maximumLineHeight = value;

        attributes.paragraphStyle = paragraphStyle;
      });
    }
    case 'setTextParagraphSpacing': {
      const [, value] = action;

      return produce(state, (draft) => {
        const attributes =
          draft._class === 'stringAttribute'
            ? draft.attributes
            : draft.encodedAttributes;

        if (!attributes) return;

        const paragraphStyle =
          attributes.paragraphStyle ||
          ({
            _class: 'paragraphStyle',
            alignment: 0,
          } as Sketch.ParagraphStyle);

        paragraphStyle.paragraphSpacing = value;
        paragraphStyle.paragraphSpacing = value;

        attributes.paragraphStyle = paragraphStyle;
      });
    }
    case 'setTextHorizontalAlignment': {
      const [, value] = action;

      return produce(state, (draft) => {
        const attributes =
          draft._class === 'stringAttribute'
            ? draft.attributes
            : draft.encodedAttributes;

        if (!attributes) return;

        const paragraphStyle =
          attributes.paragraphStyle ||
          ({
            _class: 'paragraphStyle',
            alignment: 0,
          } as Sketch.ParagraphStyle);

        paragraphStyle.alignment = value;
        attributes.paragraphStyle = paragraphStyle;
      });
    }
    case 'setTextVerticalAlignment': {
      const [, value] = action;

      return produce(state, (draft) => {
        const attributes =
          draft._class === 'stringAttribute'
            ? draft.attributes
            : draft.encodedAttributes;

        if (!attributes) return;
        attributes.textStyleVerticalAlignmentKey = value;

        if (draft._class !== 'stringAttribute') draft.verticalAlignment = value;
      });
    }
    case 'setTextDecoration': {
      const [, value] = action;

      return produce(state, (draft) => {
        if (draft._class === 'stringAttribute') return;

        const attributes = draft.encodedAttributes;

        if (!attributes) return;

        switch (value) {
          case 1: {
            attributes.underlineStyle = 1;
            attributes.strikethroughStyle = 0;
            break;
          }
          case 2: {
            attributes.underlineStyle = 0;
            attributes.strikethroughStyle = 1;
            break;
          }
          default: {
            attributes.underlineStyle = 0;
            attributes.strikethroughStyle = 0;
          }
        }
      });
    }
    case 'setTextCase': {
      const [, value] = action;

      return produce(state, (draft) => {
        if (draft._class === 'stringAttribute') return;

        const encoded = draft.encodedAttributes;
        if (!encoded) return;
        encoded.MSAttributedStringTextTransformAttribute = value;
      });
    }
    default:
      return state;
  }
}
