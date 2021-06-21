import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import { useSelector, useDispatch } from '../contexts/ApplicationStateContext';
import withSeparatorElements from 'noya-designsystem/src/utils/withSeparatorElements';
import { Divider } from 'noya-designsystem';
import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import ArrayController from '../components/inspector/ExportArrayController';
import ExportFormatsRow from '../components/inspector/ExportFormatsRow';
import ExportPreviewRow from '../components/inspector/ExportPreviewRow';

export default memo(function ExportInspector() {
  const title = 'Exports';
  const dispatch = useDispatch();

  const selectedLayer = useSelector(
    Selectors.getSelectedLayers,
  )[0] as Sketch.SymbolInstance;

  const symbolMaster = useSelector(Selectors.getSymbols).find(
    (symbol: Sketch.SymbolMaster) => symbol.symbolID === selectedLayer.symbolID,
  );

  const exportFormats = selectedLayer.exportOptions.exportFormats;

  const elements = [
    <ArrayController<FileFormat.ExportFormat>
      title={title}
      id={title}
      key={title}
      value={exportFormats}
      onClickPlus={useCallback(() => {
        dispatch('addExportFormat');
      }, [dispatch])}
    >
      {useCallback(
        ({ item, index }: { item: FileFormat.ExportFormat; index: number }) => (
          <ExportFormatsRow
            id={`exportFormat-${index}}`}
            last={index === exportFormats.length - 1}
            exportFormat={item}
            onChangeScale={(value) => {
              dispatch('setExportScale', index, value);
            }}
            onChangeName={(value) => {
              dispatch('setExportName', index, value);
            }}
            onChangeFileFormat={(value) => {
              dispatch('setExportFileFormat', index, value);
            }}
            onChangeNamingScheme={(value) => {
              dispatch('setExportNamingScheme', index, value);
            }}
            onDelete={() => dispatch('deleteExportFormat', index)}
          />
        ),
        [exportFormats.length, dispatch],
      )}
    </ArrayController>,
    exportFormats.length > 0 && symbolMaster && (
      <ExportPreviewRow layer={symbolMaster} />
    ),
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
