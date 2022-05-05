import { memo } from 'react';

import Sketch from 'noya-file-format';
import { Layout, RadioGroup, LabeledView } from 'noya-designsystem';
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

export default memo(function TextLayoutRowRow({
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
        <LabeledView label="Auto Height">
          <RadioGroup.Root
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
              <Layout.Icon name="stretch-horizontally" />
            </RadioGroup.Item>
            <RadioGroup.Item
              value={Sketch.TextBehaviour.Fixed.toString()}
              tooltip="Vertical"
            >
              <Layout.Icon name="stretch-vertically" />
            </RadioGroup.Item>
            <RadioGroup.Item
              value={Sketch.TextBehaviour.FixedWidthAndHeight?.toString()}
              tooltip="Outside"
            >
              <Layout.Icon name="square" />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledView>
      </InspectorPrimitives.Row>

      <Layout.Stack size={8} />
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
            <Layout.Icon name="text-align-left" />
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.TextHorizontalAlignment.Centered.toString()}
            tooltip="Center"
          >
            <Layout.Icon name="text-align-center" />
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.TextHorizontalAlignment.Right.toString()}
            tooltip="Right"
          >
            <Layout.Icon name="text-align-right" />
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.TextHorizontalAlignment.Justified.toString()}
            tooltip="Justify"
          >
            <Layout.Icon name="text-align-justify" />
          </RadioGroup.Item>
        </RadioGroup.Root>
      </InspectorPrimitives.Row>

      <Layout.Stack size={8} />
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
            <Layout.Icon name="pin-top" />
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.TextVerticalAlignment.Middle.toString()}
            tooltip="Middle"
          >
            <Layout.Icon name="align-center-vertically" />
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.TextVerticalAlignment.Bottom.toString()}
            tooltip="Bottom"
          >
            <Layout.Icon name="pin-bottom" />
          </RadioGroup.Item>
        </RadioGroup.Root>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
