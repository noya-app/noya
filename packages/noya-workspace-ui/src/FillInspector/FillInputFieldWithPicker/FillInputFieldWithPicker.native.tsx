import React, { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { Layout, Select, Popover, FillInputField } from 'noya-designsystem';
import { useApplicationState } from 'noya-app-state-context';
import { Selectors } from 'noya-state';
import Sketch from 'noya-file-format';
import { Primitives } from '../../primitives';
import ColorInspector from '../../ColorInspector';
import {
  FillOption,
  FillInputProps,
  ColorFillProps,
  PatternFillProps,
  GradientFillProps,
  FillOptionSelectProps,
} from './types';

const PopoverContent = styled(Popover.Content)<{ variant: 'normal' | 'large' }>(
  ({ theme, variant }) => ({
    width: variant === 'large' ? 680 : 240,
    maxHeight: 600,
  }),
);

const Section = styled(Primitives.Section)({
  zIndex: 20,
});

function ColorFillPicker({
  id,
  color,
  onChangeColor,
}: ColorFillProps & { id?: string }) {
  const [state, dispatch] = useApplicationState();
  const swatches = Selectors.getSharedSwatches(state);

  const onChangeSwatch = useCallback(
    (swatchID: string) => {
      const swatch = swatches.find((swatch) => swatch.do_objectID === swatchID);
      if (!swatch) return;
      onChangeColor({ ...swatch.value, swatchID });
    },
    [onChangeColor, swatches],
  );

  const detachThemeColor = useCallback(() => {
    if (!color) return;
    onChangeColor({ ...color, swatchID: undefined });
  }, [onChangeColor, color]);

  const createThemeColor = useCallback(
    (swatchID: string, name: string) => {
      if (!color) return;
      dispatch('addSwatch', name, color, swatchID);
      onChangeColor({ ...color, swatchID });
    },
    [color, dispatch, onChangeColor],
  );

  //     <ColorPickerSwatches
  //       selectedId={color ? color.swatchID : undefined}
  //       swatches={swatches}
  //       onChange={onChangeSwatch}
  //       onCreate={createThemeColor}
  //       onDetach={detachThemeColor}
  //     />

  return (
    <>
      <ColorInspector
        id={`${id}-color-inspector`}
        color={color}
        onChangeColor={onChangeColor}
      />
    </>
  );
}

function GradientFillPicker({
  id,
  gradient,
  onChangeGradient,
  onChangeGradientColor,
  onChangeGradientPosition,
  onAddGradientStop,
  onDeleteGradientStop,
}: Omit<GradientFillProps, 'onChangeGradientType'> & { id?: string }) {
  return null;
}

function PatternFillPicker({
  id,
  pattern,
  onChangePatternFillType,
  onChangePatternTileScale,
  onChangeFillImage,
}: PatternFillProps & { id?: string }) {
  return null;
}

function FillOptionSelect({
  fillType,
  gradientType,
  onChangeType,
  onChangeGradientType,
  supportsGradients,
  supportsPatterns,
  supportsShaders,
}: FillOptionSelectProps) {
  const fillOptions: FillOption[] = useMemo(
    () => [
      'Solid Color' as const,
      ...(supportsGradients
        ? [
            'Linear Gradient' as const,
            'Radial Gradient' as const,
            'Angular Gradient' as const,
          ]
        : []),
      ...(supportsPatterns ? ['Pattern Fill' as const] : []),
      ...(supportsShaders ? ['Shader' as const] : []),
    ],
    [supportsGradients, supportsPatterns, supportsShaders],
  );

  const value: FillOption = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Pattern:
        return 'Pattern Fill';
      case Sketch.FillType.Gradient:
        const gradientTypeString = Sketch.GradientType[gradientType];
        return `${gradientTypeString} Gradient` as FillOption;
      case Sketch.FillType.Color:
        return 'Solid Color';
      case Sketch.FillType.Shader:
        return 'Shader';
    }
  }, [fillType, gradientType]);

  const handleChange = useCallback(
    (value: FillOption) => {
      if (!onChangeType) return;

      switch (value) {
        case 'Solid Color':
          onChangeType(Sketch.FillType.Color);
          break;
        case 'Linear Gradient':
        case 'Angular Gradient':
        case 'Radial Gradient':
          onChangeType(Sketch.FillType.Gradient);

          onChangeGradientType?.(
            value === 'Linear Gradient'
              ? Sketch.GradientType.Linear
              : value === 'Radial Gradient'
              ? Sketch.GradientType.Radial
              : Sketch.GradientType.Angular,
          );
          break;
        case 'Pattern Fill':
          onChangeType(Sketch.FillType.Pattern);
          break;
        case 'Shader':
          onChangeType(Sketch.FillType.Shader);
          break;
      }
    },
    [onChangeType, onChangeGradientType],
  );

  return (
    <Select
      id="fill-options"
      value={value}
      options={fillOptions}
      getTitle={useCallback(
        (option) => (option === 'Shader' ? 'Shader (beta)' : option),
        [],
      )}
      onChange={handleChange}
    />
  );
}

