import {
  PinBottomIcon,
  PinLeftIcon,
  PinRightIcon,
  PinTopIcon,
  SpaceEvenlyHorizontallyIcon,
  SpaceEvenlyVerticallyIcon,
} from '@radix-ui/react-icons';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Divider,
  Label,
  RadioGroup,
  Spacer,
  InputField,
  LabeledElementView,
} from 'noya-designsystem';
import { GroupLayouts, SetNumberMode } from 'noya-state';
import { memo, useCallback } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';

interface Props {
  groupLayout?: Sketch.FreeformGroupLayout | Sketch.InferredGroupLayout;
  setLayoutAxis: (value: Sketch.InferredLayoutAxis | undefined) => void;
  setLayoutAnchor: (value: Sketch.InferredLayoutAnchor) => void;
  setMinWidth: (value: number, mode: SetNumberMode) => void;
}

export default memo(function SymbolInspector({
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

  const renderLabel = useCallback(({ id }) => {
    switch (id) {
      case '0-0':
        return <Label.Label>Left to Right</Label.Label>;
      case '0-1':
        return <Label.Label>Center</Label.Label>;
      case '0-2':
        return <Label.Label>Right to Left</Label.Label>;
      case '1-0':
        return <Label.Label>Top to Bottom</Label.Label>;
      case '1-1':
        return <Label.Label>Middle</Label.Label>;
      case '1-2':
        return <Label.Label>Bottom to Top</Label.Label>;
      default:
        return <Label.Label></Label.Label>;
    }
  }, []);

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
      <InspectorPrimitives.Title>Layout</InspectorPrimitives.Title>
      <Spacer.Vertical size={4} />
      <InspectorPrimitives.Row>
        <RadioGroup.Root
          value={isAnchorDisabled ? 'none' : layoutAxis?.toString()}
          onValueChange={useCallback(
            (event) =>
              setLayoutAxis(
                event.target.value === 'none'
                  ? undefined
                  : parseInt(event.target.value),
              ),
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
      <Spacer.Vertical size={6} />

      <InspectorPrimitives.Row>
        <LabeledElementView renderLabel={renderLabel}>
          <RadioGroup.Root
            id={`${layoutAxis}-${layoutAnchor}`}
            value={isAnchorDisabled ? undefined : layoutAnchor?.toString()}
            onValueChange={useCallback(
              (event) => setLayoutAnchor(parseInt(event.target.value)),
              [setLayoutAnchor],
            )}
          >
            <RadioGroup.Item
              value={Sketch.InferredLayoutAnchor.Min.toString()}
              disabled={isAnchorDisabled}
            >
              {isAnchorDisabled ||
              layoutAxis === Sketch.InferredLayoutAxis.Horizontal ? (
                <PinRightIcon />
              ) : (
                <PinBottomIcon />
              )}
            </RadioGroup.Item>
            <RadioGroup.Item
              disabled={isAnchorDisabled}
              value={Sketch.InferredLayoutAnchor.Middle.toString()}
            >
              {isAnchorDisabled ||
              layoutAxis === Sketch.InferredLayoutAxis.Horizontal ? (
                <SpaceEvenlyHorizontallyIcon />
              ) : (
                <SpaceEvenlyVerticallyIcon />
              )}
            </RadioGroup.Item>
            <RadioGroup.Item
              disabled={isAnchorDisabled}
              value={Sketch.InferredLayoutAnchor.Max.toString()}
            >
              {isAnchorDisabled ||
              layoutAxis === Sketch.InferredLayoutAxis.Horizontal ? (
                <PinLeftIcon />
              ) : (
                <PinTopIcon />
              )}
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={6} />
      {!isAnchorDisabled && (
        <>
          <Spacer.Vertical size={6} />
          <Divider />
          <Spacer.Vertical size={6} />
          <InspectorPrimitives.Row>
            <InspectorPrimitives.Text>Minimum Width</InspectorPrimitives.Text>
            <Spacer.Horizontal size={75} />
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
