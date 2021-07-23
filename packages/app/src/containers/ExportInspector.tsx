import Sketch from '@sketch-hq/sketch-file-format-ts';
import { fileSave } from 'browser-fs-access';
import JSZip from 'jszip';
import {
  Button,
  Divider,
  Spacer,
  withSeparatorElements,
} from 'noya-designsystem';
import { Size } from 'noya-geometry';
import { LayerPreview as RCKLayerPreview, useCanvasKit } from 'noya-renderer';
import { Selectors } from 'noya-state';
import {
  FileType,
  getFileExtensionForType,
  getFileTypeForExtension,
} from 'noya-utils';
import { memo, useCallback } from 'react';
import { useTheme } from 'styled-components';
import ExportArrayController from '../components/inspector/ExportArrayController';
import ExportFormatsRow from '../components/inspector/ExportFormatsRow';
import ExportPreviewRow from '../components/inspector/ExportPreviewRow';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import {
  useDispatch,
  useGetWorkspaceStateSnapshot,
  useSelector,
} from 'noya-app-state-context';
import { ImageEncoding, generateImage } from 'noya-generate-image';

async function saveFile(name: string, type: FileType, data: ArrayBuffer) {
  const file = new File([data], name, {
    type,
  });

  await fileSave(
    file,
    { fileName: file.name, extensions: [`.${getFileExtensionForType(type)}`] },
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

  const exportFormats = selectedLayer.exportOptions.exportFormats;

  const renderImageForExportFormat = useCallback(
    async (exportFormat: Sketch.ExportFormat) => {
      const size = {
        width: selectedLayer.frame.width,
        height: selectedLayer.frame.height,
      };

      const exportSize = getExportSize(exportFormat, size);

      return generateImage(
        CanvasKit,
        exportSize.width,
        exportSize.height,
        theme,
        getWorkspaceStateSnapshot(),
        exportFormat.fileFormat.toString() as ImageEncoding,
        () => <RCKLayerPreview layer={selectedLayer} size={exportSize} />,
      );
    },
    [CanvasKit, theme, selectedLayer, getWorkspaceStateSnapshot],
  );

  const getExportFileName = useCallback(
    (exportFormat: Sketch.ExportFormat) => {
      const { name, namingScheme, fileFormat } = exportFormat;

      if (namingScheme === Sketch.ExportFormatNamingScheme.Suffix)
        return `${selectedLayer.name}${name}.${fileFormat}`;

      return `${name}${selectedLayer.name}.${fileFormat}`;
    },
    [selectedLayer],
  );

  const handleExport = useCallback(async () => {
    if (exportFormats.length === 1) {
      const exportFormat = exportFormats[0];

      if (
        exportFormat.fileFormat !== Sketch.ExportFileFormat.JPG &&
        exportFormat.fileFormat !== Sketch.ExportFileFormat.PNG &&
        exportFormat.fileFormat !== Sketch.ExportFileFormat.SVG &&
        exportFormat.fileFormat !== Sketch.ExportFileFormat.WEBP
      )
        return;

      const data = await renderImageForExportFormat(exportFormat);

      if (!data) return;

      const fileName = getExportFileName(exportFormat);

      saveFile(
        fileName,
        getFileTypeForExtension(exportFormat.fileFormat),
        data,
      );
    } else {
      const zip = new JSZip();

      const files = exportFormats.map(async (exportFormat) => {
        const data = await renderImageForExportFormat(exportFormat);

        if (!data) return;

        zip.file(getExportFileName(exportFormat), data, {
          base64: true,
        });
      });

      Promise.allSettled(files).then(async () => {
        const data = await zip.generateAsync({
          type: 'arraybuffer',
          mimeType: 'application/zip',
        });

        saveFile(`${selectedLayer.name}.zip`, 'application/zip', data);
      });
    }
  }, [
    selectedLayer,
    exportFormats,
    getExportFileName,
    renderImageForExportFormat,
  ]);

  const elements = [
    <ExportArrayController<Sketch.ExportFormat>
      title={title}
      id={title}
      key={title}
      value={exportFormats}
      onClickPlus={useCallback(() => {
        dispatch('addExportFormat');
      }, [dispatch])}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) => {
          dispatch('moveExportFormat', sourceIndex, destinationIndex);
        },
        [dispatch],
      )}
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
    </ExportArrayController>,
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
