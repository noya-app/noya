import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Select, Spacer } from 'noya-designsystem';
import { memo, useMemo } from 'react';
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

const Container = styled.div<{ backgroundImage: string }>(
  ({ backgroundImage }) => ({
    flex: 1,
    position: 'relative',
    outline: 'none',
    display: 'flex',
    userSelect: 'none',
    cursor: 'default',
    borderRadius: '4px',
    minHeight: '150px',
    backgroundImage,
  }),
);

interface Props {
  id: string;
  pattern: SketchPattern;
  /**
   * The only required change handler is `onChangeColor`. However, to handle
   * more granular changes specially, e.g. nudging opacity, you can pass other
   * handlers.
   */
  onChangeImage?: (color: Sketch.Color) => void;
  onChangeOpacity?: (amount: number) => void;
  onNudgeOpacity?: (amount: number) => void;
}

type PatternFillTypes = 'Stretch' | 'Fill' | 'Fit' | 'Tile';

export default memo(function ColorInspector({
  id,
  pattern,
  onChangeImage,
  onChangeOpacity,
  onNudgeOpacity,
}: Props) {
  const [state] = useApplicationState();

  const options: PatternFillTypes[] = useMemo(
    () => ['Tile', 'Fill', 'Stretch', 'Fit'],
    [],
  );

  if (!pattern.image?._ref) return;

  const ref = state.sketch.images[pattern.image?._ref];
  const patternType = pattern.patternFillType;
  const bytes = new Uint8Array(ref);

  return (
    <Column>
      <Container
        backgroundImage={`url('data:image/png;base64,${encodeImg(bytes)}')`}
      />
      <Spacer.Vertical size={10} />
      <Row id={id}>
        <Select
          id="pattern-options"
          value={Sketch.PatternFillType[patternType]}
          options={options}
          onChange={() => {}}
        />
        <Spacer.Horizontal size={8} />
      </Row>
    </Column>
  );
});
