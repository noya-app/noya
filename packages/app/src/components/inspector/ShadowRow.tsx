import { Label, LabeledElementView } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { memo, ReactNode, useCallback } from 'react';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import DimensionInput from './DimensionInput';
import { DimensionValue } from './DimensionsInspector';
import FillInputFieldWithPicker, {
  ColorFillProps,
} from './FillInputFieldWithPicker';

interface Props {
  id: string;
  prefix?: ReactNode;
  x: DimensionValue;
  y: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
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

  return (
    <InspectorPrimitives.Row id={id}>
      <LabeledElementView renderLabel={renderLabel}>
        {prefix}
        {prefix && <InspectorPrimitives.HorizontalSeparator />}
        <FillInputFieldWithPicker id={colorInputId} colorProps={colorProps} />
        <InspectorPrimitives.HorizontalSeparator />
        <DimensionInput
          id={xInputId}
          size={50}
          value={x !== undefined ? Math.round(x) : x}
          onSetValue={onSetX}
        />
        <InspectorPrimitives.HorizontalSeparator />
        <DimensionInput
          id={yInputId}
          size={50}
          value={y !== undefined ? Math.round(y) : y}
          onSetValue={onSetY}
        />
        <InspectorPrimitives.HorizontalSeparator />
        <DimensionInput
          id={blurInputId}
          size={50}
          value={blur !== undefined ? Math.round(blur) : blur}
          onSetValue={onSetBlur}
        />
        <InspectorPrimitives.HorizontalSeparator />
        <DimensionInput
          id={spreadInputId}
          size={50}
          value={spread !== undefined ? Math.round(spread) : spread}
          onSetValue={onSetSpread}
        />
      </LabeledElementView>
    </InspectorPrimitives.Row>
  );
});
