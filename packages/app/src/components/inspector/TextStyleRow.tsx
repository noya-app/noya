import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Label,
  Select,
  InputField,
  LabeledElementView,
  MenuItem,
} from 'noya-designsystem';
import { Spacer } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { useCallback, memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import DimensionInput from './DimensionInput';
import FillInputFieldWithPicker from './FillInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';

const FONT_SIZE_DROPDOWN_OPTIONS: MenuItem<string>[] = [
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  14,
  16,
  18,
  21,
  24,
  36,
  48,
  60,
  72,
]
  .map((size) => size.toString())
  .map((value) => ({
    value,
    title: value,
  }));

interface TextStyleRowProps {
  fontSize?: number;
  fontFamily?: string;
  fontColor?: Sketch.Color;
  lineSpacing?: number;
  letterSpacing?: number;
  paragraphSpacing?: number;
  onChangeFontSize: (value: number, mode: SetNumberMode) => void;
  onChangeFontFamily: (value: string) => void;
  onChangeFontWeight: (value: string) => void;
  onChangeFontColor: (color: Sketch.Color) => void;
  onChangeLineSpacing: (value: number, mode: SetNumberMode) => void;
  onChangeLetterSpacing: (value: number, mode: SetNumberMode) => void;
  onChangeParagraphSpacing: (value: number, mode: SetNumberMode) => void;
}

export default memo(function TextStyleRow({
  fontColor,
  fontSize,
  fontFamily,
  lineSpacing,
  letterSpacing,
  paragraphSpacing,
  onChangeFontColor,
  onChangeFontSize,
  onChangeFontFamily,
  onChangeFontWeight,
  onChangeLineSpacing,
  onChangeLetterSpacing,
  onChangeParagraphSpacing,
}: TextStyleRowProps) {
  const characterInputId = `char`;
  const lineInputId = `line`;
  const paragraphInputId = `paragraph`;
  const fontSizeId = `size`;

  // const [family, size] = useMemo(
  //   () => fontFamily.replace('MT', '').split('-'),
  //   [fontFamily],
  // );

  // This it's for testing
  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Verdana',
    'Trebuchet MS',
    'Times',
    'SegoeUI',
  ];
  const fontSizes = useMemo(
    () => [
      { id: '', text: 'Regular' },
      { id: 'Oblique', text: 'Oblique' },
      { id: 'LightOblique', text: 'Light Oblique' },
      { id: 'Light', text: 'Light' },
      { id: 'Bold', text: 'Bold' },
      { id: 'SemiBold', text: 'Semi Bold' },
      { id: 'BoldOblique', text: 'Bold Oblique' },
      { id: 'Italic', text: 'Italic' },
    ],
    [],
  );

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case characterInputId:
          return <Label.Label>Character</Label.Label>;
        case lineInputId:
          return <Label.Label>Line</Label.Label>;
        case paragraphInputId:
          return <Label.Label>Paragraph</Label.Label>;
        case fontSizeId:
          return <Label.Label>Size</Label.Label>;
        default:
          return null;
      }
    },
    [characterInputId, fontSizeId, lineInputId, paragraphInputId],
  );

  const textSizeOptions = useMemo(
    () => [...fontSizes.map((style) => style.id)],
    [fontSizes],
  );
  const getTextSizeTitle = useCallback(
    (id) => fontSizes.find((size) => size.id === id)!.text,
    [fontSizes],
  );

  const { horizontalSeparator, verticalSeparator } = useTheme().sizes.inspector;

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Text</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <Spacer.Vertical size={verticalSeparator} />
      <InspectorPrimitives.Row>
        <Select
          id="font-family"
          value={fontFamily ?? ''}
          options={fontFamilies}
          getTitle={(name) => name}
          onChange={onChangeFontFamily}
        />
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={verticalSeparator} />
      <InspectorPrimitives.Row>
        <Select
          id="font-weight"
          flex={`0 0 calc(75% - ${(horizontalSeparator * 1) / 4}px)`}
          value={'Regular'}
          options={textSizeOptions}
          getTitle={getTextSizeTitle}
          onChange={onChangeFontWeight}
        />
        <Spacer.Horizontal size={horizontalSeparator} />
        <FillInputFieldWithPicker
          id="font-color"
          flex={`0 0 calc(25% - ${(horizontalSeparator * 3) / 4}px)`}
          colorProps={useMemo(
            () => ({
              color: fontColor,
              onChangeColor: onChangeFontColor,
            }),
            [fontColor, onChangeFontColor],
          )}
        />
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={verticalSeparator} />
      <InspectorPrimitives.Row>
        <LabeledElementView renderLabel={renderLabel}>
          <InputField.Root id={fontSizeId}>
            <InputField.NumberInput
              placeholder={fontSize === undefined ? 'multiple' : ''}
              value={fontSize}
              onSubmit={useCallback(
                (value) => onChangeFontSize(value, 'replace'),
                [onChangeFontSize],
              )}
              onNudge={useCallback(
                (value) => onChangeFontSize(value, 'adjust'),
                [onChangeFontSize],
              )}
            />
            <InputField.DropdownMenu
              id="font-size-dropdown"
              items={FONT_SIZE_DROPDOWN_OPTIONS}
              onSelect={useCallback(
                (value: string) => onChangeFontSize(Number(value), 'replace'),
                [onChangeFontSize],
              )}
            />
          </InputField.Root>
          <Spacer.Horizontal size={horizontalSeparator} />
          <DimensionInput
            id={characterInputId}
            value={letterSpacing}
            onSetValue={onChangeLineSpacing}
          />
          <Spacer.Horizontal size={horizontalSeparator} />
          <DimensionInput
            id={lineInputId}
            value={lineSpacing}
            onSetValue={onChangeLetterSpacing}
            placeholder="auto"
          />
          <Spacer.Horizontal size={horizontalSeparator} />
          <DimensionInput
            id={paragraphInputId}
            value={paragraphSpacing}
            onSetValue={onChangeParagraphSpacing}
          />
        </LabeledElementView>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
