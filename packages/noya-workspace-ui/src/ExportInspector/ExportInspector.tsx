import React, { memo, useCallback } from 'react';

import { useSelector, useDispatch } from 'noya-app-state-context';
import { Button, Layout, withSeparatorElements } from 'noya-designsystem';
import { ArrayController } from 'noya-workspace-ui';
import { Selectors } from 'noya-state';
import Sketch from 'noya-file-format';

import { Primitives } from '../primitives';
import ExportFormatsRow from './ExportFormatsRow';
import ExportPreviewRow from './ExportPreviewRow';
import useExport from './useExport';

export default memo(function ExportInspector() {
  const title = 'Exports';
  const dispatch = useDispatch();
  const page = useSelector(Selectors.getCurrentPage);
  const selectedLayer = useSelector(Selectors.getSelectedLayers)[0];

  const exportFormats = selectedLayer.exportOptions.exportFormats;
  const handleExport = useExport();

  const renderItem = useCallback(
    ({ item, index }: { item: Sketch.ExportFormat; index: number }) => (
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
  );

  const elements = [
    <ArrayController<Sketch.ExportFormat>
      sortable
      title={title}
      id={title}
      key={title}
      items={exportFormats}
      onClickPlus={useCallback(() => {
        dispatch('addExportFormat');
      }, [dispatch])}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) => {
          dispatch('moveExportFormat', sourceIndex, destinationIndex);
        },
        [dispatch],
      )}
      renderItem={renderItem}
    />,
    exportFormats.length > 0 && selectedLayer && (
      <>
        <Primitives.Section>
          <ExportPreviewRow layer={selectedLayer} page={page} />
          <Primitives.VerticalSeparator />
          <Button id="export-selected" onClick={handleExport}>
            Export Selected...
          </Button>
        </Primitives.Section>
      </>
    ),
  ];

  return <>{withSeparatorElements(elements, <Layout.Divider />)}</>;
});
