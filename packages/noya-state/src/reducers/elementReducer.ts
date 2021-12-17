import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import { Selectors } from 'noya-state';
import { ElementAttributes, printSourceFile } from 'noya-typescript';
import { Insets } from 'noya-geometry';
import * as Layers from '../layers';
import { getCurrentPage, getCurrentPageIndex } from '../selectors/selectors';
import {
  ApplicationReducerContext,
  ApplicationState,
} from './applicationReducer';

export type ElementFlexDirection = 'row' | 'column';
export type ElementAction =
  | [
      type: 'setElementFlexDirection',
      layerId: string,
      value: ElementFlexDirection,
    ]
  | [type: 'setElementFlexBasis', layerId: string, value: string]
  | [type: 'setElementFlexGrow', layerId: string, value: string]
  | [type: 'setElementFlexShrink', layerId: string, value: string]
  | [
      type: `setElementPadding${Capitalize<keyof Insets>}`,
      layerId: string,
      value: string,
    ];

function getPropertyForActionType(type: ElementAction[0]): string {
  switch (type) {
    case 'setElementFlexDirection':
      return 'flexDirection';
    case 'setElementFlexBasis':
      return 'flexBasis';
    case 'setElementFlexGrow':
      return 'flexGrow';
    case 'setElementFlexShrink':
      return 'flexShrink';
    case 'setElementPaddingTop':
      return 'paddingTop';
    case 'setElementPaddingRight':
      return 'paddingRight';
    case 'setElementPaddingBottom':
      return 'paddingBottom';
    case 'setElementPaddingLeft':
      return 'paddingLeft';
  }
}

export function elementReducer(
  state: ApplicationState,
  action: ElementAction,
  CanvasKit: CanvasKit,
  context: ApplicationReducerContext,
): ApplicationState {
  switch (action[0]) {
    case 'setElementFlexDirection':
    case 'setElementFlexBasis':
    case 'setElementFlexGrow':
    case 'setElementFlexShrink':
    case 'setElementPaddingTop':
    case 'setElementPaddingRight':
    case 'setElementPaddingBottom':
    case 'setElementPaddingLeft': {
      const [, layerOrElementId, value] = action;

      const objectPath = Selectors.parseObjectId(layerOrElementId);
      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        page,
        (layer) => layer.do_objectID === objectPath.layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
        const draftLayer = Layers.access(
          draft.sketch.pages[pageIndex],
          indexPath,
        );

        if (!objectPath.indexPath || !Layers.isComponentContainer(draftLayer))
          return;

        const editable = Selectors.getEditableElementLayer(
          context.typescriptEnvironment,
          objectPath,
        );

        if (!editable) return;

        const { sourceFile, elementLayer } = editable;

        const result = ElementAttributes.setAttribute(
          sourceFile,
          elementLayer.indexPath,
          getPropertyForActionType(action[0]),
          value,
        );

        draftLayer.component.source = printSourceFile(result);
      });
    }
    default:
      return state;
  }
}
