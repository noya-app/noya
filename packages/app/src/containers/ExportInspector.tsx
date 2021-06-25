import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { fileSave } from 'browser-fs-access';
import { Button, Divider, Spacer } from 'noya-designsystem';
import withSeparatorElements from 'noya-designsystem/src/utils/withSeparatorElements';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import { useTheme } from 'styled-components';
import ArrayController from '../components/inspector/ExportArrayController';
import ExportFormatsRow from '../components/inspector/ExportFormatsRow';
import ExportPreviewRow from '../components/inspector/ExportPreviewRow';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import { RCKLayerPreview } from '../components/theme/Symbol';
import {
  useDispatch,
  useGetWorkspaceStateSnapshot,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useCanvasKit from '../hooks/useCanvasKit';
import { renderImageFromCanvas } from '../utils/renderImageFromCanvas';

async function saveFile(name: string, data: Uint8Array) {
  const file = new File([data], name, {
    type: 'application/zip',
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
          <Button
            id="export-selected"
            onClick={async () => {
              const bytes = await renderImageFromCanvas(
                CanvasKit,
                100,
                100,
                theme,
                getWorkspaceStateSnapshot(),
                'png',
                () => (
                  <RCKLayerPreview
                    layer={selectedLayer}
                    size={{ width: 100, height: 100 }}
                    padding={0}
                  />
                ),
              );

              if (!bytes) return;

              saveFile('test.png', bytes);
            }}
          >
            Export Selected...
          </Button>
        </InspectorPrimitives.Section>
      </>
    ),
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
