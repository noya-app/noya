import React, { memo, useCallback, useMemo } from 'react';

import { useApplicationState, useSelector } from 'noya-app-state-context';
import { Slider, Layout, InputField } from 'noya-designsystem';
import { getMultiNumberValue, Selectors } from 'noya-state';
import { useShallowArray } from 'noya-react-utils';
import { Primitives } from './primitives';

function RadiusInspector() {
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
      <Primitives.Section>
        <Primitives.SectionHeader>
          <Primitives.Title>Radius</Primitives.Title>
        </Primitives.SectionHeader>
        <Layout.Stack size={4} />
        <Primitives.Row>
          <Slider
            id="radius-slider"
            value={roundedValue ?? 0}
            onValueChange={handleSubmitRadius}
            min={0}
            max={100}
          />
          <Primitives.HorizontalSeparator />
          <InputField.Root id="radius-input" size={50}>
            <InputField.NumberInput
              value={roundedValue}
              placeholder={roundedValue === undefined ? 'multi' : undefined}
              onSubmit={handleSubmitRadius}
              onNudge={handleNudgeRadius}
            />
          </InputField.Root>
        </Primitives.Row>
      </Primitives.Section>
    );
  }, [radiusValue, handleSubmitRadius, handleNudgeRadius]);
}

export default memo(RadiusInspector);
