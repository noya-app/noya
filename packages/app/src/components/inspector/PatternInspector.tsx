import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Select,
  Spacer,
  Slider,
  InputField,
  getPatternBackground,
  SketchPattern,
} from 'noya-designsystem';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import * as InspectorPrimitives from './InspectorPrimitives';
import { useApplicationState } from '../../contexts/ApplicationStateContext';

const Column = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

const Container = styled.div<{
  background: string;
  backgroundSize: string;
  repeat: boolean;
}>(({ background, backgroundSize, repeat }) => ({
  flex: 1,
  position: 'relative',
  outline: 'none',
  display: 'flex',
  userSelect: 'none',
  cursor: 'default',
  borderRadius: '4px',
  minHeight: '150px',
  background,
  backgroundColor: 'white',
  backgroundPosition: 'center',
  backgroundRepeat: repeat ? 'auto' : 'no-repeat',
  backgroundSize,
  imageRendering: 'crisp-edges',
}));

interface Props {
  id: string;
  pattern: SketchPattern;
  onChangeImage?: (image: Sketch.FileRef | Sketch.DataRef) => void;
  onChangeFillType?: (amount: Sketch.PatternFillType) => void;
  onChangeTileScale?: (amount: number) => void;
}

export type PatternFillTypes = 'Stretch' | 'Fill' | 'Fit' | 'Tile';
export const patternFillTypeOptions: PatternFillTypes[] = [
  'Tile',
  'Fill',
  'Stretch',
  'Fit',
];

export default memo(function PatternInspector({
  id,
  pattern,
  onChangeImage,
  onChangeFillType,
  onChangeTileScale,
}: Props) {
  const [state] = useApplicationState();

  const patternType = pattern.patternFillType;

  const changeFillType = useCallback(
    (value: PatternFillTypes) => {
      onChangeFillType?.(Sketch.PatternFillType[value]);
    },
    [onChangeFillType],
  );

  const onSubmitTileScale = useCallback(
    (value: number) => {
      const newValue = value > 200 ? 200 : value < 10 ? 10 : value;
      onChangeTileScale?.(newValue / 100);
    },
    [onChangeTileScale],
  );

  const onNudgeTileScale = useCallback(
    (value: number) => {
      const newValue = value > 200 ? 200 : value < 10 ? 10 : value;
      onChangeTileScale?.(newValue / 100);
    },
    [onChangeTileScale],
  );
  const isTile = patternType === Sketch.PatternFillType.Tile;

  const value = useMemo(
    () => getPatternBackground(state.sketch.images, pattern),
    [state, pattern],
  );

  if (!value) return null;
  const { background, backgroundSize } = value;

  return (
    <Column>
      <Container
        background={background}
        backgroundSize={backgroundSize}
        repeat={isTile}
      />
      <Spacer.Vertical size={10} />
      <InspectorPrimitives.LabeledRow label={'Size'}>
        <Spacer.Vertical size={10} />

        <Select
          id={`${id}-pattern-options`}
          value={Sketch.PatternFillType[patternType] as PatternFillTypes}
          options={patternFillTypeOptions}
          onChange={changeFillType}
        />
      </InspectorPrimitives.LabeledRow>
      <Spacer.Vertical size={10} />
      {isTile && (
        <InspectorPrimitives.LabeledSliderRow label={'Scale'}>
          <Slider
            id={`${id}-slider`}
            value={pattern.patternTileScale * 100}
            onValueChange={onSubmitTileScale}
            min={10}
            max={200}
          />
          <Spacer.Horizontal size={10} />
          <InputField.Root size={50}>
            <InputField.NumberInput
              value={pattern.patternTileScale * 100}
              onSubmit={onSubmitTileScale}
              onNudge={onNudgeTileScale}
            />
            <InputField.Label>{'%'}</InputField.Label>
          </InputField.Root>
        </InspectorPrimitives.LabeledSliderRow>
      )}
    </Column>
  );
});
