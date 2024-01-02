import { Rect, createBounds } from '@noya-app/noya-geometry';
import { findLast, upperFirst, uuid } from '@noya-app/noya-utils';
import { produce } from 'immer';
import cloneDeep from 'lodash/cloneDeep';
import { Model, NoyaNode } from 'noya-component';
import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import {
  Action,
  CustomReducer,
  Layers,
  ParentLayer,
  Selectors,
  applicationReducer,
  interactionReducer,
} from 'noya-state';
import { FlattenedLayoutItem } from '../../components/PageSetup';
import { enforceSchema } from '../../dseditor/layoutSchema';
import {
  PRIMITIVE_ELEMENT_NAMES,
  primitiveElements,
} from '../../dseditor/primitiveElements';
import { boxSymbolId } from '../symbols/symbolIds';
import {
  CustomLayerData,
  LayoutGenerationSource,
  PreferredImageGenerator,
} from '../types';

type AyonLayerAction =
  | [
      type: 'setLayerDescription',
      layerId: string,
      description: string | undefined,
    ]
  | [
      type: 'setLayerActiveGenerationIndex',
      layerId: string,
      activeGenerationIndex: number | undefined,
    ]
  | [
      type: 'setPreferredImageGenerator',
      layerId: string,
      generator: PreferredImageGenerator,
    ]
  | [
      type: 'setLayerNode',
      layerId: string,
      node: NoyaNode | undefined,
      source: LayoutGenerationSource | 'unset' | 'keep',
    ];

export type AyonAction =
  | AyonLayerAction
  | [
      type: 'mergeIntoStack',
      layerIds: string[],
      orientation: 'horizontal' | 'vertical',
    ]
  | [
      type: 'insertArtboardAndFocus',
      options: {
        layerId?: string;
        name: string;
        relativeTo?: { id: string; position: 'above' | 'below' };
      },
    ]
  | [
      type: 'insertPageComponent',
      options: {
        layerId?: string;
        name: string;
        width: number;
        height: number;
      },
    ]
  | [type: 'setProjectDescription', description: string]
  | [
      type: 'setPageLayout',
      description: string,
      layoutItems: FlattenedLayoutItem[],
    ];

const ayonLayerReducer = (
  layer: Sketch.CustomLayer<CustomLayerData>,
  action: AyonLayerAction,
): Sketch.CustomLayer<CustomLayerData> => {
  switch (action[0]) {
    case 'setLayerNode': {
      const [, , node, source] = action;

      return produce(layer, (draft) => {
        draft.data.node = node ? enforceSchema(node) : undefined;

        if (source === 'unset') {
          delete draft.data.layoutGenerationSource;
        } else if (source === 'keep') {
        } else {
          draft.data.layoutGenerationSource = source;
        }
      });
    }
    case 'setLayerDescription': {
      const [, , description] = action;

      return produce(layer, (draft) => {
        draft.data.description = description;
      });
    }
    case 'setLayerActiveGenerationIndex': {
      const [, , activeGenerationIndex] = action;

      return produce(layer, (draft) => {
        draft.data.activeGenerationIndex = activeGenerationIndex;
      });
    }
    case 'setPreferredImageGenerator': {
      const [, , generator] = action;

      return produce(layer, (draft) => {
        draft.data.preferredImageGenerator = generator;
      });
    }
  }
};

