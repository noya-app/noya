import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import { Selectors } from 'noya-state';
import { ElementAttributes, printSourceFile } from 'noya-typescript';
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
    ];

export function elementReducer(
  state: ApplicationState,
  action: ElementAction,
  CanvasKit: CanvasKit,
  context: ApplicationReducerContext,
): ApplicationState {
  switch (action[0]) {
    case 'setElementFlexDirection': {
      const [, layerOrElementId, flexDirection] = action;

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
          'flexDirection',
          flexDirection,
        );

        draftLayer.component.source = printSourceFile(result);
      });
    }
    default:
      return state;
  }
}
