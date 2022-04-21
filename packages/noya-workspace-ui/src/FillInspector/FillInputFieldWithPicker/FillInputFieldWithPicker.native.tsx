import React, { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import Sketch from 'noya-file-format';
import { useApplicationState } from 'noya-app-state-context';
import { Layout, Popover, FillInputField } from 'noya-designsystem';
import { Primitives } from '../../primitives';
import type { FillInputProps } from './types';
import ColorFillPicker from './ColorFillPicker';
import FillOptionSelect from './FillOptionSelect';
import PatternFillPicker from './PatternFillPicker';
import GradientFillPicker from './GradientFillPicker';

const PopoverContent = styled(Popover.Content)<{ variant: 'normal' | 'large' }>(
  ({ variant }) => ({
    width: variant === 'large' ? 680 : 240,
    maxHeight: 600,
  }),
);

const Section = styled(Primitives.Section)({
  zIndex: 20,
});

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
  const [, dispatch] = useApplicationState();

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
