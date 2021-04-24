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
import { Selectors } from 'noya-state';
import { Spacer } from 'noya-designsystem';
import { useCallback, memo, useState, useMemo } from 'react';
import ColorInputFieldWithPicker from './ColorInputFieldWithPicker';
import useShallowArray from '../../hooks/useShallowArray';
import {
  useSelector,
  useApplicationState,
} from '../../contexts/ApplicationStateContext';
import * as InspectorPrimitives from './InspectorPrimitives';

interface TextStyleRowProps {
  fontSize: number;
  fontFamily: string;
  fontColor: Sketch.Color;
  onChangeFontSize: (value: number) => void;
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
  fontDecorator: number;
  onChangeFontCase: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeFontDecorator: (value: number) => void;
}

const TextStyleRow = memo(function TextStyleRow({
  fontColor,
  fontSize,
  fontFamily,
  onChangeFontColor,
  onChangeFontSize,
  onChangeFontFamily,
  onChangeFontWeight,
}: TextStyleRowProps) {
  const characterInputId = `char`;
  const lineInputId = `line`;
  const paragraphInputId = `paragraph`;

  const [family, size] = fontFamily.replace('MT', '').split('-');
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
            value={fontSize}
            onSubmit={onChangeFontSize}
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
          <RadioGroup.Item value="0" tooltip="Left">
            <TextAlignLeftIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="2" tooltip="Center">
            <TextAlignCenterIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="1" tooltip="Right">
            <TextAlignRightIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="3" tooltip="Justify">
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
          <RadioGroup.Item value="0" tooltip="Top">
            <PinTopIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="1" tooltip="Middle">
            <AlignCenterVerticallyIcon />
          </RadioGroup.Item>
          <RadioGroup.Item value="2" tooltip="Bottom">
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
            value={decorator[fontDecorator || 0]}
            options={decorator}
            getTitle={(name) => name}
            onChange={(value) => onChangeFontDecorator(Number(value))}
          />
          <Spacer.Horizontal size={8} />
          <RadioGroup.Root
            id={transformInputId}
            value={fontCase}
            onValueChange={onChangeFontCase}
          >
            <RadioGroup.Item value="0" tooltip="Capitalize">
              <LetterCaseCapitalizeIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="1" tooltip="Uppercase">
              <LetterCaseUppercaseIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="1" tooltip="Lowercase">
              <LetterCaseLowercaseIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});

export default memo(function TextStyleInspector() {
  const [, dispatch] = useApplicationState();

  const selectedTextStyles = useShallowArray(
    useSelector(Selectors.getSelectedTextStyles),
  );

  const fontColor = useMemo(
    () =>
      selectedTextStyles.map(
        (style) =>
          style?.textStyle?.encodedAttributes.MSAttributedStringColorAttribute,
      ),
    [selectedTextStyles],
  );

  const fontFamily = useMemo(
    () =>
      selectedTextStyles.map(
        (style) =>
          style?.textStyle?.encodedAttributes.MSAttributedStringFontAttribute
            .attributes.name,
      ),
    [selectedTextStyles],
  );

  const fontDecoration = useMemo(
    () =>
      selectedTextStyles.map(
        (style) => style?.textStyle?.encodedAttributes.underlineStyle || 0,
      ),
    [selectedTextStyles],
  );

  const fontSize = useMemo(
    () =>
      selectedTextStyles.map(
        (style) =>
          style?.textStyle?.encodedAttributes.MSAttributedStringFontAttribute
            .attributes.size || 24,
      ),
    [selectedTextStyles],
  );

  const firstColor = useMemo(
    () =>
      fontColor[0] ||
      ({
        _class: 'color',
        red: 0.5,
        blue: 0.5,
        green: 0.5,
        alpha: 0.5,
      } as Sketch.Color),
    [fontColor],
  );

  const firstFontFamily = useMemo(() => fontFamily[0] || 'Arial', [fontFamily]);

  const [fontDecorator, setFontDecorator] = useState(fontDecoration[0]);
  const [fontCase, setFontCase] = useState('capitalize');

  const [fontAlignment, setFontAlignment] = useState('horizontal');
  const [verticalAlignment, setFontVerticalAlignment] = useState('0');
  const [horizontalAlignment, setFontHorizontalAlignment] = useState('left');

  return (
    <>
      <TextStyleRow
        fontColor={firstColor}
        fontFamily={firstFontFamily}
        fontSize={fontSize[0]}
        onChangeFontFamily={useCallback(
          (value) => {
            dispatch('setTextFontName', value);
          },
          [dispatch],
        )}
        onChangeFontWeight={useCallback(
          (value) => {
            dispatch('setTextFontName', '-' + value);
          },
          [dispatch],
        )}
        onChangeFontColor={useCallback(
          (value) => dispatch('setTextColor', value),
          [dispatch],
        )}
        onChangeFontSize={useCallback(
          (value) => dispatch('setTextFontSize', value),
          [dispatch],
        )}
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
