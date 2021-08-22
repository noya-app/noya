import Sketch from 'noya-file-format';
import produce from 'immer';
import { SimpleTextDecoration } from 'noya-state';
import { uuid } from 'noya-utils';
import * as Layers from '../layers';
import {
  getCurrentTab,
  getCurrentPageIndex,
  getSelectedLayerIndexPaths,
  findPageLayerIndexPaths,
} from '../selectors/selectors';
import { accessPageLayers, ApplicationState } from './applicationReducer';
import {
  StringAttributeAction,
  stringAttributeReducer,
} from './stringAttributeReducer';

export type TextStyleAction =
  | StringAttributeAction
  | [type: 'setTextAlignment', value: number]
  | [type: 'setTextDecoration', value: SimpleTextDecoration]
  | [type: 'setTextTransform', value: number];

export function textStyleReducer(
  state: ApplicationState,
  action: TextStyleAction,
): ApplicationState {
  switch (action[0]) {
    case 'setTextFontName':
    case 'setTextFontSize':
    case 'setTextColor':
    case 'setTextLineSpacing':
    case 'setTextLetterSpacing':
    case 'setTextParagraphSpacing':
    case 'setTextHorizontalAlignment':
    case 'setTextVerticalAlignment': {
      if (getCurrentTab(state) === 'canvas') {
        const pageIndex = getCurrentPageIndex(state);
        const layerIndexPaths = getSelectedLayerIndexPaths(state);

        return produce(state, (draft) => {
          accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (!Layers.isTextLayer(layer) || !Layers.hasTextStyle(layer))
                return;

              switch (action[0]) {
                case 'setTextVerticalAlignment': {
                  layer.style.textStyle.verticalAlignment = action[1];
                  break;
                }
              }

              layer.style.textStyle.encodedAttributes = stringAttributeReducer(
                layer.style.textStyle.encodedAttributes,
                action,
              );

              layer.attributedString.attributes.forEach((attribute) => {
                attribute.attributes = stringAttributeReducer(
                  attribute.attributes,
                  action,
                );
              });
            },
          );
        });
      } else {
        const ids = state.selectedThemeTab.textStyles.ids;

        const layerIndexPathsWithSharedStyle = findPageLayerIndexPaths(
          state,
          (layer) =>
            layer.sharedStyleID !== undefined &&
            ids.includes(layer.sharedStyleID),
        );

        return produce(state, (draft) => {
          const layerTextStyles =
            draft.sketch.document.layerTextStyles?.objects ?? [];

          layerTextStyles.forEach((sharedTextStyle: Sketch.SharedStyle) => {
            if (
              !ids.includes(sharedTextStyle.do_objectID) ||
              sharedTextStyle.value.textStyle === undefined
            )
              return;

            sharedTextStyle.value.textStyle.encodedAttributes =
              stringAttributeReducer(
                sharedTextStyle.value.textStyle.encodedAttributes,
                action,
              );

            layerIndexPathsWithSharedStyle.forEach((layerPath) =>
              accessPageLayers(
                draft,
                layerPath.pageIndex,
                layerPath.indexPaths,
              ).forEach((layer) => {
                layer.style = produce(
                  sharedTextStyle.value,
                  (sharedTextStyle) => {
                    sharedTextStyle.do_objectID = uuid();
                    return sharedTextStyle;
                  },
                );
              }),
            );
          });
        });
      }
    }
    case 'setTextAlignment': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          if (!Layers.isTextLayer(layer) || !Layers.hasTextStyle(layer)) return;

          layer.textBehaviour = action[1];
        });
      });
    }
    case 'setTextDecoration':
      if (getCurrentTab(state) === 'canvas') {
        const pageIndex = getCurrentPageIndex(state);
        const layerIndexPaths = getSelectedLayerIndexPaths(state);

        return produce(state, (draft) => {
          accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (!Layers.isTextLayer(layer) || !Layers.hasTextStyle(layer))
                return;

              const attributes = layer.style.textStyle.encodedAttributes;

              attributes.underlineStyle = action[1] === 'underline' ? 1 : 0;
              attributes.strikethroughStyle =
                action[1] === 'strikethrough' ? 1 : 0;
            },
          );
        });
      } else {
        return produce(state, (draft) => {
          const ids = state.selectedThemeTab.textStyles.ids;

          const layerTextStyles =
            draft.sketch.document.layerTextStyles?.objects ?? [];

          layerTextStyles.forEach((sharedTextStyle: Sketch.SharedStyle) => {
            if (
              !ids.includes(sharedTextStyle.do_objectID) ||
              sharedTextStyle.value.textStyle === undefined
            )
              return;

            const attributes =
              sharedTextStyle.value.textStyle.encodedAttributes;

            attributes.underlineStyle = action[1] === 'underline' ? 1 : 0;
            attributes.strikethroughStyle =
              action[1] === 'strikethrough' ? 1 : 0;
          });
        });
      }
    case 'setTextTransform': {
      if (getCurrentTab(state) === 'canvas') {
        const pageIndex = getCurrentPageIndex(state);
        const layerIndexPaths = getSelectedLayerIndexPaths(state);

        return produce(state, (draft) => {
          accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (!Layers.isTextLayer(layer) || !Layers.hasTextStyle(layer))
                return;

              const attributes = layer.style.textStyle.encodedAttributes;

              attributes.MSAttributedStringTextTransformAttribute = action[1];
            },
          );
        });
      } else {
        return produce(state, (draft) => {
          const ids = state.selectedThemeTab.textStyles.ids;

          const layerTextStyles =
            draft.sketch.document.layerTextStyles?.objects ?? [];

          layerTextStyles.forEach((sharedTextStyle: Sketch.SharedStyle) => {
            if (
              !ids.includes(sharedTextStyle.do_objectID) ||
              sharedTextStyle.value.textStyle === undefined
            )
              return;

            const attributes =
              sharedTextStyle.value.textStyle.encodedAttributes;

            attributes.MSAttributedStringTextTransformAttribute = action[1];
          });
        });
      }
    }
    default:
      return state;
  }
}
