import {
  LetterCaseCapitalizeIcon,
  LetterCaseLowercaseIcon,
  LetterCaseUppercaseIcon,
} from '@radix-ui/react-icons';
import Sketch from 'noya-file-format';
import {
  Label,
  LabeledElementView,
  RadioGroup,
  Select,
} from 'noya-designsystem';
import { SimpleTextDecoration } from 'noya-state';
import { memo, useCallback } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';

interface TextOptionsRowProps {
  textTransform?: Sketch.TextTransform;
  textDecoration?: SimpleTextDecoration;
  onChangeTextTransform: (value: Sketch.TextTransform) => void;
  onChangeTextDecoration: (value: SimpleTextDecoration) => void;
}

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const TextDecorationOptions: SimpleTextDecoration[] = [
  'none',
  'underline',
  'strikethrough',
];

const decorationInputId = `decoration`;
const transformInputId = `transform`;

export default memo(function TextOptionsRow({
  textTransform,
  textDecoration,
  onChangeTextTransform,
  onChangeTextDecoration,
}: TextOptionsRowProps) {
  const renderLabel = useCallback(({ id }) => {
    switch (id) {
      case decorationInputId:
        return <Label.Label>Decoration</Label.Label>;
      case transformInputId:
        return <Label.Label>Transform</Label.Label>;
      default:
        return null;
    }
  }, []);

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Text Options</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <LabeledElementView renderLabel={renderLabel}>
          <Select<SimpleTextDecoration>
            id={decorationInputId}
            value={textDecoration ?? 'none'}
            options={TextDecorationOptions}
            getTitle={capitalize}
            onChange={onChangeTextDecoration}
          />
          <InspectorPrimitives.HorizontalSeparator />
          <RadioGroup.Root
            id={transformInputId}
            value={textTransform !== undefined ? textTransform.toString() : ''}
            onValueChange={useCallback(
              (event) => onChangeTextTransform(parseInt(event.target.value)),
              [onChangeTextTransform],
            )}
          >
            <RadioGroup.Item
              value={Sketch.TextTransform.None.toString()}
              tooltip="None"
            >
              <LetterCaseCapitalizeIcon />
            </RadioGroup.Item>
            <RadioGroup.Item
              value={Sketch.TextTransform.Uppercase.toString()}
              tooltip="Uppercase"
            >
              <LetterCaseUppercaseIcon />
            </RadioGroup.Item>
            <RadioGroup.Item
              value={Sketch.TextTransform.Lowercase.toString()}
              tooltip="Lowercase"
            >
              <LetterCaseLowercaseIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
