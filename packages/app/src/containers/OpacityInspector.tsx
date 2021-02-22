import { Selectors } from 'ayano-state';
import { memo, useCallback, useMemo } from 'react';
import * as InputField from '../components/InputField';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import Slider from '../components/Slider';
import * as Spacer from '../components/Spacer';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import getMultiValue from '../utils/getMultiValue';

export default memo(function OpacityInspector() {
  const [, dispatch] = useApplicationState();

  const selectedLayers = useShallowArray(
    useSelector(Selectors.getSelectedLayersWithContextSettings),
  );

  const contextSettings = useShallowArray(
    selectedLayers.flatMap((layer) =>
      layer.style?.contextSettings ? [layer.style.contextSettings] : [],
    ),
  );

  const opacityValue = useMemo(
    () => getMultiValue(contextSettings.map((item) => item.opacity)),
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
            <Spacer.Horizontal size={10} />
            <InputField.Root id="opacity-input" size={50}>
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
