import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Cross1Icon } from '@radix-ui/react-icons';
import {
  InputField,
  Select,
  Spacer,
  LabeledElementView,
  Label,
} from 'noya-designsystem';
import withSeparatorElements from 'noya-designsystem/src/utils/withSeparatorElements';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ExportOptions } from 'noya-state';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  id: string;
  last: boolean;
  frame: Sketch.Rect;
  exportFormat: Sketch.ExportFormat;
  onDelete: () => void;
  onChangeScale: (amount: string) => void;
  onChangeName: (name: string) => void;
  onChangeFileFormat: (amount: Sketch.ExportFileFormat) => void;
  onChangeNamingScheme: (amount: Sketch.ExportFormatNamingScheme) => void;
}

export default memo(function ExportFormatsRow({
  id,
  last,
  frame,
  exportFormat,
  onDelete,
  onChangeScale,
  onChangeName,
  onChangeFileFormat,
  onChangeNamingScheme,
}: Props) {
  const fileFormatOptions = Object.values(Sketch.ExportFileFormat);
  const { scale, absoluteSize, visibleScaleType } = exportFormat;

  const scaleString = useMemo(() => {
    const scaleValue =
      visibleScaleType === Sketch.VisibleScaleType.Scale ? scale : absoluteSize;

    const visibleScaleLetter =
      visibleScaleType !== Sketch.VisibleScaleType.Scale
        ? visibleScaleType === Sketch.VisibleScaleType.Height
          ? 'h'
          : 'w'
        : 'x';
    return scaleValue + visibleScaleLetter;
  }, [scale, absoluteSize, visibleScaleType]);

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
            if (!ExportOptions.parseScale(value, frame)) {
              reset();
              return;
            }

            onChangeScale(value);
          },
          [onChangeScale, frame],
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
          {
            value: Sketch.ExportFormatNamingScheme.Prefix.toString(),
            title: 'Prefix',
          },
          {
            value: Sketch.ExportFormatNamingScheme.Suffix.toString(),
            title: 'Suffix',
          },
        ]}
        buttonId={`${id}-nameingScheme-button`}
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
