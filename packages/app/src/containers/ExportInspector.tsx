import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import { useSelector, useDispatch } from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import withSeparatorElements from 'noya-designsystem/src/utils/withSeparatorElements';
import { Divider } from 'noya-designsystem';
import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import ArrayController from '../components/inspector/ExportArrayController';
import ExportFormatsRow from '../components/inspector/ExportFormatsRow';
import ExportPreviewRow from '../components/inspector/ExportPreviewRow';

export default memo(function ExportInspector() {
  const title = 'Exports';
  const dispatch = useDispatch();

  const selectedLayer = useShallowArray(
    useSelector(Selectors.getSelectedLayers),
  )[0] as Sketch.SymbolInstance;

  const symbolMaster = useShallowArray(useSelector(Selectors.getSymbols)).find(
    (symbol: Sketch.SymbolMaster) => symbol.symbolID === selectedLayer.symbolID,
  );

  const exportFormats = selectedLayer.exportOptions.exportFormats;
  /**
   *
   * TODO > allow to change prefix and suffi
   */

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
          exportFormat={item}
          onChangeScale={(value) => {
            dispatch('setScale', index, value);
          }}
          onChangeName={(value) => {
            dispatch('setName', index, value);
          }}
          onChangeFileFormat={(value) => {
            dispatch('setFileFormat', index, value);
          }}
          onChangeNamingScheme={(value) => {
            dispatch('setNamingScheme', index, value);
          }}
          onDelete={() => {
            dispatch('deleteExportFormat', index);
          }}
        />
      )}
    </ArrayController>,
    symbolMaster && <ExportPreviewRow layer={symbolMaster} />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
