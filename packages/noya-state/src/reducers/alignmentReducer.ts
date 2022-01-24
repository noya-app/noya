import produce from 'immer';
import { IndexPath } from 'tree-visit';

import Sketch from 'noya-file-format';
import { Bounds, createBounds, transformRect } from 'noya-geometry';
import { sum } from 'noya-utils';
import * as Layers from '../layers';
// import {
//   getCurrentPage,
//   getCurrentPageIndex,
//   getLayerTransformAtIndexPath,
//   getSelectedLayerIndexPaths,
//   getSelectedRect,
// } from '../selectors/selectors';
import { accessPageLayers, ApplicationState } from './applicationReducer';

export type AlignmentAction =
  | [type: 'distributeLayers', placement: 'horizontal' | 'vertical']
  | [
      type: 'alignLayers',
      placement:
        | 'left'
        | 'centerHorizontal'
        | 'right'
        | 'top'
        | 'centerVertical'
        | 'bottom',
    ];

// export function alignmentReducer(
//   state: ApplicationState,
//   action: AlignmentAction,
// ): ApplicationState {
//   switch (action[0]) {
//     case 'distributeLayers': {
//       const page = getCurrentPage(state);
//       const pageIndex = getCurrentPageIndex(state);
//       const layerIndexPaths = getSelectedLayerIndexPaths(state);
//       const selectedRect = getSelectedRect(state);
//       const [, axis] = action;

//       return produce(state, (draft) => {
//         const layers = accessPageLayers(draft, pageIndex, layerIndexPaths);
//         const combinedWidths = sum(layers.map((layer) => layer.frame.width));
//         const combinedHeights = sum(layers.map((layer) => layer.frame.height));
//         const differenceWidth = selectedRect.width - combinedWidths;
//         const differenceHeight = selectedRect.height - combinedHeights;
//         const gapX = differenceWidth / (layers.length - 1);
//         const gapY = differenceHeight / (layers.length - 1);
//         const sortBy = axis === 'horizontal' ? 'midX' : 'midY';

//         // Bounds are all transformed to the page's coordinate system
//         function getNormalizedBounds(
//           page: Sketch.Page,
//           layerIndexPath: IndexPath,
//         ): Bounds {
//           const layer = Layers.access(page, layerIndexPath);
//           const transform = getLayerTransformAtIndexPath(page, layerIndexPath);
//           return createBounds(transformRect(layer.frame, transform));
//         }

//         const sortedLayerIndexPaths = layerIndexPaths.sort(
//           (a, b) =>
//             getNormalizedBounds(page, a)[sortBy] -
//             getNormalizedBounds(page, b)[sortBy],
//         );

//         let currentX = 0;
//         let currentY = 0;

//         sortedLayerIndexPaths.forEach((layerIndexPath) => {
//           const transform = getLayerTransformAtIndexPath(
//             page,
//             layerIndexPath,
//           ).invert();
//           const layer = Layers.access(
//             draft.sketch.pages[pageIndex], // access page again since we need to write to it
//             layerIndexPath,
//           );

//           switch (axis) {
//             case 'horizontal': {
//               const newOrigin = transform.applyTo({
//                 x: selectedRect.x + currentX,
//                 y: 0,
//               });
//               currentX += layer.frame.width + gapX;
//               layer.frame.x = newOrigin.x;
//               break;
//             }
//             case 'vertical': {
//               const newOrigin = transform.applyTo({
//                 x: 0,
//                 y: selectedRect.y + currentY,
//               });
//               currentY += layer.frame.height + gapY;
//               layer.frame.y = newOrigin.y;
//               break;
//             }
//           }
//         });
//       });
//     }
//     case 'alignLayers': {
//       const page = getCurrentPage(state);
//       const pageIndex = getCurrentPageIndex(state);
//       const layerIndexPaths = getSelectedLayerIndexPaths(state);
//       const selectedRect = getSelectedRect(state);
//       const [, placement] = action;

//       return produce(state, (draft) => {
//         const selectedBounds = createBounds(selectedRect);
//         const midX = selectedRect.x + selectedRect.width / 2;
//         const midY = selectedRect.y + selectedRect.height / 2;

//         layerIndexPaths.forEach((layerIndexPath) => {
//           const transform = getLayerTransformAtIndexPath(
//             page,
//             layerIndexPath,
//           ).invert();
//           const layer = Layers.access(
//             draft.sketch.pages[pageIndex], // access page again since we need to write to it
//             layerIndexPath,
//           );

//           switch (placement) {
//             case 'left': {
//               const newOrigin = transform.applyTo({
//                 x: selectedBounds.minX,
//                 y: 0,
//               });
//               layer.frame.x = newOrigin.x;
//               break;
//             }
//             case 'centerHorizontal': {
//               const newOrigin = transform.applyTo({
//                 x: midX - layer.frame.width / 2,
//                 y: 0,
//               });
//               layer.frame.x = newOrigin.x;
//               break;
//             }
//             case 'right': {
//               const newOrigin = transform.applyTo({
//                 x: selectedBounds.maxX - layer.frame.width,
//                 y: 0,
//               });
//               layer.frame.x = newOrigin.x;
//               break;
//             }
//             case 'top': {
//               const newOrigin = transform.applyTo({
//                 x: 0,
//                 y: selectedBounds.minY,
//               });
//               layer.frame.y = newOrigin.y;
//               break;
//             }
//             case 'centerVertical': {
//               const newOrigin = transform.applyTo({
//                 x: 0,
//                 y: midY - layer.frame.height / 2,
//               });
//               layer.frame.y = newOrigin.y;
//               break;
//             }
//             case 'bottom': {
//               const newOrigin = transform.applyTo({
//                 x: 0,
//                 y: selectedBounds.maxY - layer.frame.height,
//               });
//               layer.frame.y = newOrigin.y;
//               break;
//             }
//           }
//         });
//       });
//     }
//     default:
//       return state;
//   }
// }
