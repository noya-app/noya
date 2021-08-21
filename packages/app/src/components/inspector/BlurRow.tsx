import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Select } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { invert } from 'noya-utils';
import { memo, useCallback } from 'react';
import { DimensionValue } from './DimensionsInspector';
import { DimensionSliderRow } from './DimensionSliderRow';
import * as InspectorPrimitives from './InspectorPrimitives';

const BLUR_NAME_TO_ENUM = {
  Gaussian: Sketch.BlurType.Gaussian,
  Motion: Sketch.BlurType.Motion,
  Zoom: Sketch.BlurType.Zoom,
  Background: Sketch.BlurType.Background,
} as const;

const BLUR_ENUM_TO_NAME = invert(BLUR_NAME_TO_ENUM);

interface Props {
  id: string;
  supportedBlurTypes: (keyof typeof BLUR_NAME_TO_ENUM)[];
  blurType: Sketch.BlurType;
  blurRadius: DimensionValue;
  onChangeBlurType: (value: Sketch.BlurType) => void;
  onChangeBlurRadius: (value: number, mode: SetNumberMode) => void;
}

export default memo(function BlursRow({
  id,
  supportedBlurTypes,
  blurType,
  blurRadius,
  onChangeBlurType,
  onChangeBlurRadius,
}: Props) {
  return (
    <InspectorPrimitives.Column id={id}>
      <InspectorPrimitives.LabeledRow label="Type">
        <Select<keyof typeof BLUR_NAME_TO_ENUM>
          id="blue-type-input"
          value={BLUR_ENUM_TO_NAME[blurType]}
          options={supportedBlurTypes}
          onChange={useCallback(
            (name) => onChangeBlurType(BLUR_NAME_TO_ENUM[name]),
            [onChangeBlurType],
          )}
        />
      </InspectorPrimitives.LabeledRow>
      <InspectorPrimitives.VerticalSeparator />
      <DimensionSliderRow
        id="blur-radius-input"
        label="Radius"
        value={blurRadius}
        min={0}
        max={50}
        onChange={onChangeBlurRadius}
      />
    </InspectorPrimitives.Column>
  );
});
