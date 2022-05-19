import React, { useCallback } from 'react';
import { useTheme } from 'styled-components';
import JSZip from 'jszip';

import {
  useSelector,
  useGetWorkspaceStateSnapshot,
} from 'noya-app-state-context';
import { Size } from 'noya-geometry';
import Sketch from 'noya-file-format';
import { Selectors } from 'noya-state';
import type { CanvasKit } from 'canvaskit';
import { generateImage, ImageEncoding } from 'noya-generate-image';
import { LayerPreview as RCKLayerPreview, useCanvasKit } from 'noya-renderer';
import { usePreviewLayer } from '../hooks/usePreviewLayer';
import { getFileTypeForExtension } from 'noya-utils';
import { saveFile } from './saveFile';

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

export default function useExport() {
  const theme = useTheme();
  const CanvasKit = useCanvasKit();

  const page = useSelector(Selectors.getCurrentPage);
  const selectedLayer = useSelector(Selectors.getSelectedLayers)[0];

  const exportFormats = selectedLayer.exportOptions.exportFormats;

  const preview = usePreviewLayer({ layer: selectedLayer, page });
  const getWorkspaceStateSnapshot = useGetWorkspaceStateSnapshot();

  const renderImageForExportFormat = useCallback(
    async (exportFormat: Sketch.ExportFormat) => {
      const size = {
        width: selectedLayer.frame.width,
        height: selectedLayer.frame.height,
      };

      const exportSize = getExportSize(exportFormat, size);

      return generateImage(
        CanvasKit as unknown as CanvasKit,
        exportSize.width,
        exportSize.height,
        theme,
        getWorkspaceStateSnapshot(),
        exportFormat.fileFormat.toString() as ImageEncoding,
        () => (
          <RCKLayerPreview
            layer={preview.layer}
            layerFrame={preview.frame}
            backgroundColor={preview.backgroundColor}
            previewSize={exportSize}
          />
        ),
      );
    },
    [
      selectedLayer.frame.width,
      selectedLayer.frame.height,
      CanvasKit,
      theme,
      getWorkspaceStateSnapshot,
      preview.layer,
      preview.frame,
      preview.backgroundColor,
    ],
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

  return useCallback(async () => {
    if (exportFormats.length === 1) {
      const exportFormat = exportFormats[0];

      if (
        exportFormat.fileFormat !== Sketch.ExportFileFormat.JPG &&
        exportFormat.fileFormat !== Sketch.ExportFileFormat.PNG &&
        exportFormat.fileFormat !== Sketch.ExportFileFormat.SVG &&
        exportFormat.fileFormat !== Sketch.ExportFileFormat.WEBP
      ) {
        return;
      }

      const data = await renderImageForExportFormat(exportFormat);

      if (!data) {
        return;
      }

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

        if (!data) {
          return;
        }

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
}
