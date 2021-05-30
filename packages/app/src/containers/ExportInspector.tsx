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

export default memo(function ExportInspector() {
  const title = 'Exports';
  const dispatch = useDispatch();
  const selectedLayer = useShallowArray(
    useSelector(Selectors.getSelectedLayers),
  )[0] as Sketch.AnyLayer;

  const exportFormats = selectedLayer.exportOptions.exportFormats;

  const elements = [
    <ArrayController<FileFormat.ExportFormat>
      title={title}
      id={title}
      key={title}
      value={exportFormats}
      onClickPlus={useCallback(() => {}, [])}
      onDeleteItem={useCallback((index) => dispatch('deleteFill', index), [
        dispatch,
      ])}
    >
      {({ item, index }: { item: FileFormat.ExportFormat; index: number }) => (
        <ExportFormatsRow
          id={`exportFormat-${index}}`}
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
          onChangeNamingScheme={() => {}}
        />
      )}
    </ArrayController>,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
