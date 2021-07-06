import Sketch from '@sketch-hq/sketch-file-format-ts';
import { fileSave } from 'browser-fs-access';
import JSZip from 'jszip';
import { Button, Divider, Spacer } from 'noya-designsystem';
import withSeparatorElements from 'noya-designsystem/src/utils/withSeparatorElements';
import { Size } from 'noya-geometry';
import { LayerPreview as RCKLayerPreview, useCanvasKit } from 'noya-renderer';
import { Selectors } from 'noya-state';
import { memo, useCallback } from 'react';
import { useTheme } from 'styled-components';
import ArrayController from '../components/inspector/ExportArrayController';
import ExportFormatsRow from '../components/inspector/ExportFormatsRow';
import ExportPreviewRow from '../components/inspector/ExportPreviewRow';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import {
  useDispatch,
  useGetWorkspaceStateSnapshot,
  useSelector,
} from '../contexts/ApplicationStateContext';
import { renderImageFromCanvas } from '../utils/renderImageFromCanvas';

async function saveFile(name: string, fileFormat: string, data: ArrayBuffer) {
  const file = new File([data], name, {
    type: `${fileFormat === 'zip' ? 'application' : 'image'}/${fileFormat}`,
  });

  await fileSave(
    file,
    { fileName: file.name, extensions: [`.${fileFormat}`] },
    undefined,
    false,
  );
}

function getExportSize(exportFormat: Sketch.ExportFormat, size: Size) {
  const { scale, absoluteSize, visibleScaleType } = exportFormat;

  switch (visibleScaleType) {
    case Sketch.VisibleScaleType.Width:
      return { width: absoluteSize, height: size.height };
    case Sketch.VisibleScaleType.Scale:
      return {
        width: size.width * scale,
        height: size.height * scale,
      };
    case Sketch.VisibleScaleType.Height:
      return { width: size.width, height: absoluteSize };
  }
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
  // TODO: Handle export formats
  const exportFormats = selectedLayer.exportOptions.exportFormats;

  const handleFileFormat = useCallback(
    async (exportFormat: Sketch.ExportFormat) => {
      const size = {
        width: selectedLayer.frame.width,
        height: selectedLayer.frame.height,
      };

      const exportSize = getExportSize(exportFormat, size);

      const data = await renderImageFromCanvas(
        CanvasKit,
        exportSize.width,
        exportSize.height,
        theme,
        getWorkspaceStateSnapshot(),
        exportFormat.fileFormat,
        () => <RCKLayerPreview layer={selectedLayer} size={exportSize} />,
      );
      return data;
    },
    [CanvasKit, theme, selectedLayer, getWorkspaceStateSnapshot],
  );

  const setFileName = useCallback(
    (exportFormat: Sketch.ExportFormat) => {
      const { name, namingScheme, fileFormat } = exportFormat;

      if (namingScheme === Sketch.ExportFormatNamingScheme.Suffix)
        return `${selectedLayer.name}${name}.${fileFormat}`;

      return `${name ? name : ''}${selectedLayer.name}.${fileFormat}`;
    },
    [selectedLayer],
  );

  const handleExport = useCallback(async () => {
    const handledExportFormat = ['png', 'jpg', 'webp'];

    if (
      !exportFormats
        .map((e) => e.fileFormat)
        .some((f) => handledExportFormat.includes(f))
    ) {
      alert('Export format not supported... yet');
      return;
    }

    if (exportFormats.length === 1) {
      const exportFormat = exportFormats[0];
      const data = await handleFileFormat(exportFormat);

      if (!data) return;
      const fileName = setFileName(exportFormat);

      saveFile(fileName, exportFormat.fileFormat, data);
    } else {
      const zip = new JSZip();

      const files = exportFormats.map(async (exportFormat) => {
        const data = await handleFileFormat(exportFormat);
        if (!data) return;

        zip.file(setFileName(exportFormat), data, {
          base64: true,
        });
      });

      Promise.allSettled(files).then(async () => {
        const data = await zip.generateAsync({
          type: 'arraybuffer',
          mimeType: 'application/zip',
        });

        saveFile(`${selectedLayer.name}.zip`, 'zip', data);
      });
    }
  }, [selectedLayer, exportFormats, setFileName, handleFileFormat]);

  const elements = [
    <ArrayController<Sketch.ExportFormat>
      title={title}
      id={title}
      key={title}
      value={exportFormats}
      onClickPlus={useCallback(() => {
        dispatch('addExportFormat');
      }, [dispatch])}
    >
      {useCallback(
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
