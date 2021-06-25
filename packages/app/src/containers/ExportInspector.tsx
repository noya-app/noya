import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { fileSave } from 'browser-fs-access';
import { Button, Divider, Spacer } from 'noya-designsystem';
import withSeparatorElements from 'noya-designsystem/src/utils/withSeparatorElements';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import { useTheme } from 'styled-components';
import { LayerPreview as RCKLayerPreview } from 'noya-renderer';
import ArrayController from '../components/inspector/ExportArrayController';
import ExportFormatsRow from '../components/inspector/ExportFormatsRow';
import ExportPreviewRow from '../components/inspector/ExportPreviewRow';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import {
  useDispatch,
  useGetWorkspaceStateSnapshot,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useCanvasKit from '../hooks/useCanvasKit';
import { renderImageFromCanvas } from '../utils/renderImageFromCanvas';

async function saveFile(name: string, data: Uint8Array) {
  const file = new File([data], name, {
    type: 'image/png',
  });

  await fileSave(
    file,
    { fileName: file.name, extensions: ['.png'] },
    undefined,
    false,
  );
}

export default memo(function ExportInspector() {
  const title = 'Exports';
  const dispatch = useDispatch();
  const theme = useTheme();
  const CanvasKit = useCanvasKit();
  const getWorkspaceStateSnapshot = useGetWorkspaceStateSnapshot();

  const selectedLayer = useSelector(
    Selectors.getSelectedLayers,
  )[0] as Sketch.SymbolInstance;

  const exportFormats = selectedLayer.exportOptions.exportFormats;

  // TODO: Handle export formats
  const handleExport = useCallback(async () => {
    const size = {
      width: Math.ceil(selectedLayer.frame.width),
      height: Math.ceil(selectedLayer.frame.height),
    };

    const data = await renderImageFromCanvas(
      CanvasKit,
      size.width,
      size.height,
      theme,
      getWorkspaceStateSnapshot(),
      'png',
      () => <RCKLayerPreview layer={selectedLayer} size={size} />,
    );

    if (!data) return;

    saveFile(`${selectedLayer.name}.png`, data);
  }, [CanvasKit, getWorkspaceStateSnapshot, selectedLayer, theme]);

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
    exportFormats.length > 0 && selectedLayer && (
      <>
        <InspectorPrimitives.Section>
          <ExportPreviewRow layer={selectedLayer} />
          <Spacer.Vertical size={10} />
          <Button id="export-selected" onClick={handleExport}>
            Export Selected...
          </Button>
        </InspectorPrimitives.Section>
      </>
    ),
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
