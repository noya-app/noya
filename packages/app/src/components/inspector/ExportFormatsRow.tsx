import Sketch from 'noya-file-format';
import {
  Select,
  IconButton,
  LabeledView,
  withSeparatorElements,
} from 'noya-designsystem';
import { InputField } from 'noya-web-designsystem';
import { ExportOptions } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';

export const SUPPORTED_EXPORT_FORMAT_OPTIONS: Sketch.ExportFileFormat[] = [
  Sketch.ExportFileFormat.PNG,
  Sketch.ExportFileFormat.JPG,
  Sketch.ExportFileFormat.WEBP,
  Sketch.ExportFileFormat.SVG,
];

interface Props {
  id: string;
  last: boolean;
  exportFormat: Sketch.ExportFormat;
  onDelete: () => void;
  onChangeScale: (value: ExportOptions.ExportSize) => void;
  onChangeName: (name: string) => void;
  onChangeFileFormat: (value: Sketch.ExportFileFormat) => void;
  onChangeNamingScheme: (value: Sketch.ExportFormatNamingScheme) => void;
}

export default memo(function ExportFormatsRow({
  id,
  last,
  exportFormat,
  onDelete,
  onChangeScale,
  onChangeName,
  onChangeFileFormat,
  onChangeNamingScheme,
}: Props) {
  const { scale, absoluteSize, visibleScaleType } = exportFormat;

  const scaleString =
    (visibleScaleType === Sketch.VisibleScaleType.Scale
      ? scale
      : absoluteSize) + ExportOptions.getScaleUnits(visibleScaleType);

  const scaleInputId = `${id}-size`;
  const namingSchemeInputId = `${id}-`;
  const fileFormatInputId = `${id}-opacity`;

  const canChangeScale =
    exportFormat.fileFormat !== Sketch.ExportFileFormat.SVG;

  const isPrefix =
    exportFormat.namingScheme === Sketch.ExportFormatNamingScheme.Prefix;

  const elements = [
    <LabeledView label="Size">
      <InputField.Root id={scaleInputId} size={55}>
        <InputField.Input
          disabled={!canChangeScale}
          value={scaleString}
          onSubmit={useCallback(
            (value) => {
              const parseScale = ExportOptions.parseScale(value);

              if (!parseScale) return;

              onChangeScale(parseScale);
            },
            [onChangeScale],
          )}
        />
      </InputField.Root>
    </LabeledView>,
    <LabeledView label="Prefix/Suffix">
      <InputField.Root
        id={namingSchemeInputId}
        labelPosition={isPrefix ? 'end' : 'start'}
      >
        <InputField.Input
          value={exportFormat.name}
          placeholder={isPrefix ? 'Prefix' : 'Suffix'}
          onSubmit={onChangeName}
          textAlign={isPrefix ? 'end' : 'start'}
        />
        <InputField.DropdownMenu
          items={useMemo(
            () => [
              {
                value: Sketch.ExportFormatNamingScheme.Prefix.toString(),
                title: 'Prefix',
              },
              {
                value: Sketch.ExportFormatNamingScheme.Suffix.toString(),
                title: 'Suffix',
              },
            ],
            [],
          )}
          id={`${id}-naming-scheme-button`}
          onSelect={useCallback(
            (value: string) => onChangeNamingScheme(parseInt(value)),
            [onChangeNamingScheme],
          )}
        />
        <InputField.Label>...</InputField.Label>
      </InputField.Root>
    </LabeledView>,
    <LabeledView label="Format">
      <InputField.Root size={65} id={fileFormatInputId}>
        <Select
          id={`${id}-file-format-select`}
          value={exportFormat.fileFormat}
          options={SUPPORTED_EXPORT_FORMAT_OPTIONS}
          getTitle={useCallback((id) => id.toUpperCase(), [])}
          onChange={onChangeFileFormat}
        />
      </InputField.Root>
    </LabeledView>,
    <LabeledView>
      <IconButton id={`${id}-delete`} name="cross-2" onClick={onDelete} />
    </LabeledView>,
  ];

  return (
    <InspectorPrimitives.Row id={id}>
      {last ? (
        withSeparatorElements(
          elements,
          <InspectorPrimitives.HorizontalSeparator />,
        )
      ) : (
        <>
          {withSeparatorElements(
            elements,
            <InspectorPrimitives.HorizontalSeparator />,
          )}
        </>
      )}
    </InspectorPrimitives.Row>
  );
});
