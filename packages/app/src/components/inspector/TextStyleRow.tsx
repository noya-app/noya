import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Label,
  Select,
  InputField,
  LabeledElementView,
} from 'noya-designsystem';
import { Spacer } from 'noya-designsystem';
import { useCallback, memo, useMemo } from 'react';
import FillInputFieldWithPicker from './FillInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';

interface TextStyleRowProps {
  fontSize?: number;
  fontFamily: string;
  fontColor: Sketch.Color;
  lineSpacing?: number;
  letterSpacing?: number;
  paragraphSpacing?: number;
  onChangeFontSize: (value: number) => void;
  onChangeFontFamily: (value: string) => void;
  onChangeFontWeight: (value: string) => void;
  onChangeFontColor: (color: Sketch.Color) => void;
  onChangeLineSpacing: (value: number) => void;
  onChangeLetterSpacing: (value: number) => void;
  onChagenParagraphSpacing: (value: number) => void;
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
  onChagenParagraphSpacing,
}: TextStyleRowProps) {
  const characterInputId = `char`;
  const lineInputId = `line`;
  const paragraphInputId = `paragraph`;

  const [family, size] = useMemo(
    () => fontFamily.replace('MT', '').split('-'),
    [fontFamily],
  );

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
        default:
          return null;
      }
    },
    [characterInputId, lineInputId, paragraphInputId],
  );

  const textSizeOptions = useMemo(
    () => [...fontSizes.map((style) => style.id)],
    [fontSizes],
  );
  const getTextSizeTitle = useCallback(
    (id) => fontSizes.find((size) => size.id === id)!.text,
    [fontSizes],
  );

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Text</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <Spacer.Vertical size={10} />
      <InspectorPrimitives.Row>
        <Select
          id="font-family"
          value={family}
          options={fontFamilies}
          getTitle={(name) => name}
          onChange={onChangeFontFamily}
        />
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={6} />
      <InspectorPrimitives.Row>
        <Select
          id="font-weight"
          value={size || 'Regular'}
          options={textSizeOptions}
          getTitle={getTextSizeTitle}
          onChange={onChangeFontWeight}
        />
        <Spacer.Horizontal size={8} />
        <InputField.Root id="font-size" size={50}>
          <InputField.NumberInput
            placeholder={fontSize ? '' : 'multiple'}
            value={fontSize}
            onSubmit={onChangeFontSize}
          />
          <InputField.Label>px</InputField.Label>
        </InputField.Root>
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={6} />
      <InspectorPrimitives.Row>
        <LabeledElementView renderLabel={renderLabel}>
          <InputField.NumberInput
            id={characterInputId}
            placeholder={letterSpacing ? '' : 'multiple'}
            value={letterSpacing}
            onSubmit={onChangeLineSpacing}
            onNudge={() => {}}
          />
          <Spacer.Horizontal size={8} />
          <InputField.NumberInput
            id={lineInputId}
            placeholder={lineSpacing === undefined ? 'multiple' : undefined}
            value={lineSpacing}
            onSubmit={onChangeLetterSpacing}
            onNudge={() => {}}
          />
          <Spacer.Horizontal size={8} />
          <InputField.NumberInput
            id={paragraphInputId}
            placeholder={paragraphSpacing ? '' : 'multiple'}
            value={paragraphSpacing}
            onSubmit={onChagenParagraphSpacing}
            onNudge={() => {}}
          />
          <Spacer.Horizontal size={8} />
          <FillInputFieldWithPicker
            id={'colorInputId'}
            colorProps={useMemo(
              () => ({
                color: fontColor,
                onChangeColor: onChangeFontColor,
              }),
              [fontColor, onChangeFontColor],
            )}
          />
        </LabeledElementView>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
