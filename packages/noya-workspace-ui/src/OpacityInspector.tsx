import React, { memo, useCallback, useMemo } from 'react';

import { useApplicationState, useSelector } from 'noya-app-state-context';
import { Slider, Layout, InputField } from 'noya-designsystem';
import { getMultiNumberValue, Selectors } from 'noya-state';
import { useShallowArray } from 'noya-react-utils';
import { Primitives } from './primitives';

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
        <Primitives.Section>
          <Primitives.SectionHeader>
            <Primitives.Title>Opacity</Primitives.Title>
          </Primitives.SectionHeader>
          <Layout.Stack size={4} />
          <Primitives.Row>
            <Slider
              id="opacity-slider"
              value={roundedValue ?? 0}
              onValueChange={handleSubmitOpacity}
              min={0}
              max={100}
            />
            <Primitives.HorizontalSeparator />
            <InputField.Root id="opacity-input" size={50}>
              <InputField.NumberInput
                value={roundedValue}
                placeholder={roundedValue === undefined ? 'multi' : undefined}
                onSubmit={handleSubmitOpacity}
                onNudge={handleNudgeOpacity}
              />
              <InputField.Label>%</InputField.Label>
            </InputField.Root>
          </Primitives.Row>
        </Primitives.Section>
      </>
    );
  }, [opacityValue, handleSubmitOpacity, handleNudgeOpacity]);
});
