import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { ExportOptions } from '../index';

export type ExportAction =
  | [type: 'setExportScale', index: number, value: string, frame: Sketch.Rect]
  | [type: 'setExportName', index: number, value: string]
  | [type: 'setExportFileFormat', index: number, value: Sketch.ExportFileFormat]
  | [
      type: 'setExportNamingScheme',
      index: number,
      value: Sketch.ExportFormatNamingScheme,
    ]
  | [type: 'addExportFormat']
  | [type: 'deleteExportFormat', index: number];

export function exportReducer(
  state: Sketch.ExportOptions,
  action: ExportAction,
): Sketch.ExportOptions {
  switch (action[0]) {
    case 'setExportScale': {
      const [, index, value, frame] = action;

      return produce(state, (draft) => {
        const values = ExportOptions.parseScale(value, frame);
        if (!values) return;

        const { scale, absoluteSize, visibleScaleType } = values;

        draft.exportFormats[index].scale = scale;
        draft.exportFormats[index].absoluteSize = absoluteSize;
        draft.exportFormats[index].visibleScaleType = visibleScaleType;
      });
    }
    case 'addExportFormat': {
      return produce(state, (draft) => {
        draft.exportFormats.push({
          _class: 'exportFormat',
          name: '',
          absoluteSize: 0,
          fileFormat: Sketch.ExportFileFormat.PNG,
          visibleScaleType: Sketch.VisibleScaleType.Scale,
          scale: 1,
        });
      });
    }
    case 'deleteExportFormat': {
      const [, index] = action;

      return produce(state, (draft) => {
        draft.exportFormats.splice(index, 1);
      });
    }
    case 'setExportName': {
      const [, index, value] = action;

      return produce(state, (draft) => {
        draft.exportFormats[index].name = value;
      });
    }
    case 'setExportFileFormat': {
      const [, index, value] = action;

      return produce(state, (draft) => {
        draft.exportFormats[index].fileFormat = value;
      });
    }
    case 'setExportNamingScheme': {
      const [, index, value] = action;

      return produce(state, (draft) => {
        draft.exportFormats[index].namingScheme = value;
      });
    }
    default:
      return state;
  }
}
