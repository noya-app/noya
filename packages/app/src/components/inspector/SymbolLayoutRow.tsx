import { memo, useCallback, useMemo } from 'react';

import { Layout, RadioGroup, InputField, LabeledView } from 'noya-designsystem';
import { GroupLayouts, SetNumberMode } from 'noya-state';
import Sketch from 'noya-file-format';
import * as InspectorPrimitives from './InspectorPrimitives';

interface Props {
  groupLayout?: Sketch.FreeformGroupLayout | Sketch.InferredGroupLayout;
  setLayoutAxis: (value: Sketch.InferredLayoutAxis | undefined) => void;
  setLayoutAnchor: (value: Sketch.InferredLayoutAnchor) => void;
  setMinWidth: (value: number, mode: SetNumberMode) => void;
}

export default memo(function SymbolLayoutRow({
  groupLayout,
  setMinWidth,
  setLayoutAxis,
  setLayoutAnchor,
}: Props) {
  const inferredLayout =
    groupLayout && GroupLayouts.isInferredLayout(groupLayout)
      ? groupLayout
      : undefined;

  const layoutAxis =
    inferredLayout?.axis ?? Sketch.InferredLayoutAxis.Horizontal;

  const layoutAnchor = inferredLayout?.layoutAnchor;
  const minWidth = inferredLayout?.minSize;
  const isAnchorDisabled = inferredLayout === undefined;

  const radioLabel = useMemo(() => {
    if (!layoutAxis || !layoutAnchor) {
      return '';
    }

    return {
      '00': 'Left to Right',
      '01': 'Center',
      '02': 'Right to Left',
      '10': 'Top to Bottom',
      '11': 'Middle',
      '12': 'Bottom to Top',
    }[`${layoutAxis}${layoutAnchor}`];
  }, [layoutAxis, layoutAnchor]);

  const handleNudgeMinWidth = useCallback(
    (value: number) => setMinWidth(value, 'adjust'),
    [setMinWidth],
  );

  const handleSetMinWidth = useCallback(
    (value) => setMinWidth(value, 'replace'),
    [setMinWidth],
  );

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Layout</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <RadioGroup.Root
          value={isAnchorDisabled ? 'none' : layoutAxis?.toString()}
          onValueChange={useCallback(
            (value: string) =>
              setLayoutAxis(value === 'none' ? undefined : parseInt(value)),
            [setLayoutAxis],
          )}
        >
          <RadioGroup.Item value={'none'}>None</RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.InferredLayoutAxis.Horizontal.toString()}
          >
            Horizontal
          </RadioGroup.Item>
          <RadioGroup.Item
            value={Sketch.InferredLayoutAxis.Vertical.toString()}
          >
            Vertical
          </RadioGroup.Item>
        </RadioGroup.Root>
      </InspectorPrimitives.Row>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <LabeledView label={radioLabel}>
          <RadioGroup.Root
            id={`${layoutAxis}-${layoutAnchor}`}
            value={isAnchorDisabled ? '' : layoutAnchor?.toString() ?? ''}
            onValueChange={useCallback(
              (value: string) => setLayoutAnchor(parseInt(value)),
              [setLayoutAnchor],
            )}
          >
            <RadioGroup.Item
              value={Sketch.InferredLayoutAnchor.Min.toString()}
              disabled={isAnchorDisabled}
            >
              {isAnchorDisabled ||
              layoutAxis === Sketch.InferredLayoutAxis.Horizontal ? (
                <Layout.Icon name="pin-right" />
              ) : (
                <Layout.Icon name="pin-bottom" />
              )}
            </RadioGroup.Item>
            <RadioGroup.Item
              disabled={isAnchorDisabled}
              value={Sketch.InferredLayoutAnchor.Middle.toString()}
            >
              {isAnchorDisabled ||
              layoutAxis === Sketch.InferredLayoutAxis.Horizontal ? (
                <Layout.Icon name="space-evenly-horizontally" />
              ) : (
                <Layout.Icon name="space-evenly-vertically" />
              )}
            </RadioGroup.Item>
            <RadioGroup.Item
              disabled={isAnchorDisabled}
              value={Sketch.InferredLayoutAnchor.Max.toString()}
            >
              {isAnchorDisabled ||
              layoutAxis === Sketch.InferredLayoutAxis.Horizontal ? (
                <Layout.Icon name="pin-left" />
              ) : (
                <Layout.Icon name="pin-top" />
              )}
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledView>
      </InspectorPrimitives.Row>
      <InspectorPrimitives.VerticalSeparator />
      {!isAnchorDisabled && (
        <>
          <InspectorPrimitives.VerticalSeparator />
          <Layout.Divider />
          <InspectorPrimitives.VerticalSeparator />
          <InspectorPrimitives.Row>
            <InspectorPrimitives.Text>Minimum Width</InspectorPrimitives.Text>
            <Layout.Queue size={75} />
            <InputField.Root id="font-size" size={70}>
              <InputField.NumberInput
                placeholder={'None'}
                value={minWidth}
                onSubmit={handleSetMinWidth}
                onNudge={handleNudgeMinWidth}
              />
            </InputField.Root>
          </InspectorPrimitives.Row>
        </>
      )}
    </InspectorPrimitives.Section>
  );
});
