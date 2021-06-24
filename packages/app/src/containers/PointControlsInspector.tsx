import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  InputField,
  Label,
  LabeledElementView,
  Select,
  Spacer,
} from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import getMultiNumberValue from '../utils/getMultiNumberValue';
import getMultiValue from '../utils/getMultiValue';

const CURVE_MODE_OPTIONS = [
  'Straight' as const,
  'Mirrored' as const,
  'Asymmetric' as const,
  'Disconnected' as const,
];

type CurveModeOption = typeof CURVE_MODE_OPTIONS[0] | 'None';

function getCurveMode(value: CurveModeOption): Sketch.CurveMode {
  switch (value) {
    case 'None':
      return Sketch.CurveMode.None;
    case 'Straight':
      return Sketch.CurveMode.Straight;
    case 'Mirrored':
      return Sketch.CurveMode.Mirrored;
    case 'Disconnected':
      return Sketch.CurveMode.Disconnected;
    case 'Asymmetric':
      return Sketch.CurveMode.Asymmetric;
  }
}

function getCurveModeString(value: Sketch.CurveMode): CurveModeOption {
  switch (value) {
    case Sketch.CurveMode.None:
      return 'None';
    case Sketch.CurveMode.Straight:
      return 'Straight';
    case Sketch.CurveMode.Mirrored:
      return 'Mirrored';
    case Sketch.CurveMode.Disconnected:
      return 'Disconnected';
    case Sketch.CurveMode.Asymmetric:
      return 'Asymmetric';
  }
}

export default memo(function PointControlsInspector() {
  const [state, dispatch] = useApplicationState();

  const controlPoint = Selectors.getSelectedControlPoint(state);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const points = controlPoint
    ? [controlPoint]
    : Selectors.getSelectedPoints(state);

  const curveMode = useMemo(() => {
    const value = getMultiValue(points.map((point) => point.curveMode));

    return value ?? Sketch.CurveMode.None;
  }, [points]);

  const cornerRadius = getMultiNumberValue(
    points.map((point) => point.cornerRadius),
  );

  const handleSubmitRadius = useCallback(
    (value: number) => dispatch('setPointCornerRadius', value, 'replace'),
    [dispatch],
  );

  const handleNudgeRadius = useCallback(
    (value: number) => dispatch('setPointCornerRadius', value, 'adjust'),
    [dispatch],
  );

  const pointTypeId = 'point-type';
  const pointRadiusInputId = 'point-radius';

  const renderLabel = useCallback(({ id }) => {
    switch (id) {
      case pointTypeId:
        return <Label.Label>Point Type</Label.Label>;
      case pointRadiusInputId:
        return <Label.Label>Radius</Label.Label>;
      default:
        return null;
    }
  }, []);

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Point Controls</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <Spacer.Vertical size={4} />
      <InspectorPrimitives.Row>
        <LabeledElementView renderLabel={renderLabel}>
          <Select
            id={pointTypeId}
            value={getCurveModeString(curveMode) ?? 'None'}
            options={CURVE_MODE_OPTIONS}
            onChange={useCallback(
              (value: CurveModeOption) => {
                if (value === 'None') return;

                dispatch('setPointCurveMode', getCurveMode(value));
              },
              [dispatch],
            )}
          />
          <Spacer.Horizontal size={10} />
          <InputField.Root id={pointRadiusInputId} size={50}>
            <InputField.NumberInput
              value={cornerRadius}
              placeholder={cornerRadius === undefined ? 'multi' : undefined}
              onSubmit={handleSubmitRadius}
              onNudge={handleNudgeRadius}
            />
          </InputField.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
