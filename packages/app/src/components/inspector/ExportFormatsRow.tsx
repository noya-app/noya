import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Cross1Icon } from '@radix-ui/react-icons';
import {
  InputField,
  Select,
  Spacer,
  LabeledElementView,
  Label,
  withSeparatorElements,
} from 'noya-designsystem';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ExportOptions } from 'noya-state';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

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

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case scaleInputId:
          return <Label.Label>Size</Label.Label>;
        case namingSchemeInputId:
          return <Label.Label>Prefix/Suffix</Label.Label>;
        case fileFormatInputId:
          return <Label.Label>Format</Label.Label>;
        default:
          return null;
      }
    },
    [scaleInputId, namingSchemeInputId, fileFormatInputId],
  );

  const canChangeScale =
    exportFormat.fileFormat !== Sketch.ExportFileFormat.SVG;

  const isPrefix =
    exportFormat.namingScheme === Sketch.ExportFormatNamingScheme.Prefix;

  const elements = [
    <InputField.Root id={scaleInputId} size={55}>
      <InputField.Input
        disabled={!canChangeScale}
        value={scaleString}
        onSubmit={useCallback(
          (value, reset) => {
            const parseScale = ExportOptions.parseScale(value);
            if (!parseScale) {
              reset();
              return;
            }

            onChangeScale(parseScale);
          },
          [onChangeScale],
        )}
      />
    </InputField.Root>,
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
        buttonId={`${id}-nameingScheme-button`}
        onSelect={useCallback(
          (value: string) => onChangeNamingScheme(parseInt(value)),
          [onChangeNamingScheme],
        )}
      />
      <InputField.Label>...</InputField.Label>
    </InputField.Root>,
    <InputField.Root size={65} id={fileFormatInputId}>
      <Select
        id={'fileFormat-select'}
        value={exportFormat.fileFormat}
        options={SUPPORTED_EXPORT_FORMAT_OPTIONS}
        getTitle={useCallback((id) => id.toUpperCase(), [])}
        onChange={onChangeFileFormat}
      />
    </InputField.Root>,
    <Cross1Icon onClick={onDelete} cursor={'pointer'} />,
  ];

  return (
    <Row id={id}>
      {last ? (
        <LabeledElementView renderLabel={renderLabel}>
          {withSeparatorElements(elements, <Spacer.Horizontal size={6} />)}
        </LabeledElementView>
      ) : (
        <>{withSeparatorElements(elements, <Spacer.Horizontal size={6} />)}</>
      )}
    </Row>
  );
});
