import { useApplicationState } from 'noya-app-state-context';
import { InputField, Slider, Spacer } from 'noya-designsystem';
import { useShallowArray } from 'noya-react-utils';
import {
  getElementLayerForObjectPath,
  getMultiNumberValue,
  getSelectedElementLayerPaths,
  Selectors,
} from 'noya-state';
import {
  getAttributeValue,
  parseIntSafe,
  useTypescriptCompiler,
} from 'noya-typescript';
import { memo, useCallback, useMemo } from 'react';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';

export default memo(function RadiusInspector() {
  const [state, dispatch] = useApplicationState();

  const compiler = useTypescriptCompiler();
  const selectedElementPaths = getSelectedElementLayerPaths(state);
  const elementLayers = selectedElementPaths.flatMap((elementPath) => {
    const elementLayer = getElementLayerForObjectPath(
      compiler.environment,
      elementPath,
    );
    return elementLayer ? [elementLayer] : [];
  });

  const selectedLayers = useShallowArray(
    Selectors.getSelectedLayersWithFixedRadius(state),
  );

  const radiusValue = useMemo(
    () =>
      getMultiNumberValue([
        ...selectedLayers.flatMap((layer) => layer.fixedRadius),
        ...elementLayers.map(
          (elementLayer) =>
            parseIntSafe(
              getAttributeValue(elementLayer.attributes, 'borderRadius'),
            ) ?? 0,
        ),
      ]),
    [elementLayers, selectedLayers],
  );

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
            <InputField.Root id="radius-input" size={50}>
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
