import { Cross1Icon } from '@radix-ui/react-icons';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  InputField,
  Select,
  Spacer,
  LabeledElementView,
  Label,
} from 'noya-designsystem';
import withSeparatorElements from 'noya-designsystem/src/utils/withSeparatorElements';
import { memo, useCallback } from 'react';
import styled from 'styled-components';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  id: string;
  exportFormat: Sketch.ExportFormat;
  last: boolean;
  onDelete: () => void;
  onChangeScale: (amount: string) => void;
  onChangeName: (name: string) => void;
  onChangeFileFormat: (amount: Sketch.ExportFileFormat) => void;
  onChangeNamingScheme: (amount: Sketch.ExportFormatNamingScheme) => void;
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
  const fileFormatOptions = Object.values(Sketch.ExportFileFormat);
  const scale =
    exportFormat.scale.toString() +
    (exportFormat.visibleScaleType
      ? exportFormat.visibleScaleType === Sketch.VisibleScaleType.Height
        ? 'h'
        : 'w'
      : 'x');

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
    exportFormat.fileFormat === Sketch.ExportFileFormat.JPG ||
    exportFormat.fileFormat === Sketch.ExportFileFormat.PNG;

  const isPrefix =
    exportFormat.namingScheme ===
    Sketch.ExportFormatNamingScheme.Prefix.valueOf();

  const elements = [
    <InputField.Root id={scaleInputId} size={55}>
      <InputField.Input
        disabled={!canChangeScale}
        placeholder={canChangeScale ? '' : scale}
        value={canChangeScale ? scale : ''}
        onSubmit={useCallback(
          (value, reset) => {
            if (
              isNaN(parseFloat(value)) &&
              isNaN(parseFloat(value.slice(-1)))
            ) {
              reset();
              return;
            }

            onChangeScale(value);
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
        list={[
          { value: Sketch.ExportFormatNamingScheme.Prefix, title: 'Prefix' },
          { value: Sketch.ExportFormatNamingScheme.Suffix, title: 'Suffix' },
        ]}
        onSumbitList={useCallback(
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
        options={fileFormatOptions}
        getTitle={(id) => id.toUpperCase()}
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
