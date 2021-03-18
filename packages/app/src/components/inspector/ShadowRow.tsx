import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import {
  InputField,
  Label,
  LabeledElementView,
  Spacer,
} from 'noya-designsystem';
import { memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import ColorInputFieldWithPicker from './ColorInputFieldWithPicker';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  id: string;
  color: FileFormat.Color;
  x: FileFormat.Shadow['offsetX'];
  y: FileFormat.Shadow['offsetY'];
  blur: FileFormat.Shadow['blurRadius'];
  spread: FileFormat.Shadow['spread'];
  onChangeColor: (color: FileFormat.Color) => void;
  onChangeX: (amount: number) => void;
  onChangeY: (amount: number) => void;
  onChangeBlur: (amount: number) => void;
  onChangeSpread: (amount: number) => void;
  onNudgeX: (amount: number) => void;
  onNudgeY: (amount: number) => void;
  onNudgeBlur: (amount: number) => void;
  onNudgeSpread: (amount: number) => void;
  prefix?: ReactNode;
}

export default memo(function FillRow({
  id,
  color,
  x,
  y,
  blur,
  spread,
  onChangeColor,
  onChangeX,
  onChangeY,
  onChangeBlur,
  onChangeSpread,
  onNudgeX,
  onNudgeY,
  onNudgeBlur,
  onNudgeSpread,
  prefix,
}: Props) {
  const colorInputId = `${id}-color`;
  const xInputId = `${id}-x`;
  const yInputId = `${id}-y`;
  const blurInputId = `${id}-blur`;
  const spreadInputId = `${id}-spread`;

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case colorInputId:
          return <Label.Label>Color</Label.Label>;
        case xInputId:
          return <Label.Label>X</Label.Label>;
        case yInputId:
          return <Label.Label>Y</Label.Label>;
        case blurInputId:
          return <Label.Label>Blur</Label.Label>;
        case spreadInputId:
          return <Label.Label>Spread</Label.Label>;
        default:
          return null;
      }
    },
    [colorInputId, xInputId, yInputId, blurInputId, spreadInputId],
  );

  const handleSubmitX = useCallback(
    (x: number) => {
      onChangeX(x);
    },
    [onChangeX],
  );
  const handleSubmitY = useCallback(
    (y: number) => {
      onChangeY(y);
    },
    [onChangeY],
  );
  const handleSubmitBlur = useCallback(
    (blur: number) => {
      onChangeBlur(blur);
    },
    [onChangeBlur],
  );
  const handleSubmitSpread = useCallback(
    (spread: number) => {
      onChangeSpread(spread);
    },
    [onChangeSpread],
  );
  const handleNudgeX = useCallback(
    (x: number) => {
      onNudgeX(x);
    },
    [onNudgeX],
  );
  const handleNudgeY = useCallback(
    (y: number) => {
      onNudgeY(y);
    },
    [onNudgeY],
  );
  const handleNudgeBlur = useCallback(
    (blur: number) => {
      onNudgeBlur(blur);
    },
    [onNudgeBlur],
  );
  const handleNudgeSpread = useCallback(
    (spread: number) => {
      onNudgeSpread(spread);
    },
    [onNudgeSpread],
  );

  return (
    <Row id={id}>
      <LabeledElementView renderLabel={renderLabel}>
        {prefix}
        {prefix && <Spacer.Horizontal size={8} />}
        <ColorInputFieldWithPicker
          id={colorInputId}
          value={color}
          onChange={onChangeColor}
        />
        <Spacer.Horizontal size={8} />
        <InputField.Root id={xInputId} size={50}>
          <InputField.NumberInput
            value={Math.round(x)}
            onSubmit={handleSubmitX}
            onNudge={handleNudgeX}
          />
        </InputField.Root>
        <Spacer.Horizontal size={8} />
        <InputField.Root id={yInputId} size={50}>
          <InputField.NumberInput
            value={Math.round(y)}
            onSubmit={handleSubmitY}
            onNudge={handleNudgeY}
          />
        </InputField.Root>
        <Spacer.Horizontal size={8} />
        <InputField.Root id={blurInputId} size={50}>
          <InputField.NumberInput
            value={Math.round(blur)}
            onSubmit={handleSubmitBlur}
            onNudge={handleNudgeBlur}
          />
        </InputField.Root>
        <Spacer.Horizontal size={8} />
        <InputField.Root id={spreadInputId} size={50}>
          <InputField.NumberInput
            value={Math.round(spread)}
            onSubmit={handleSubmitSpread}
            onNudge={handleNudgeSpread}
          />
        </InputField.Root>
      </LabeledElementView>
    </Row>
  );
});
