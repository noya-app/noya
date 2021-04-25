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

interface TextOptionsRowProps {
  fontCase: number;
  fontDecorator: number;
  onChangeFontCase: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeFontDecorator: (value: number) => void;
}

export default memo(function TextOptionsRow({
  fontCase,
  fontDecorator,
  onChangeFontCase,
  onChangeFontDecorator,
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
      onChangeFontDecorator(id);
    },
    [onChangeFontDecorator, decorator],
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
            value={decorator[fontDecorator].name}
            options={decorator.map((d) => d.name)}
            getTitle={(name) => name}
            onChange={onChangeDecorator}
          />
          <Spacer.Horizontal size={8} />
          <RadioGroup.Root
            id={transformInputId}
            value={fontCase.toString()}
            onValueChange={onChangeFontCase}
          >
            <RadioGroup.Item value="0" tooltip="None">
              <LetterCaseCapitalizeIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="1" tooltip="Uppercase">
              <LetterCaseUppercaseIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="2" tooltip="Lowercase">
              <LetterCaseLowercaseIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
