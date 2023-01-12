import { Select } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { SetNumberMode } from 'noya-state';
import { invert } from 'noya-utils';
import React, { memo, useCallback } from 'react';
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
  blurRadius: number;
  blurSaturation: number;
  onChangeBlurType: (value: Sketch.BlurType) => void;
  onChangeBlurRadius: (value: number, mode: SetNumberMode) => void;
  onChangeBlurSaturation: (value: number, mode: SetNumberMode) => void;
}

export const BlurRow = memo(function BlurRow({
  id,
  supportedBlurTypes,
  blurType,
  blurRadius,
  blurSaturation,
  onChangeBlurType,
  onChangeBlurRadius,
  onChangeBlurSaturation,
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
      {supportedBlurTypes.includes('Background') &&
        blurType === Sketch.BlurType.Background && (
          <>
            <InspectorPrimitives.VerticalSeparator />
            <DimensionSliderRow
              id="blur-saturation-input"
              label="Saturation"
              value={blurSaturation}
              min={-100}
              max={100}
              inputFieldLabel="%"
              onChange={onChangeBlurSaturation}
            />
          </>
        )}
    </InspectorPrimitives.Column>
  );
});
