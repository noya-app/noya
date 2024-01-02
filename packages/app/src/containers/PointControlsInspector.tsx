import { Sketch } from '@noya-app/noya-file-format';
import { useApplicationState } from 'noya-app-state-context';
import {
  Button,
  InputField,
  Label,
  LabeledElementView,
  Select,
  Spacer,
} from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import {
  Layers,
  Selectors,
  getMultiNumberValue,
  getMultiValue,
} from 'noya-state';
import React, { memo, useCallback } from 'react';

const CURVE_MODE_OPTIONS = [
  'Straight' as const,
  'Mirrored' as const,
  'Asymmetric' as const,
  'Disconnected' as const,
];

type CurveModeOption = (typeof CURVE_MODE_OPTIONS)[0] | 'None';

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

  const selectedLayerIds = Object.keys(state.selectedPointLists);

  const selectedLayers = Layers.findAll(
    Selectors.getCurrentPage(state),
    (layer) => selectedLayerIds.includes(layer.do_objectID),
  ).filter((layer): layer is Layers.PointsLayer => Layers.isPointsLayer(layer));

  const isClosed =
    getMultiValue(selectedLayers.map((layer) => layer.isClosed)) ?? true;

  const controlPoint = Selectors.getCurvePointForSelectedControlPoint(state);
  const points = controlPoint
    ? [controlPoint]
    : Selectors.getSelectedPoints(state);

  const curveMode =
    getMultiValue(points.map((point) => point.curveMode)) ||
    Sketch.CurveMode.None;

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
          <InspectorPrimitives.HorizontalSeparator />
          <InputField.Root id={pointRadiusInputId} width={50}>
            <InputField.NumberInput
              value={cornerRadius}
              placeholder={cornerRadius === undefined ? 'multi' : undefined}
              onSubmit={handleSubmitRadius}
              onNudge={handleNudgeRadius}
            />
          </InputField.Root>
        </LabeledElementView>
      </InspectorPrimitives.Row>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.Row>
        <InspectorPrimitives.Column>
          <Button
            id="toggle-path-is-closed"
            disabled={selectedLayers.length === 0}
            onClick={useCallback(() => {
              dispatch('setIsClosed', !isClosed);
            }, [dispatch, isClosed])}
          >
            {isClosed ? 'Open Path' : 'Close Path'}
          </Button>
        </InspectorPrimitives.Column>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
