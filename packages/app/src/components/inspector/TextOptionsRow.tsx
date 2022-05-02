import { memo, useCallback } from 'react';

import { LabeledView, RadioGroup, Select, Layout } from 'noya-designsystem';
import { SimpleTextDecoration } from 'noya-state';
import Sketch from 'noya-file-format';
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
  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Text Options</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <LabeledView label="Decoration">
          <Select<SimpleTextDecoration>
            id={decorationInputId}
            value={textDecoration ?? 'none'}
            options={TextDecorationOptions}
            getTitle={capitalize}
            onChange={onChangeTextDecoration}
          />
        </LabeledView>
        <InspectorPrimitives.HorizontalSeparator />
        <LabeledView label="Transform">
          <RadioGroup.Root
            id={transformInputId}
            value={textTransform !== undefined ? textTransform.toString() : ''}
            onValueChange={useCallback(
              (value: string) => onChangeTextTransform(parseInt(value)),
              [onChangeTextTransform],
            )}
          >
            <RadioGroup.Item
              value={Sketch.TextTransform.None.toString()}
              tooltip="None"
            >
              <Layout.Icon name="letter-case-capitalize" />
            </RadioGroup.Item>
            <RadioGroup.Item
              value={Sketch.TextTransform.Uppercase.toString()}
              tooltip="Uppercase"
            >
              <Layout.Icon name="letter-case-uppercase" />
            </RadioGroup.Item>
            <RadioGroup.Item
              value={Sketch.TextTransform.Lowercase.toString()}
              tooltip="Lowercase"
            >
              <Layout.Icon name="letter-case-lowercase" />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledView>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
