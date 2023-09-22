import { ColorMode } from '@noya-design-system/protocol';
import { RadioGroup, Small, Spacer } from 'noya-designsystem';
import { MoonIcon, SunIcon } from 'noya-icons';
import React from 'react';

export function ColorModeInput({
  colorMode,
  onChangeColorMode,
}: {
  colorMode: ColorMode | undefined;
  onChangeColorMode: (colorMode: ColorMode) => void;
}) {
  return (
    <RadioGroup.Root
      id="color-mode"
      value={colorMode}
      onValueChange={onChangeColorMode}
    >
      <RadioGroup.Item value="light">
        <SunIcon />
        <Spacer.Horizontal size="6px" />
        <Small>Light</Small>
      </RadioGroup.Item>
      <RadioGroup.Item value="dark">
        <MoonIcon />
        <Spacer.Horizontal size="6px" />
        <Small>Dark</Small>
      </RadioGroup.Item>
    </RadioGroup.Root>
  );
}
