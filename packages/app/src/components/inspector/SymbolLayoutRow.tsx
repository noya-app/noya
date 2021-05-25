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
import { memo, useCallback, useMemo } from 'react';
import * as InspectorPrimitives from './InspectorPrimitives';

interface Props {
  groupLayout?: Sketch.FreeformGroupLayout | Sketch.InferredGroupLayout;
  setGroupLayout: (value: Sketch.InferredLayoutAxis | '') => void;
  setLayoutAnchor: (value: Sketch.InferredLayoutAnchor) => void;
  setMinWidth: (value: number) => void;
}

export default memo(function SymbolInspector({
  groupLayout,
  setMinWidth,
  setGroupLayout,
  setLayoutAnchor,
}: Props) {
  const layoutValue = useMemo(() => {
    return !groupLayout ||
      groupLayout._class === 'MSImmutableFreeformGroupLayout'
      ? ''
      : groupLayout.axis;
  }, [groupLayout]);

  const layoutAnchor = useMemo(() => {
    return !groupLayout ||
      groupLayout?._class === 'MSImmutableFreeformGroupLayout'
      ? ''
      : groupLayout.layoutAnchor;
  }, [groupLayout]);

  const minWidth =
    !groupLayout || groupLayout?._class === 'MSImmutableFreeformGroupLayout'
      ? undefined
      : groupLayout.minSize;

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

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Title>Layout</InspectorPrimitives.Title>
      <Spacer.Vertical size={4} />
      <InspectorPrimitives.Row>
        <RadioGroup.Root
          value={layoutValue.toString()}
          onValueChange={(event) =>
            setGroupLayout(parseInt(event.target.value))
          }
        >
          <RadioGroup.Item value={''}>None</RadioGroup.Item>
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
            id={`${layoutValue}-${layoutAnchor}`}
            value={layoutAnchor.toString()}
            onValueChange={(event) =>
              setLayoutAnchor(parseInt(event.target.value))
            }
          >
            <RadioGroup.Item
              value={Sketch.InferredLayoutAnchor.Min.toString()}
              disabled={layoutValue === ''}
            >
              {layoutValue === '' ||
              layoutValue === Sketch.InferredLayoutAxis.Horizontal ? (
                <PinRightIcon />
              ) : (
                <PinBottomIcon />
              )}
            </RadioGroup.Item>
            <RadioGroup.Item
              disabled={layoutValue === ''}
              value={Sketch.InferredLayoutAnchor.Middle.toString()}
            >
              {layoutValue === '' ||
              layoutValue === Sketch.InferredLayoutAxis.Horizontal ? (
                <SpaceEvenlyHorizontallyIcon />
              ) : (
                <SpaceEvenlyVerticallyIcon />
              )}
            </RadioGroup.Item>
            <RadioGroup.Item
              disabled={layoutValue === ''}
              value={Sketch.InferredLayoutAnchor.Max.toString()}
            >
              {layoutValue === '' ||
              layoutValue === Sketch.InferredLayoutAxis.Horizontal ? (
                <PinLeftIcon />
              ) : (
                <PinTopIcon />
              )}
            </RadioGroup.Item>
          </RadioGroup.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>
      <Spacer.Vertical size={6} />
      {groupLayout && groupLayout._class === 'MSImmutableInferredGroupLayout' && (
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
                onSubmit={setMinWidth}
                onNudge={() => {}}
              />
            </InputField.Root>
          </InspectorPrimitives.Row>
        </>
      )}
    </InspectorPrimitives.Section>
  );
});
