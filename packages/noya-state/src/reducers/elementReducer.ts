import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import { Selectors } from 'noya-state';
import {
  ElementAttributes,
  Element,
  printSourceFile,
  getComponentLayer,
} from 'noya-typescript';
import { Insets, Point } from 'noya-geometry';
import * as Layers from '../layers';
import {
  createObjectId,
  getCurrentPage,
  getCurrentPageIndex,
  getElementLayerForComponentLayer,
  getSourceFileForId,
} from '../selectors/selectors';
import {
  ApplicationReducerContext,
  ApplicationState,
} from './applicationReducer';
import { InsertableElementType } from './interactionReducer';
import { SourceFile } from 'typescript';

export type ElementFlexDirection = 'row' | 'column';
export type ElementAction =
  | [
      type: 'insertElement',
      layerId: string,
      elementType: InsertableElementType,
      point: Point,
    ]
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

function getPropertyForActionType(
  type: Exclude<ElementAction[0], 'insertElement'>,
): string {
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
    case 'insertElement':
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

        if (!Layers.isComponentContainer(draftLayer)) return;

        let result: SourceFile;

        switch (action[0]) {
          case 'insertElement': {
            const sourceFile = getSourceFileForId(
              context.typescriptEnvironment,
              objectPath.layerId,
            );

            if (!sourceFile) return;

            const componentLayer = getComponentLayer(sourceFile);

            if (!componentLayer) return;

            const elementLayer = objectPath.indexPath
              ? getElementLayerForComponentLayer(
                  componentLayer,
                  objectPath.indexPath,
                )
              : componentLayer.element;

            if (!elementLayer) return;

            result = Element.addChild(
              sourceFile,
              elementLayer.indexPath,
              'View',
            );

            const resultComponentLayer = getComponentLayer(result);

            // Update selection
            if (resultComponentLayer) {
              const resultElement = getElementLayerForComponentLayer(
                resultComponentLayer,
                elementLayer.indexPath,
              );

              if (resultElement && resultElement.children.length > 0) {
                draft.selectedLayerIds = [
                  createObjectId(
                    objectPath.layerId,
                    resultElement.children[resultElement.children.length - 1]
                      .indexPath,
                  ),
                ];
              }
            }

            break;
          }
          default: {
            const editable = Selectors.getEditableElementLayer(
              context.typescriptEnvironment,
              objectPath,
            );

            if (!editable) return;

            const { sourceFile, elementLayer } = editable;

            result = ElementAttributes.setAttribute(
              sourceFile,
              elementLayer.indexPath,
              getPropertyForActionType(action[0]),
              value,
            );
          }
        }

        draftLayer.component.source = printSourceFile(result);
      });
    }
    default:
      return state;
  }
}
