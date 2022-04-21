import React, { memo, useCallback } from 'react';

import Sketch from 'noya-file-format';
import { Select, Slider, InputField } from 'noya-designsystem';
import { Primitives } from '../primitives';
import PatternPreview from './PatternPreview';
import {
  PatternFillType,
  PatternInspectorProps,
  PATTERN_FILL_TYPE_OPTIONS,
} from './types';

export default memo(function PatternInspector({
  id,
  pattern,
  createImage,
  onChangeImage,
  onChangeFillType,
  onChangeTileScale,
}: PatternInspectorProps) {
  const patternType = pattern.patternFillType;
  const isTile = patternType === Sketch.PatternFillType.Tile;
  const changeFillType = useCallback(
    (value: PatternFillType) => {
      onChangeFillType(Sketch.PatternFillType[value]);
    },
    [onChangeFillType],
  );

  const onSubmitTileScale = useCallback(
    (value: number) => {
      onChangeTileScale(value / 100);
    },
    [onChangeTileScale],
  );

  const onNudgeTileScale = useCallback(
    (value: number) => {
      onChangeTileScale(value / 100);
    },
    [onChangeTileScale],
  );

  const scale = Math.round(pattern.patternTileScale * 100);

  return (
    <Primitives.Section>
      <Primitives.Column>
        <PatternPreview
          pattern={pattern}
          onAddImage={createImage}
          onChangeImage={onChangeImage}
        />
        <Primitives.VerticalSeparator />
        <Primitives.LabeledRow label="Size">
          <Select
            id={`${id}-pattern-options`}
            value={Sketch.PatternFillType[patternType] as PatternFillType}
            options={PATTERN_FILL_TYPE_OPTIONS}
            onChange={changeFillType}
          />
        </Primitives.LabeledRow>
        {isTile && (
          <>
            <Primitives.VerticalSeparator />
            <Primitives.LabeledSliderRow label="Scale">
              <Slider
                id={`${id}-slider`}
                value={scale}
                onValueChange={onSubmitTileScale}
                min={10}
                max={200}
              />
              <Primitives.HorizontalSeparator />
              <InputField.Root size={50}>
                <InputField.NumberInput
                  value={scale}
                  onSubmit={onSubmitTileScale}
                  onNudge={onNudgeTileScale}
                />
                <InputField.Label>{'%'}</InputField.Label>
              </InputField.Root>
            </Primitives.LabeledSliderRow>
          </>
        )}
      </Primitives.Column>
    </Primitives.Section>
  );
});
