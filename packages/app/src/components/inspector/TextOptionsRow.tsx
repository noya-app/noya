import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  LetterCaseLowercaseIcon,
  LetterCaseCapitalizeIcon,
  LetterCaseUppercaseIcon,
} from '@radix-ui/react-icons';
import {
  Label,
  Select,
  RadioGroup,
  LabeledElementView,
} from 'noya-designsystem';
import { Spacer } from 'noya-designsystem';
import { useCallback, useMemo, memo } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';

export type SimpleTextDecoration = 'none' | 'underline' | 'strikethrough';

interface TextOptionsRowProps {
  textCase?: Sketch.TextTransform;
  textDecorator?: SimpleTextDecoration;
  onChangeTextCase: (value: Sketch.TextTransform) => void;
  onChangeTextDecorator: (value: number) => void;
}

export default memo(function TextOptionsRow({
  textCase,
  textDecorator,
  onChangeTextCase,
  onChangeTextDecorator,
}: TextOptionsRowProps) {
  const decoratorInputId = `decorator`;
  const transformInputId = `transform`;

  const decorator = useMemo(
    () => [
      { id: 0, name: 'None' },
      { id: 1, name: 'Underline' },
      { id: 2, name: 'Strikethrough' },
    ],
    [],
  );

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

  const onChangeDecorator = useCallback(
    (value) => {
      const id = decorator.find((d) => d.name === value)?.id || 0;
      onChangeTextDecorator(id);
    },
    [onChangeTextDecorator, decorator],
  );

  const textDecoratorCapitalize = textDecorator
    ? textDecorator.charAt(0).toUpperCase() + textDecorator.slice(1)
    : '';

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
            value={textDecoratorCapitalize}
            options={decorator.map((d) => d.name)}
            getTitle={(name) => name}
            onChange={onChangeDecorator}
          />
          <Spacer.Horizontal size={8} />
          <RadioGroup.Root
            id={transformInputId}
            value={textCase !== undefined ? textCase.toString() : ''}
            onValueChange={(event) =>
              onChangeTextCase(parseInt(event.target.value))
            }
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
