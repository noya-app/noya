import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  InputField,
  Label,
  LabeledElementView,
  MenuItem,
  Select,
} from 'noya-designsystem';
import {
  decodeFontVariant,
  GoogleFontVariant,
  getFontDefinition,
  getFontFamilyId,
  getFontFamilyIdList,
  getFontVariants,
  hasFontFamilyId,
  isValidFontVariant,
} from 'noya-google-fonts';
import { SetNumberMode } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';
import DimensionInput from './DimensionInput';
import FillInputFieldWithPicker from './FillInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';

const MULTIPLE_TYPEFACES = 'Multiple Typefaces';

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

const DEFAULT_FONT_VARIANT_OPTIONS: GoogleFontVariant[] = ['regular'];

const upperFirst = (string: string) =>
  string.slice(0, 1).toUpperCase() + string.slice(1);

interface TextStyleRowProps {
  fontSize?: number;
  fontFamily?: string;
  fontVariant?: string;
  fontColor?: Sketch.Color;
  lineSpacing?: number;
  letterSpacing?: number;
  paragraphSpacing?: number;
  onChangeFontSize: (value: number, mode: SetNumberMode) => void;
  onChangeFontFamily: (value: string) => void;
  onChangeFontVariant: (value?: string) => void;
  onChangeFontColor: (color: Sketch.Color) => void;
  onChangeLineSpacing: (value: number, mode: SetNumberMode) => void;
  onChangeLetterSpacing: (value: number, mode: SetNumberMode) => void;
  onChangeParagraphSpacing: (value: number, mode: SetNumberMode) => void;
}

export default memo(function TextStyleRow({
  fontColor,
  fontSize,
  fontFamily,
  fontVariant,
  lineSpacing,
  letterSpacing,
  paragraphSpacing,
  onChangeFontColor,
  onChangeFontSize,
  onChangeFontFamily,
  onChangeFontVariant,
  onChangeLineSpacing,
  onChangeLetterSpacing,
  onChangeParagraphSpacing,
}: TextStyleRowProps) {
  const characterInputId = `char`;
  const lineInputId = `line`;
  const paragraphInputId = `paragraph`;
  const fontSizeId = `size`;

  const fontFamilyId = fontFamily ? getFontFamilyId(fontFamily) : undefined;

  const fontFamilyIdOptions = useMemo(() => {
    const fontIdList = getFontFamilyIdList();

    const combinedList = !fontFamilyId
      ? [...fontIdList, MULTIPLE_TYPEFACES]
      : hasFontFamilyId(fontFamilyId)
      ? fontIdList
      : [...fontIdList, fontFamilyId];

    return combinedList.map((id) => id.toString());
  }, [fontFamilyId]);

  const fontVariantOptions = fontFamilyId
    ? getFontVariants(fontFamilyId)
    : DEFAULT_FONT_VARIANT_OPTIONS;

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

  const { horizontalSeparator } = useTheme().sizes.inspector;

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Text</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <Select
          id="font-family"
          value={fontFamilyId?.toString() || 'Multiple Typefaces'}
          options={fontFamilyIdOptions}
          getTitle={useCallback(
            (value: string) => {
              if (value === MULTIPLE_TYPEFACES) return value;

              const fontFamilyId = getFontFamilyId(value);

              if (!fontFamilyId) return fontFamily ?? value;

              return getFontDefinition(fontFamilyId).family;
            },
            [fontFamily],
          )}
          onChange={useCallback(
            (value: string) => {
              if (value === MULTIPLE_TYPEFACES) return;

              const fontFamilyId = getFontFamilyId(value);

              if (!fontFamilyId) return;

              const fontFamily = getFontDefinition(fontFamilyId).family;

              onChangeFontFamily(fontFamily);

              if (fontVariant !== undefined && fontFamilyId) {
                const fontVariants = getFontVariants(fontFamilyId);

                if (!(fontVariants as string[]).includes(fontVariant)) {
                  onChangeFontVariant(undefined);
                }
              }
            },
            [fontVariant, onChangeFontFamily, onChangeFontVariant],
          )}
        />
      </InspectorPrimitives.Row>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <Select
          id="font-variant"
          flex={`0 0 calc(75% - ${(horizontalSeparator * 1) / 4}px)`}
          value={fontVariant || 'regular'}
          options={fontVariantOptions}
          getTitle={useCallback((variant) => {
            if (!isValidFontVariant(variant)) return variant;

            const { variantName, weight } = decodeFontVariant(variant);

            return [
              weight === 'regular' && variantName === 'italic'
                ? undefined
                : upperFirst(weight),
              variantName === 'italic' ? 'Italic' : undefined,
            ]
              .filter((x): x is string => !!x)
              .join(' ');
          }, [])}
          onChange={onChangeFontVariant}
        />
        <InspectorPrimitives.HorizontalSeparator />
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
      <InspectorPrimitives.VerticalSeparator />
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
          <InspectorPrimitives.HorizontalSeparator />
          <DimensionInput
            id={characterInputId}
            value={letterSpacing}
            onSetValue={onChangeLineSpacing}
          />
          <InspectorPrimitives.HorizontalSeparator />
          <DimensionInput
            id={lineInputId}
            value={lineSpacing}
            onSetValue={onChangeLetterSpacing}
            placeholder="auto"
          />
          <InspectorPrimitives.HorizontalSeparator />
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