export default memo(function FillInputFieldWithPicker({
  id,
  flex,
  fillType,
  onChangeType,
  hasMultipleFills = false,
  colorProps,
  gradientProps,
  patternProps,
  shaderProps,
}: FillInputProps) {
  const [state, dispatch] = useApplicationState();

  const picker = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Gradient:
        return gradientProps ? (
          <GradientFillPicker id={id} {...gradientProps} />
        ) : null;
      case Sketch.FillType.Pattern:
        return patternProps ? (
          <PatternFillPicker id={id} {...patternProps} />
        ) : null;
      case Sketch.FillType.Shader:
        // return shaderProps ? (
        //   <ShaderInspector id={id} {...shaderProps} />
        // ) : null;
        return null;
      case Sketch.FillType.Color:
      case undefined:
        return <ColorFillPicker id={id} {...colorProps} />;
    }
  }, [fillType, gradientProps, id, patternProps, shaderProps, colorProps]);

  const value = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Gradient:
        return gradientProps?.gradient;
      case Sketch.FillType.Pattern:
        return patternProps?.pattern;
      case Sketch.FillType.Color:
      case undefined:
        return colorProps.color;
    }
  }, [
    fillType,
    colorProps.color,
    gradientProps?.gradient,
    patternProps?.pattern,
  ]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (open && fillType === Sketch.FillType.Gradient) {
        gradientProps?.onEditGradient(0);
      }

      if (!open) {
        dispatch('setSelectedGradient', undefined);
      }
    },
    [dispatch, gradientProps, fillType],
  );

  return (
    <Popover.Root onOpenChange={onOpenChange}>
      <Popover.Trigger>
        <FillInputField
          id={id}
          flex={flex}
          value={hasMultipleFills ? undefined : value}
        />
      </Popover.Trigger>
      <PopoverContent
        variant={fillType === Sketch.FillType.Shader ? 'large' : 'normal'}
        side="bottom"
        align="center"
      >
        {(gradientProps || patternProps) && (
          <>
            <Section>
              <Primitives.Row>
                <FillOptionSelect
                  supportsGradients={!!gradientProps}
                  supportsPatterns={!!patternProps}
                  supportsShaders={!!shaderProps}
                  fillType={fillType ?? Sketch.FillType.Color}
                  gradientType={
                    gradientProps?.gradient.gradientType ??
                    Sketch.GradientType.Linear
                  }
                  onChangeType={(type) => {
                    onChangeType?.(type);
                    if (type === Sketch.FillType.Gradient) {
                      gradientProps?.onEditGradient(0);
                    }
                  }}
                  onChangeGradientType={gradientProps?.onChangeGradientType}
                />
              </Primitives.Row>
            </Section>
            <Layout.Divider />
          </>
        )}
        {picker}
      </PopoverContent>
    </Popover.Root>
  );
});
