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

  const onChangeScale = useCallback(
    (value, index) => {
      dispatch('setExportScale', index, value, selectedLayer.frame);
    },
    [dispatch, selectedLayer.frame],
  );
  const onChangeName = useCallback(
    (value, index) => {
      dispatch('setExportName', index, value);
    },
    [dispatch],
  );
  const onChangeFileFormat = useCallback(
    (value, index) => {
      dispatch('setExportFileFormat', index, value);
    },
    [dispatch],
  );
  const onChangeNamingScheme = useCallback(
    (value, index) => {
      dispatch('setExportNamingScheme', index, value);
    },
    [dispatch],
  );
  const onDelete = useCallback(
    (index) => {
      dispatch('deleteExportFormat', index);
    },
    [dispatch],
  );

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
      {({ item, index }: { item: FileFormat.ExportFormat; index: number }) => (
        <ExportFormatsRow
          id={`exportFormat-${index}}`}
          last={index === exportFormats.length - 1}
          frame={selectedLayer.frame}
          exportFormat={item}
          onChangeScale={(value) => onChangeScale(value, index)}
          onChangeName={(value) => onChangeName(value, index)}
          onChangeFileFormat={(value) => onChangeFileFormat(value, index)}
          onChangeNamingScheme={(value) => onChangeNamingScheme(value, index)}
          onDelete={() => onDelete(index)}
        />
      )}
    </ArrayController>,
    symbolMaster && <ExportPreviewRow layer={symbolMaster} />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
