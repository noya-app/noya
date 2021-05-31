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
  | [type: 'addExportFormat']
  | [type: 'deleteExportFormat', index: number];

export function exportReducer(
  state: ApplicationState,
  action: ExportAction,
): ApplicationState {
  switch (action[0]) {
    case 'setScale': {
      const [, index, value] = action;

      return produce(state, (draft) => {
        const layers = getSelectedLayers(draft);

        const number = isNaN(parseFloat(value))
          ? parseFloat(value.slice(0, -1))
          : parseFloat(value);

        const visibleScale =
          value.slice(-1) === 'w'
            ? Sketch.VisibleScaleType.Width
            : value.slice(-1) === 'h'
            ? Sketch.VisibleScaleType.Height
            : Sketch.VisibleScaleType.Scale;

        layers.forEach((layer) => {
          layer.exportOptions.exportFormats[index].scale = number;
          layer.exportOptions.exportFormats[
            index
          ].visibleScaleType = visibleScale;
        });
      });
    }
    case 'addExportFormat': {
      return produce(state, (draft) => {
        const layers = getSelectedLayers(draft);

        layers.forEach((layer) =>
          layer.exportOptions.exportFormats.push({
            _class: 'exportFormat',
            name: '',
            absoluteSize: 0,
            fileFormat: Sketch.ExportFileFormat.PNG,
            visibleScaleType: Sketch.VisibleScaleType.Scale,
            scale: 1,
          }),
        );
      });
    }
    case 'deleteExportFormat': {
      const [, index] = action;

      return produce(state, (draft) => {
        const layers = getSelectedLayers(draft);

        layers.forEach((layer) =>
          layer.exportOptions.exportFormats.splice(index, 1),
        );
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
