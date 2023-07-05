import { useApplicationState, useSelector } from 'noya-app-state-context';
import { InputField, Slider, Spacer } from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import { useShallowArray } from 'noya-react-utils';
import { Selectors, getMultiNumberValue } from 'noya-state';
import React, { memo, useCallback, useMemo } from 'react';

export default memo(function OpacityInspector() {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );

  const contextSettings = useShallowArray(
    selectedStyles.flatMap((style) =>
      style?.contextSettings ? [style.contextSettings] : [],
    ),
  );

  const opacityValue = useMemo(
    () => getMultiNumberValue(contextSettings.map((item) => item.opacity)),
    [contextSettings],
  );

  const handleSubmitOpacity = useCallback(
    (value: number) => {
      dispatch('setOpacity', value / 100, 'replace');
    },
    [dispatch],
  );

  const handleNudgeOpacity = useCallback(
    (value: number) => {
      dispatch('setOpacity', value / 100, 'adjust');
    },
    [dispatch],
  );

  return useMemo(() => {
    const roundedValue =
      opacityValue !== undefined ? Math.round(opacityValue * 100) : undefined;

    return (
      <>
        <InspectorPrimitives.Section>
          <InspectorPrimitives.SectionHeader>
            <InspectorPrimitives.Title>Opacity</InspectorPrimitives.Title>
          </InspectorPrimitives.SectionHeader>
          <Spacer.Vertical size={4} />
          <InspectorPrimitives.Row>
            <Slider
              id="opacity-slider"
              value={roundedValue ?? 0}
              onValueChange={handleSubmitOpacity}
              min={0}
              max={100}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <InputField.Root id="opacity-input" width={50}>
              <InputField.NumberInput
                value={roundedValue}
                placeholder={roundedValue === undefined ? 'multi' : undefined}
                onSubmit={handleSubmitOpacity}
                onNudge={handleNudgeOpacity}
              />
              <InputField.Label>%</InputField.Label>
            </InputField.Root>
          </InspectorPrimitives.Row>
        </InspectorPrimitives.Section>
      </>
    );
  }, [opacityValue, handleSubmitOpacity, handleNudgeOpacity]);
});
