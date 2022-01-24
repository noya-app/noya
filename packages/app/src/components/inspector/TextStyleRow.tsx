import Sketch from 'noya-file-format';
import {
  InputField,
  Label,
  LabeledElementView,
  MenuItem,
  Select,
  SelectOption,
} from 'noya-designsystem';
import {
  DEFAULT_FONT_TRAITS,
  encodeFontName,
  encodeFontTraits,
  FontTraits,
  getTraitsDisplayName,
} from 'noya-fonts';
import { useFontManager } from 'noya-renderer-web';
import { SetNumberMode } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';
import DimensionInput from './DimensionInput';
import FillInputFieldWithPicker from './FillInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';

const MULTIPLE_TYPEFACES = 'Multiple Typefaces';

const FONT_SIZE_DROPDOWN_OPTIONS: MenuItem<string>[] = [
  6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 36, 48, 60, 72,
]
  .map((size) => size.toString())
  .map((value) => ({
    value,
    title: value,
  }));

interface TextStyleRowProps {
  fontSize?: number;
  fontFamily?: string;
  fontTraits?: FontTraits;
  fontColor?: Sketch.Color;
  lineSpacing?: number;
  letterSpacing?: number;
  paragraphSpacing?: number;
  onChangeFontSize: (value: number, mode: SetNumberMode) => void;
  onChangeFontName: (value: string) => void;
  onChangeFontColor: (color: Sketch.Color) => void;
  onChangeLineSpacing: (value: number, mode: SetNumberMode) => void;
  onChangeLetterSpacing: (value: number, mode: SetNumberMode) => void;
  onChangeParagraphSpacing: (value: number, mode: SetNumberMode) => void;
}

export default memo(function TextStyleRow({
  fontColor,
  fontSize,
  fontFamily,
  fontTraits,
  lineSpacing,
  letterSpacing,
  paragraphSpacing,
  onChangeFontColor,
  onChangeFontSize,
  onChangeFontName,
  onChangeLineSpacing,
  onChangeLetterSpacing,
  onChangeParagraphSpacing,
}: TextStyleRowProps) {
  const fontManager = useFontManager();

  const characterInputId = `char`;
  const lineInputId = `line`;
  const paragraphInputId = `paragraph`;
  const fontSizeId = `size`;

  const fontFamilyId = fontFamily
    ? fontManager.getFontFamilyId(fontFamily)
    : undefined;

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
          value={fontFamilyId?.toString() || MULTIPLE_TYPEFACES}
        >
          {!fontFamily ? (
            <SelectOption
              value={MULTIPLE_TYPEFACES}
              title={MULTIPLE_TYPEFACES}
            />
          ) : !fontFamilyId ? (
            <SelectOption
              value={fontFamily}
              title={`${fontFamily} (missing)`}
            />
          ) : null}
          {fontManager.getFontFamilyIdList().map((id) => (
            <SelectOption
              key={id}
              value={id}
              title={fontManager.getFontFamilyName(id) ?? id}
              onSelect={() => {
                const descriptor = fontManager.getBestFontDescriptor(id);

                if (!descriptor) return;

                onChangeFontName(
                  encodeFontName(descriptor.fontFamilyId, {
                    fontSlant: descriptor.fontSlant,
                    fontWeight: descriptor.fontWeight,
                  }),
                );
              }}
            />
          ))}
        </Select>
      </InspectorPrimitives.Row>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <Select
          id="font-variant"
          flex={`0 0 calc(75% - ${(horizontalSeparator * 1) / 4}px)`}
          value={encodeFontTraits(fontTraits ?? DEFAULT_FONT_TRAITS)}
        >
          {(fontFamilyId
            ? fontManager.getFontDescriptorsForFamily(fontFamilyId)
            : [DEFAULT_FONT_TRAITS]
          ).map((traits) => {
            const value = encodeFontTraits(traits);
            const title = getTraitsDisplayName(traits);

            return (
              <SelectOption
                key={value}
                value={value}
                title={title}
                onSelect={() => {
                  if (!fontFamilyId) return;

                  onChangeFontName(encodeFontName(fontFamilyId, traits));
                }}
              />
            );
          })}
        </Select>
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
