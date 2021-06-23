import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Select, Spacer, Slider, InputField } from 'noya-designsystem';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { SketchPattern } from 'noya-designsystem/src/components/ColorInputField';
import { useApplicationState } from '../../contexts/ApplicationStateContext';
import { encodeImg } from '../../utils/encodeImg';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

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
  backgroundPosition: 'center',
  backgroundRepeat: repeat ? 'auto' : 'no-repeat',
  backgroundSize,
}));

interface Props {
  id: string;
  pattern: SketchPattern;
  /**
   * The only required change handler is `onChangeColor`. However, to handle
   * more granular changes specially, e.g. nudging opacity, you can pass other
   * handlers.
   */
  onChangeImage?: (color: ArrayBuffer) => void;
  onChangeOpacity?: (amount: number) => void;
  onNudgeOpacity?: (amount: number) => void;
  onChangeFillType?: (amount: Sketch.PatternFillType) => void;
  onChangeTileScale?: (amount: number) => void;
}

type PatternFillTypes = 'Stretch' | 'Fill' | 'Fit' | 'Tile';

export default memo(function PatternInspector({
  id,
  pattern,
  onChangeImage,
  onChangeOpacity,
  onNudgeOpacity,
  onChangeFillType,
  onChangeTileScale,
}: Props) {
  const [state] = useApplicationState();

  const options: PatternFillTypes[] = useMemo(
    () => ['Tile', 'Fill', 'Stretch', 'Fit'],
    [],
  );
  const patternType = pattern.patternFillType;

  const backgroundSize = useMemo(() => {
    switch (patternType) {
      case Sketch.PatternFillType.Fit:
        return 'contain';
      case Sketch.PatternFillType.Tile:
        return `${pattern.patternTileScale * 100}%`;
      default:
        return 'cover';
    }
  }, [patternType, pattern.patternTileScale]);

  const changeFillType = useCallback(
    (value: PatternFillTypes) => {
      if (onChangeFillType) onChangeFillType(Sketch.PatternFillType[value]);
    },
    [onChangeFillType],
  );

  const changeTileScale = useCallback(
    (value: number) => {
      if (onChangeTileScale) onChangeTileScale(value / 100);
    },
    [onChangeTileScale],
  );
  if (!pattern.image?._ref) return;

  const isTile = patternType === Sketch.PatternFillType.Tile;
  const ref = state.sketch.images[pattern.image?._ref];
  const bytes = new Uint8Array(ref);

  return (
    <Column>
      <Container
        background={`url('data:image/png;base64,${encodeImg(bytes)}')`}
        backgroundSize={backgroundSize}
        repeat={isTile}
      />
      <Spacer.Vertical size={10} />
      <Row>
        <Select
          id={`${id}-pattern-options`}
          value={Sketch.PatternFillType[patternType] as PatternFillTypes}
          options={options}
          onChange={changeFillType}
        />
      </Row>
      <Spacer.Vertical size={10} />
      {isTile && (
        <Row>
          <Slider
            id={`${id}-slider`}
            value={pattern.patternTileScale * 100}
            onValueChange={(value: number) => changeTileScale(value)}
            min={1}
            max={200}
          />
          <Spacer.Horizontal size={10} />
          <InputField.Root size={50}>
            <InputField.NumberInput
              value={pattern.patternTileScale * 100}
              onSubmit={(value: number) => {
                const newValue = value > 200 ? 200 : value;
                changeTileScale(newValue);
              }}
            />
            <InputField.Label>{'%'}</InputField.Label>
          </InputField.Root>
        </Row>
      )}
    </Column>
  );
});
