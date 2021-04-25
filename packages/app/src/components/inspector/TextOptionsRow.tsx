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
import { useCallback, memo } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';

interface TextOptionsRowProps {
  fontCase: string;
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
