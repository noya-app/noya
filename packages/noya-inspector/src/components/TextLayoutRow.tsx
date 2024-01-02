import { Sketch } from '@noya-app/noya-file-format';
import {
  Label,
  LabeledElementView,
  RadioGroup,
  Spacer,
} from 'noya-designsystem';
import {
  AlignCenterVerticallyIcon,
  PinBottomIcon,
  PinTopIcon,
  SquareIcon,
  StretchHorizontallyIcon,
  StretchVerticallyIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
} from 'noya-icons';
import React, { memo } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';

interface TextLayoutRowProps {
  textLayout?: Sketch.TextBehaviour;
  textHorizontalAlignment?: Sketch.TextHorizontalAlignment;
  textVerticalAlignment?: Sketch.TextVerticalAlignment;
  onChangeTextLayout: (value: Sketch.TextBehaviour) => void;
  onChangeTextHorizontalAlignment: (
    value: Sketch.TextHorizontalAlignment,
  ) => void;
  onChangeTextVerticalAlignment: (value: Sketch.TextVerticalAlignment) => void;
}

export const TextLayoutRow = memo(function TextLayoutRow({
  textLayout,
  textHorizontalAlignment,
  textVerticalAlignment,
  onChangeTextLayout,
  onChangeTextHorizontalAlignment,
  onChangeTextVerticalAlignment,
}: TextLayoutRowProps) {
  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Alignment</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <LabeledElementView
          renderLabel={() => <Label.Label>Auto Height</Label.Label>}
        >
          <RadioGroup.Root
            colorScheme="primary"
            id="text-alignment"
            value={textLayout !== undefined ? textLayout.toString() : ''}
            onValueChange={(value: string) =>
              onChangeTextLayout(parseInt(value))
            }
          >
            <RadioGroup.Item
              value={Sketch.TextBehaviour.Flexible.toString()}
              tooltip="Horizontal"
            >
              <StretchHorizontallyIcon />
            </RadioGroup.Item>
            <RadioGroup.Item
              value={Sketch.TextBehaviour.Fixed.toString()}
              tooltip="Vertical"
            >
              <StretchVerticallyIcon />
            </RadioGroup.Item>
            <RadioGroup.Item
              value={Sketch.TextBehaviour.FixedWidthAndHeight?.toString()}
              tooltip="Outside"
            >
              <SquareIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>

      <Spacer.Vertical size={8} />
      <InspectorPrimitives.Row>
        <RadioGroup.Root
          id="text-horizontal-aligment"
          value={
            textHorizontalAlignment !== undefined
              ? textHorizontalAlignment.toString()
              : ''
          }
          onValueChange={(value: string) =>
            onChangeTextHorizontalAlignment(parseInt(value))
          }
        >
          <RadioGroup.Item
            value={Sketch.TextHorizontalAlignment.Left.toString()}
            tooltip="Left"
          >
            <TextAlignLeftIcon />
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.TextHorizontalAlignment.Centered.toString()}
            tooltip="Center"
          >
            <TextAlignCenterIcon />
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.TextHorizontalAlignment.Right.toString()}
            tooltip="Right"
          >
            <TextAlignRightIcon />
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.TextHorizontalAlignment.Justified.toString()}
            tooltip="Justify"
          >
            <TextAlignJustifyIcon />
          </RadioGroup.Item>
        </RadioGroup.Root>
      </InspectorPrimitives.Row>

      <Spacer.Vertical size={8} />
      <InspectorPrimitives.Row>
        <RadioGroup.Root
          id="text-vertical-aligment"
          value={
            textVerticalAlignment !== undefined
              ? textVerticalAlignment.toString()
              : ''
          }
          onValueChange={(value: string) =>
            onChangeTextVerticalAlignment(parseInt(value))
          }
        >
          <RadioGroup.Item
            value={Sketch.TextVerticalAlignment.Top.toString()}
            tooltip="Top"
          >
            <PinTopIcon />
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.TextVerticalAlignment.Middle.toString()}
            tooltip="Middle"
          >
            <AlignCenterVerticallyIcon />
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.TextVerticalAlignment.Bottom.toString()}
            tooltip="Bottom"
          >
            <PinBottomIcon />
          </RadioGroup.Item>
        </RadioGroup.Root>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
