import produce from 'immer';

import Sketch from 'noya-file-format';
import { ExportOptions } from '../index';

// export type ExportAction =
//   | [type: 'moveExportFormat', sourceIndex: number, destinationIndex: number]
//   | [type: 'setExportScale', index: number, value: ExportOptions.ExportSize]
//   | [type: 'setExportName', index: number, value: string]
//   | [type: 'setExportFileFormat', index: number, value: Sketch.ExportFileFormat]
//   | [
//       type: 'setExportNamingScheme',
//       index: number,
//       value: Sketch.ExportFormatNamingScheme,
//     ]
//   | [type: 'addExportFormat']
//   | [type: 'deleteExportFormat', index: number];

// export function exportReducer(
//   state: Sketch.ExportOptions,
//   action: ExportAction,
//   frame: Sketch.Rect,
// ): Sketch.ExportOptions {
//   switch (action[0]) {
//     case 'moveExportFormat': {
//       const [, sourceIndex, destinationIndex] = action;

//       return produce(state, (draft) => {
//         const sourceItem = draft.exportFormats[sourceIndex];

//         draft.exportFormats.splice(sourceIndex, 1);
//         draft.exportFormats.splice(destinationIndex, 0, sourceItem);
//       });
//     }
//     case 'setExportScale': {
//       const [, index, value] = action;

//       return produce(state, (draft) => {
//         const { size, visibleScaleType } = value;

//         draft.exportFormats[index].scale =
//           visibleScaleType === Sketch.VisibleScaleType.Scale
//             ? size
//             : size /
//               (visibleScaleType === Sketch.VisibleScaleType.Width
//                 ? frame.width
//                 : frame.height);

//         draft.exportFormats[index].absoluteSize =
//           visibleScaleType === Sketch.VisibleScaleType.Scale ? 0 : size;
//         draft.exportFormats[index].visibleScaleType = visibleScaleType;
//       });
//     }
//     case 'addExportFormat': {
//       return produce(state, (draft) => {
//         draft.exportFormats.push({
//           _class: 'exportFormat',
//           name: '',
//           absoluteSize: 0,
//           fileFormat: Sketch.ExportFileFormat.PNG,
//           visibleScaleType: Sketch.VisibleScaleType.Scale,
//           scale: 1,
//         });
//       });
//     }
//     case 'deleteExportFormat': {
//       const [, index] = action;

//       return produce(state, (draft) => {
//         draft.exportFormats.splice(index, 1);
//       });
//     }
//     case 'setExportName': {
//       const [, index, value] = action;

//       return produce(state, (draft) => {
//         draft.exportFormats[index].name = value;
//       });
//     }
//     case 'setExportFileFormat': {
//       const [, index, value] = action;

//       return produce(state, (draft) => {
//         draft.exportFormats[index].fileFormat = value;
//       });
//     }
//     case 'setExportNamingScheme': {
//       const [, index, value] = action;

//       return produce(state, (draft) => {
//         draft.exportFormats[index].namingScheme = value;
//       });
//     }
//     default:
//       return state;
//   }
// }
