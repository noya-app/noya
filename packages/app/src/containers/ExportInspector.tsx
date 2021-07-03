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
import JSZip from 'jszip';

async function saveFile(
  name: string,
  fileFormat: string,
  data: Uint8Array | ArrayBuffer,
) {
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
  const handleFileFormat = useCallback(
    async (exportFormat: Sketch.ExportFormat) => {
      const {
        scale,
        absoluteSize,
        fileFormat,
        visibleScaleType,
      } = exportFormat;

      const adjustSize = {
        width: Math.ceil(
          visibleScaleType === Sketch.VisibleScaleType.Scale
            ? selectedLayer.frame.width * scale
            : visibleScaleType === Sketch.VisibleScaleType.Width
            ? absoluteSize
            : selectedLayer.frame.width,
        ),
        height: Math.ceil(
          visibleScaleType === Sketch.VisibleScaleType.Scale
            ? selectedLayer.frame.height * scale
            : visibleScaleType === Sketch.VisibleScaleType.Height
            ? absoluteSize
            : selectedLayer.frame.height,
        ),
      };

      const data = await renderImageFromCanvas(
        CanvasKit,
        adjustSize.width,
        adjustSize.height,
        theme,
        getWorkspaceStateSnapshot(),
        fileFormat,
        () => <RCKLayerPreview layer={selectedLayer} size={adjustSize} />,
      );
      return data;
    },
    [CanvasKit, theme, selectedLayer, getWorkspaceStateSnapshot],
  );

  const setFileName = useCallback(
    (exportFormat: Sketch.ExportFormat) => {
      const {
        scale,
        name,
        namingScheme,
        fileFormat,
        visibleScaleType,
      } = exportFormat;

      return `${!namingScheme && name ? `${name}.` : ''}${selectedLayer.name}${
        scale !== 1
          ? `@${scale}${
              visibleScaleType === Sketch.VisibleScaleType.Height
                ? 'h'
                : visibleScaleType === Sketch.VisibleScaleType.Width
                ? 'w'
                : 'x'
            }`
          : ''
      }${
        namingScheme === Sketch.ExportFormatNamingScheme.Suffix
          ? `.${name}`
          : ''
      }.${fileFormat}`;
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
