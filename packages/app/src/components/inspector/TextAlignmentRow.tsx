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
} from '@radix-ui/react-icons';
import { Label, RadioGroup, LabeledElementView } from 'noya-designsystem';
import { Spacer } from 'noya-designsystem';
import { memo } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';

interface TextAligmentRowProps {
  fontAlignment: number;
  fontHorizontalAlignment: number;
  fontVerticalAlignment: number;
  onChangeFontAlignment: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeFontHorizontalAlignment: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onChangeFontVerticalAlignment: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export default memo(function TextAlignmentRow({
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
            value={fontAlignment.toString()}
            onValueChange={onChangeFontAlignment}
          >
            <RadioGroup.Item value="0" tooltip="Horizontal">
              <StretchHorizontallyIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="1" tooltip="Vertical">
              <StretchVerticallyIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="2" tooltip="Outside">
              <SquareIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>

      <Spacer.Vertical size={8} />
      <InspectorPrimitives.Row>
        <RadioGroup.Root
          id={'text-horizontal-aligment'}
          value={fontHorizontalAlignment.toString()}
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
          value={fontVerticalAlignment.toString()}
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
