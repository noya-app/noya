import Sketch from '@sketch-hq/sketch-file-format-ts';

import {
  StretchHorizontallyIcon,
  StretchVerticallyIcon,
  SquareIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  PinBottomIcon,
  PinTopIcon,
  AlignCenterVerticallyIcon,
  LetterCaseLowercaseIcon,
  LetterCaseCapitalizeIcon,
  LetterCaseUppercaseIcon,
} from '@radix-ui/react-icons';
import {
  Label,
  Select,
  RadioGroup,
  InputField,
  LabeledElementView,
  Divider,
} from 'noya-designsystem';
import { Spacer } from 'noya-designsystem';
import { useCallback, memo, useState } from 'react';
import ColorInputFieldWithPicker from './ColorInputFieldWithPicker';

import * as InspectorPrimitives from './InspectorPrimitives';

interface TextStyleRowProps {
  fontFamily: string;
  fontWeight: string;
  fontColor: Sketch.Color;
  onChangeFontFamily: (value: string) => void;
  onChangeFontWeight: (value: string) => void;
  onChangeFontColor: (color: Sketch.Color) => void;
}

interface TextAligmentRowProps {
  fontAlignment: string;
  fontHorizontalAlignment: string;
  fontVerticalAlignment: string;
  onChangeFontAlignment: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeFontHorizontalAlignment: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onChangeFontVerticalAlignment: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

interface TextOptionsRowProps {
  fontCase: string;
  fontDecorator: string;
  onChangeFontCase: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeFontDecorator: (value: string) => void;
}

const TextStyleRow = memo(function TextStyleRow({
  fontColor,
  fontFamily,
  fontWeight,
  onChangeFontColor,
  onChangeFontFamily,
  onChangeFontWeight,
}: TextStyleRowProps) {
  const characterInputId = `char`;
  const lineInputId = `line`;
  const paragraphInputId = `paragraph`;

  const fontFamilies = ['Arial', 'Helvetica', 'Verdana', 'Trebuchet MS'];
  const fontSize = ['Regular', 'Bold', 'Semi Bold'];

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

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Text</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>

      <Spacer.Vertical size={10} />
      <InspectorPrimitives.Row>
        <Select
          id="font-family"
          value={fontFamily}
          options={fontFamilies}
          getTitle={(name) => name}
          onChange={onChangeFontFamily}
        />
      </InspectorPrimitives.Row>

      <Spacer.Vertical size={6} />
      <InspectorPrimitives.Row>
        <Select
          id="font-weight"
          value={fontWeight}
          options={fontSize}
          getTitle={(name) => name}
          onChange={onChangeFontWeight}
        />
        <Spacer.Horizontal size={8} />
        <InputField.Root id="font-size" size={50}>
          <InputField.NumberInput
            value={32}
            onSubmit={() => {}}
            onNudge={() => {}}
          />
          <InputField.Label>px</InputField.Label>
        </InputField.Root>
      </InspectorPrimitives.Row>

      <Spacer.Vertical size={6} />
      <InspectorPrimitives.Row>
        <LabeledElementView renderLabel={renderLabel}>
          <InputField.NumberInput
            id={characterInputId}
            value={32}
            onSubmit={() => {}}
            onNudge={() => {}}
          />
          <Spacer.Horizontal size={8} />
          <InputField.NumberInput
            id={lineInputId}
            value={32}
            onSubmit={() => {}}
            onNudge={() => {}}
          />
          <Spacer.Horizontal size={8} />
          <InputField.NumberInput
            id={paragraphInputId}
            value={32}
            onSubmit={() => {}}
            onNudge={() => {}}
          />
          <Spacer.Horizontal size={8} />
          <ColorInputFieldWithPicker
            id={'colorInputId'}
            value={fontColor}
            onChange={onChangeFontColor}
          />
        </LabeledElementView>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
const TextAligmentRow = memo(function TextAligmentRow({
  fontAlignment,
  fontHorizontalAlignment,
  fontVerticalAlignment,
  onChangeFontAlignment,
  onChangeFontHorizontalAlignment,
  onChangeFontVerticalAlignment,
}: TextAligmentRowProps) {
  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Alignment</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <Spacer.Vertical size={10} />
      <InspectorPrimitives.Row>
        <LabeledElementView
          renderLabel={() => <Label.Label>Auto Height</Label.Label>}
        >
          <RadioGroup.Root
            id={'text-alignment'}
            value={fontAlignment}
            onValueChange={onChangeFontAlignment}
          >
            <RadioGroup.Item value="horizontal" tooltip="Horizontal">
              <StretchHorizontallyIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="vertical" tooltip="Vertical">
              <StretchVerticallyIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="outside" tooltip="Outside">
              <SquareIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>

      <Spacer.Vertical size={8} />
      <InspectorPrimitives.Row>
        <RadioGroup.Root
          id={'text-horizontal-aligment'}
          value={fontHorizontalAlignment}
          onValueChange={onChangeFontHorizontalAlignment}
        >
          <RadioGroup.Item value="left" tooltip="Left">
            <TextAlignLeftIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="center" tooltip="Center">
            <TextAlignCenterIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="right" tooltip="Right">
            <TextAlignRightIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="justify" tooltip="Justify">
            <TextAlignJustifyIcon />
          </RadioGroup.Item>
        </RadioGroup.Root>
      </InspectorPrimitives.Row>

      <Spacer.Vertical size={8} />
      <InspectorPrimitives.Row>
        <RadioGroup.Root
          id={'text-vertical-aligment'}
          value={fontVerticalAlignment}
          onValueChange={onChangeFontVerticalAlignment}
        >
          <RadioGroup.Item value="top" tooltip="Top">
            <PinTopIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="center" tooltip="Center">
            <AlignCenterVerticallyIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="bottom" tooltip="Bottom">
            <PinBottomIcon />
          </RadioGroup.Item>
        </RadioGroup.Root>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
const TextOptionsRow = memo(function TextOptionsRow({
  fontCase,
  fontDecorator,
  onChangeFontCase,
  onChangeFontDecorator,
}: TextOptionsRowProps) {
  const decoratorInputId = `decorator`;
  const transformInputId = `transform`;
  const decorator = ['None', 'Underline', 'Strikethrough'];

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case decoratorInputId:
          return <Label.Label>Decoration</Label.Label>;
        case transformInputId:
          return <Label.Label>Transform</Label.Label>;
        default:
          return null;
      }
    },
    [decoratorInputId, transformInputId],
  );
  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Text Options</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <Spacer.Vertical size={10} />
      <InspectorPrimitives.Row>
        <LabeledElementView renderLabel={renderLabel}>
          <Select
            id={decoratorInputId}
            value={fontDecorator}
            options={decorator}
            getTitle={(name) => name}
            onChange={onChangeFontDecorator}
          />
          <Spacer.Horizontal size={8} />
          <RadioGroup.Root
            id={transformInputId}
            value={fontCase}
            onValueChange={onChangeFontCase}
          >
            <RadioGroup.Item value="capitalize" tooltip="Capitalize">
              <LetterCaseCapitalizeIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="uppercase" tooltip="Uppercase">
              <LetterCaseUppercaseIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="lowercase" tooltip="Lowercase">
              <LetterCaseLowercaseIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});

export default memo(function TextStyleInspector() {
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('Regular');
  const [fontDecorator, setFontDecorator] = useState('None');
  const [fontCase, setFontCase] = useState('capitalize');

  const [fontAlignment, setFontAlignment] = useState('horizontal');
  const [verticalAlignment, setFontVerticalAlignment] = useState('top');
  const [horizontalAlignment, setFontHorizontalAlignment] = useState('left');

  const [fontColor, setFontColor] = useState({
    _class: 'color',
    red: 1,
    blue: 1,
    green: 1,
    alpha: 1,
  } as Sketch.Color);

  return (
    <>
      <TextStyleRow
        fontColor={fontColor}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        onChangeFontFamily={useCallback((value) => setFontFamily(value), [
          setFontFamily,
        ])}
        onChangeFontWeight={useCallback((value) => setFontWeight(value), [
          setFontWeight,
        ])}
        onChangeFontColor={useCallback((value) => setFontColor(value), [
          setFontColor,
        ])}
      />
      <Divider />
      <TextAligmentRow
        fontAlignment={fontAlignment}
        fontVerticalAlignment={verticalAlignment}
        fontHorizontalAlignment={horizontalAlignment}
        onChangeFontAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            setFontAlignment(event.target.value);
          },
          [setFontAlignment],
        )}
        onChangeFontHorizontalAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            setFontHorizontalAlignment(event.target.value);
          },
          [setFontHorizontalAlignment],
        )}
        onChangeFontVerticalAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            setFontVerticalAlignment(event.target.value);
          },
          [setFontVerticalAlignment],
        )}
      />
      <Divider />
      <TextOptionsRow
        fontCase={fontCase}
        fontDecorator={fontDecorator}
        onChangeFontDecorator={useCallback((value) => setFontDecorator(value), [
          setFontDecorator,
        ])}
        onChangeFontCase={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            setFontCase(event.target.value);
          },
          [setFontCase],
        )}
      />
    </>
  );
});