export const ayonReducer: CustomReducer<AyonAction> = (
  state,
  action,
  CanvasKit,
  context,
) => {
  switch (action[0]) {
    case 'setProjectDescription': {
      const [, description] = action;

      return produce(state, (draft) => {
        draft.sketch.meta.noya ||= {};
        draft.sketch.meta.noya.projectDescription = description;
      });
    }
    case 'insertArtboardAndFocus': {
      const [, { layerId = uuid(), name, relativeTo }] = action;

      const size = findLast(
        Selectors.getCurrentPage(state).layers,
        Layers.isArtboard,
      )?.frame ?? {
        width: 1280,
        height: 720,
      };

      const moveAction: Action | undefined = relativeTo
        ? ['moveLayer', layerId, relativeTo.id, relativeTo.position]
        : undefined;

      state = applicationReducer(
        state,
        [
          'batch',
          [
            [
              'insertArtboard',
              { name, id: layerId, width: size.width, height: size.height },
            ],
            ['selectLayer', layerId],
            ['zoomToFit*', { type: 'layer', value: layerId }],
            ...(moveAction ? [moveAction] : []),
          ],
        ],
        CanvasKit,
        context,
      );

      return state;
    }
    case 'mergeIntoStack': {
      const [, layerIds, orientation] = action;

      const page = Selectors.getCurrentPage(state);
      const pageIndex = Selectors.getCurrentPageIndex(state);
      const allLayers = Layers.findAll<Sketch.CustomLayer<CustomLayerData>>(
        page,
        (layer): layer is Sketch.CustomLayer<CustomLayerData> =>
          Layers.isCustomLayer<CustomLayerData>(layer) &&
          layerIds.includes(layer.do_objectID),
      );
      const foundIds = allLayers.map((layer) => layer.do_objectID);
      const allIndexPaths = Layers.findAllIndexPaths<Sketch.AnyLayer>(
        page,
        (layer) => foundIds.includes(layer.do_objectID),
      );

      if (allLayers.length === 0) return state;

      // Find the parent of the first layer
      const firstIndexPath = Layers.findIndexPath(
        page,
        (layer) => layer.do_objectID === allLayers[0].do_objectID,
      );

      if (!firstIndexPath) return state;

      const parentIndexPath = firstIndexPath.slice(0, -1);

      if (!parentIndexPath) return state;

      const boundingRect = Selectors.getBoundingRect(page, layerIds);

      if (!boundingRect) return state;

      // Sort by bounding box
      allLayers.sort((a, b) => {
        const aRect = SketchModel.rect(a.frame);
        const bRect = SketchModel.rect(b.frame);

        return orientation === 'vertical'
          ? aRect.y - bRect.y
          : aRect.x - bRect.x;
      });

      function getElementName(layer: Sketch.CustomLayer<CustomLayerData>) {
        if (!layer.name && !layer.data.description) {
          if (layer.data.node?.type === 'noyaPrimitiveElement') {
            return PRIMITIVE_ELEMENT_NAMES[layer.data.node.componentID];
          } else {
            return '';
          }
        }

        return [layer.name, layer.data.description].filter(Boolean).join(': ');
      }

      const name = `${upperFirst(orientation)} Stack`;
      const description =
        `A ${orientation} stack containing:\n\n` +
        allLayers.map(getElementName).filter(Boolean).join('\n\n');

      const layer = SketchModel.customLayer<CustomLayerData>({
        name,
        frame: SketchModel.rect(boundingRect),
        data: {
          description,
          layoutGenerationSource: { name, description },
          node: Model.primitiveElement({
            componentID: boxSymbolId,
            classNames: Model.classNames([
              'flex-1',
              'flex',
              orientation === 'vertical' ? 'flex-col' : 'flex-row',
            ]),
            children: allLayers.flatMap((layer) =>
              layer.data.node ? [cloneDeep(layer.data.node)] : [],
            ),
          }),
        },
      });

      state = produce(state, (draft) => {
        draft.selectedLayerIds = [layer.do_objectID];
        Selectors.deleteLayers(allIndexPaths, draft.sketch.pages[pageIndex]);
      });

      state = Selectors.insertLayerAtIndexPath(
        state,
        layer,
        parentIndexPath,
        'inside',
      );

      return state;
    }
    case 'setLayerNode':
    case 'setLayerDescription':
    case 'setPreferredImageGenerator':
    case 'setLayerActiveGenerationIndex': {
      const [, id] = action;

      const layerIndexPaths = Selectors.getLayerIndexPath(state, id);

      if (!layerIndexPaths) return state;

      const { pageIndex, indexPath } = layerIndexPaths;

      return produce(state, (draft) => {
        const parentPath = indexPath.slice(0, -1);
        const index = indexPath[indexPath.length - 1];
        const parentLayer = Layers.access(
          draft.sketch.pages[pageIndex],
          parentPath,
        ) as ParentLayer;
        const childLayer = parentLayer.layers[index];

        if (!Layers.isCustomLayer<CustomLayerData>(childLayer)) return;

        parentLayer.layers[index] = ayonLayerReducer(childLayer, action);
      });
    }
    case 'addDrawnLayer': {
      const pageIndex = Selectors.getCurrentPageIndex(state);
      const meta = Selectors.getCurrentPageMetadata(state);

      const minimumSize = 2 / meta.zoomValue;

      return produce(state, (draft) => {
        if (draft.interactionState.type !== 'drawing') return;

        const rect = Selectors.getDrawnLayerRect(
          draft.interactionState.origin,
          draft.interactionState.current,
          draft.interactionState.options,
        );

        if (rect.width > minimumSize && rect.height > minimumSize) {
          const layer = SketchModel.customLayer<CustomLayerData>({
            do_objectID: draft.interactionState.id,
            name: '',
            frame: SketchModel.rect(rect),
            data: {
              description: '',
              node: primitiveElements
                .find((p) => p.id === boxSymbolId)
                ?.initialValue?.(),
            },
          });

          Selectors.addToParentLayer(
            draft.sketch.pages[pageIndex].layers,
            layer,
          );

          draft.selectedLayerIds = [layer.do_objectID];
        }

        draft.interactionState = interactionReducer(draft.interactionState, [
          'reset',
        ]);
      });
    }
    case 'insertPageComponent': {
      const [, { layerId = uuid(), name, width, height }] = action;

      const selectedArtboard = Selectors.getSelectedLayers(state).filter(
        Layers.isArtboard,
      )[0];

      if (!selectedArtboard) return state;

      const artboardIndexPath = Selectors.getLayerIndexPath(
        state,
        selectedArtboard.do_objectID,
      );

      if (!artboardIndexPath) return state;

      const predictedFrame: Rect = {
        x: selectedArtboard.frame.x,
        y: selectedArtboard.frame.y,
        width,
        height,
      };

      // Snap to full width
      predictedFrame.width = selectedArtboard.frame.width;

      // Stack below the last layer in the artboard, if one exists
      if (selectedArtboard.layers.length > 0) {
        const lastLayer =
          selectedArtboard.layers[selectedArtboard.layers.length - 1];
        predictedFrame.y = Math.ceil(createBounds(lastLayer.frame).maxY);
      }

      const layer = SketchModel.customLayer<CustomLayerData>({
        do_objectID: layerId,
        name,
        frame: SketchModel.rect(predictedFrame),
        // No description/node, we want to generate these
        data: {},
      });

      // state = produce(state, (draft) => {
      //   draft.selectedLayerIds = [layer.do_objectID];
      // });

      state = produce(state, (draft) => {
        draft.sketch.pages[artboardIndexPath.pageIndex].layers.push(layer);
      });

      state = applicationReducer(
        state,
        ['moveLayer', layerId, selectedArtboard.do_objectID, 'inside'],
        CanvasKit,
        context,
      );

      return state;
    }
    case 'setPageLayout': {
      const [, description, layoutItems] = action;

      const pageIndex = Selectors.getCurrentPageIndex(state);
      const page = state.sketch.pages[pageIndex];

      const artboard = page.layers.find(Layers.isArtboard);

      if (!artboard) return;

      const artboardIndexPath = Selectors.getLayerIndexPath(
        state,
        artboard.do_objectID,
      );

      if (!artboardIndexPath) return;

      const layers = layoutItems.map((item) => {
        const layer = SketchModel.customLayer<CustomLayerData>({
          name: '',
          frame: SketchModel.rect({
            x: item.rect.x * artboard.frame.width,
            y: item.rect.y * artboard.frame.height,
            width: item.rect.width * artboard.frame.width,
            height: item.rect.height * artboard.frame.height,
          }),
          data: {
            suggestedNames: item.componentNames,
            // description: componentName,
            // node: primitiveElements
            //   .find((p) => p.id === boxSymbolId)
            //   ?.initialValue?.(),
          },
        });

        return layer;
      });

      for (const layer of layers) {
        state = Selectors.insertLayerAtIndexPath(
          state,
          layer,
          artboardIndexPath.indexPath,
          'inside',
        );
      }

      state = produce(state, (draft) => {
        const artboard = Layers.access(
          draft.sketch.pages[artboardIndexPath.pageIndex],
          artboardIndexPath.indexPath,
        );
        artboard.name = description;

        draft.selectedLayerIds = [];
      });

      return state;
    }
  }
};
