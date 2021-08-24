import Sketch from 'noya-file-format';
import {
  InputField,
  Label,
  LabeledElementView,
  Select,
  sketchColorToHex,
  SketchPattern,
  withSeparatorElements,
} from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import DimensionInput from './DimensionInput';
import { DimensionValue } from './DimensionsInspector';
import FillInputFieldWithPicker, {
  ColorFillProps,
  GradientFillProps,
  PatternFillProps,
  ShaderFillProps,
} from './FillInputFieldWithPicker';
import { PatternFillType, PATTERN_FILL_TYPE_OPTIONS } from './PatternInspector';
import { ShaderVariableValueInput } from './ShaderVariableRow';

const GRADIENT_TYPE_OPTIONS = [
  Sketch.GradientType.Linear.toString(),
  Sketch.GradientType.Angular.toString(),
  Sketch.GradientType.Radial.toString(),
];

interface Props {
  id: string;
  prefix?: ReactNode;
  fillType?: Sketch.FillType;
  gradient?: Sketch.Gradient;
  pattern?: SketchPattern;
  contextOpacity: DimensionValue;
  onChangeFillType: (type: Sketch.FillType) => void;
  onSetOpacity: (amount: number, mode: SetNumberMode) => void;
  onSetContextOpacity: (value: number, mode: SetNumberMode) => void;
  colorProps: ColorFillProps;
  gradientProps: GradientFillProps;
  patternProps: PatternFillProps;
  shaderProps: ShaderFillProps;
}

export default memo(function FillRow({
  id,
  prefix,
  fillType,
  contextOpacity,
  onSetOpacity,
  onSetContextOpacity,
  onChangeFillType,
  colorProps,
  gradientProps,
  patternProps,
  shaderProps,
}: Props) {
  const fillInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;
  const gradientTypeId = `${id}-gradient-type`;
  const patternSizeId = `${id}-pattern-type`;
  const shaderVariableId = `${id}-shader-variable`;

  const fillLabel = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Color:
        return 'Color';
      case Sketch.FillType.Gradient:
        return 'Gradient';
      case Sketch.FillType.Pattern:
        return 'Image';
      case Sketch.FillType.Shader:
        return 'Shader';
    }
  }, [fillType]);

  const renderLabel = useCallback(
    ({ id }: { id: string }) => {
      if (id.startsWith(shaderVariableId)) {
        return <Label.Label>{id.split('_')[1]}</Label.Label>;
      }

      switch (id) {
        case fillInputId:
          return <Label.Label>{fillLabel}</Label.Label>;
        case hexInputId:
          return <Label.Label>Hex</Label.Label>;
        case opacityInputId:
          return <Label.Label>Opacity</Label.Label>;
        case gradientTypeId:
          return <Label.Label>Type</Label.Label>;
        case patternSizeId:
          return <Label.Label>Size</Label.Label>;
        default:
          return null;
      }
    },
    [
      shaderVariableId,
      fillInputId,
      fillLabel,
      hexInputId,
      opacityInputId,
      gradientTypeId,
      patternSizeId,
    ],
  );

  const handleSetOpacity = useCallback(
    (amount: number, mode: SetNumberMode) => onSetOpacity(amount / 100, mode),
    [onSetOpacity],
  );

  const handleSetContextOpacity = useCallback(
    (amount: number, mode: SetNumberMode) =>
      onSetContextOpacity(amount / 100, mode),
    [onSetContextOpacity],
  );

  const getGradientTypeTitle = useCallback(
    (id: string) => Sketch.GradientType[parseInt(id)],
    [],
  );

  const handleSelectGradientType = useCallback(
    (value: string) => gradientProps.onChangeGradientType(parseInt(value)),
    [gradientProps],
  );

  const handleSelectPatternSize = useCallback(
    (value: PatternFillType) =>
      patternProps.onChangePatternFillType(Sketch.PatternFillType[value]),
    [patternProps],
  );

  const fields = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Color:
        return (
          <>
            <InputField.Root id={hexInputId} labelPosition="start">
              <InputField.Input
                value={
                  colorProps.color
                    ? sketchColorToHex(colorProps.color).replace('#', '')
                    : ''
                }
                placeholder={colorProps.color ? undefined : 'multiple'}
                onSubmit={() => {}}
              />
              <InputField.Label>#</InputField.Label>
            </InputField.Root>
            <InspectorPrimitives.HorizontalSeparator />
            <DimensionInput
              id={opacityInputId}
              size={50}
              label="%"
              value={
                colorProps.color
                  ? Math.round(colorProps.color.alpha * 100)
                  : undefined
              }
              onSetValue={handleSetOpacity}
            />
          </>
        );
      case Sketch.FillType.Gradient:
        return (
          <>
            <Select
              id={gradientTypeId}
              value={gradientProps.gradient.gradientType.toString()}
              options={GRADIENT_TYPE_OPTIONS}
              getTitle={getGradientTypeTitle}
              onChange={handleSelectGradientType}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <DimensionInput
              id={opacityInputId}
              size={50}
              label="%"
              value={
                contextOpacity !== undefined
                  ? Math.round(contextOpacity * 100)
                  : undefined
              }
              onSetValue={handleSetContextOpacity}
            />
          </>
        );
      case Sketch.FillType.Pattern:
        return (
          <>
            <Select
              id={patternSizeId}
              value={
                Sketch.PatternFillType[
                  patternProps.pattern.patternFillType
                ] as PatternFillType
              }
              options={PATTERN_FILL_TYPE_OPTIONS}
              onChange={handleSelectPatternSize}
            />
            <InspectorPrimitives.HorizontalSeparator />
            <DimensionInput
              id={opacityInputId}
              size={50}
              label="%"
              value={
                contextOpacity !== undefined
                  ? Math.round(contextOpacity * 100)
                  : undefined
              }
              onSetValue={handleSetContextOpacity}
            />
          </>
        );
      case Sketch.FillType.Shader:
        return withSeparatorElements(
          shaderProps.shader.variables
            .map((variable, index) => (
              <ShaderVariableValueInput
                key={`${variable.name}-${index}`}
                flex="1"
                id={`${shaderVariableId}_${variable.name}`}
                value={variable.value}
                onChange={(value) =>
                  shaderProps.onChangeShaderVariableValue(variable.name, value)
                }
                onNudge={(value) =>
                  shaderProps.onNudgeShaderVariableValue(variable.name, value)
                }
              />
            ))
            .reverse()
            .slice(0, 3),
          <InspectorPrimitives.HorizontalSeparator />,
        );
    }
  }, [
    colorProps.color,
    contextOpacity,
    fillType,
    getGradientTypeTitle,
    gradientProps.gradient.gradientType,
    gradientTypeId,
    handleSelectGradientType,
    handleSelectPatternSize,
    handleSetContextOpacity,
    handleSetOpacity,
    hexInputId,
    opacityInputId,
    patternProps.pattern.patternFillType,
    patternSizeId,
    shaderProps,
    shaderVariableId,
  ]);

  return (
    <InspectorPrimitives.Row id={id}>
      <LabeledElementView renderLabel={renderLabel}>
        {prefix}
        {prefix && <InspectorPrimitives.HorizontalSeparator />}
        <FillInputFieldWithPicker
          id={fillInputId}
          fillType={fillType}
          onChangeType={onChangeFillType}
          colorProps={colorProps}
          gradientProps={gradientProps}
          patternProps={patternProps}
          shaderProps={shaderProps}
        />
        <InspectorPrimitives.HorizontalSeparator />
        {fields}
      </LabeledElementView>
    </InspectorPrimitives.Row>
  );
});
