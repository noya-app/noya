import React, { memo, ReactNode } from 'react';

import { SetNumberMode } from 'noya-state';
import { LabeledView } from 'noya-designsystem';
import { Primitives } from '../primitives';
import { DimensionInput, DimensionValue } from '../DimensionsInspector';
import { FillInputFieldWithPicker, ColorFillProps } from '../FillInspector';

interface Props {
  id: string;
  prefix?: ReactNode;
  x: DimensionValue;
  y: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
  supportsSpread: boolean;
  onSetX: (value: number, mode: SetNumberMode) => void;
  onSetY: (value: number, mode: SetNumberMode) => void;
  onSetBlur: (value: number, mode: SetNumberMode) => void;
  onSetSpread: (value: number, mode: SetNumberMode) => void;
  colorProps: ColorFillProps;
}

export default memo(function FillRow({
  id,
  prefix,
  x,
  y,
  blur,
  spread,
  supportsSpread,
  onSetX,
  onSetY,
  onSetBlur,
  onSetSpread,
  colorProps,
}: Props) {
  const colorInputId = `${id}-color`;
  const xInputId = `${id}-x`;
  const yInputId = `${id}-y`;
  const blurInputId = `${id}-blur`;
  const spreadInputId = `${id}-spread`;

  return (
    <Primitives.Row id={id}>
      <Primitives.DragHandle />
      <LabeledView>{prefix}</LabeledView>
      {prefix && <Primitives.HorizontalSeparator />}
      <LabeledView label="Color">
        <FillInputFieldWithPicker id={colorInputId} colorProps={colorProps} />
      </LabeledView>
      <Primitives.HorizontalSeparator />
      <LabeledView label="X" size={50}>
        <DimensionInput
          id={xInputId}
          value={x !== undefined ? Math.round(x) : x}
          onSetValue={onSetX}
        />
      </LabeledView>
      <Primitives.HorizontalSeparator />
      <LabeledView label="Y" size={50}>
        <DimensionInput
          id={yInputId}
          value={y !== undefined ? Math.round(y) : y}
          onSetValue={onSetY}
        />
      </LabeledView>
      <Primitives.HorizontalSeparator />
      <LabeledView label="Blur" size={50}>
        <DimensionInput
          id={blurInputId}
          value={blur !== undefined ? Math.round(blur) : blur}
          onSetValue={onSetBlur}
        />
      </LabeledView>
      <Primitives.HorizontalSeparator />
      <LabeledView label="Spread" size={50}>
        <DimensionInput
          id={spreadInputId}
          disabled={!supportsSpread}
          value={spread !== undefined ? Math.round(spread) : spread}
          onSetValue={onSetSpread}
        />
      </LabeledView>
    </Primitives.Row>
  );
});
