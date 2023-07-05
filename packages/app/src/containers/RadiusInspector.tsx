import { useApplicationState, useSelector } from 'noya-app-state-context';
import { InputField, Slider, Spacer } from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import { useShallowArray } from 'noya-react-utils';
import { Selectors, getMultiNumberValue } from 'noya-state';
import React, { memo, useCallback, useMemo } from 'react';

export default memo(function RadiusInspector() {
  const [, dispatch] = useApplicationState();

  const selectedLayers = useShallowArray(
    useSelector(Selectors.getSelectedLayersWithFixedRadius),
  );

  const radii = useShallowArray(
    selectedLayers.flatMap((layer) => layer.fixedRadius),
  );

  const radiusValue = useMemo(() => getMultiNumberValue(radii), [radii]);

  const handleSubmitRadius = useCallback(
    (value: number) => {
      dispatch('setFixedRadius', value, 'replace');
    },
    [dispatch],
  );

  const handleNudgeRadius = useCallback(
    (value: number) => {
      dispatch('setFixedRadius', value, 'adjust');
    },
    [dispatch],
  );

  return useMemo(() => {
    const roundedValue =
      radiusValue !== undefined ? Math.round(radiusValue) : undefined;

    return (
      <>
        <InspectorPrimitives.Section>
          <InspectorPrimitives.SectionHeader>
            <InspectorPrimitives.Title>Radius</InspectorPrimitives.Title>
          </InspectorPrimitives.SectionHeader>
          <Spacer.Vertical size={4} />
          <InspectorPrimitives.Row>
            <Slider
              id="radius-slider"
              value={roundedValue ?? 0}
              onValueChange={handleSubmitRadius}
              min={0}
              max={100}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <InputField.Root id="radius-input" width={50}>
              <InputField.NumberInput
                value={roundedValue}
                placeholder={roundedValue === undefined ? 'multi' : undefined}
                onSubmit={handleSubmitRadius}
                onNudge={handleNudgeRadius}
              />
            </InputField.Root>
          </InspectorPrimitives.Row>
        </InspectorPrimitives.Section>
      </>
    );
  }, [radiusValue, handleSubmitRadius, handleNudgeRadius]);
});
