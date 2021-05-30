import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { getSelectedLayers } from '../selectors/layerSelectors';
import { ApplicationState } from './applicationReducer';

export type ExportAction =
  | [type: 'setScale', index: number, value: string]
  | [type: 'setName', index: number, value: string]
  | [type: 'setFileFormat', index: number, value: Sketch.ExportFileFormat]
  | [
      type: 'setNamingScheme',
      index: number,
      value: Sketch.ExportFormatNamingScheme,
    ]
  | [type: 'addExportFormat'];

export function exportReducer(
  state: ApplicationState,
  action: ExportAction,
): ApplicationState {
  switch (action[0]) {
    case 'setScale': {
      const [, index, value] = action;

      return produce(state, (draft) => {
        const layers = getSelectedLayers(draft);

        const number = parseFloat(value.replace('x', ''));
        layers.forEach(
          (layer) => (layer.exportOptions.exportFormats[index].scale = number),
        );
      });
    }
    case 'addExportFormat': {
      return produce(state, (draft) => {
        const layers = getSelectedLayers(draft);

        layers.forEach((layer) => layer.exportOptions.exportFormats.push());
      });
    }
    case 'setName': {
      const [, index, value] = action;

      return produce(state, (draft) => {
        const layers = getSelectedLayers(draft);

        layers.forEach(
          (layer) => (layer.exportOptions.exportFormats[index].name = value),
        );
      });
    }
    case 'setFileFormat': {
      const [, index, value] = action;

      return produce(state, (draft) => {
        const layers = getSelectedLayers(draft);

        layers.forEach(
          (layer) =>
            (layer.exportOptions.exportFormats[index].fileFormat = value),
        );
      });
    }
    case 'setNamingScheme': {
      const [, index, value] = action;

      return produce(state, (draft) => {
        const layers = getSelectedLayers(draft);

        layers.forEach(
          (layer) =>
            (layer.exportOptions.exportFormats[index].namingScheme = value),
        );
      });
    }
    default:
      return state;
  }
}
