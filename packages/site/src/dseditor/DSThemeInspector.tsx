import { produce } from 'immer';
import { DS } from 'noya-api';
import {
  Button,
  Select,
  Spacer,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { ChevronDownIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import { upperFirst } from 'noya-utils';
import React from 'react';
import styled from 'styled-components';
import { tailwindColors } from '../ayon/tailwind/tailwind.config';
import { ColorModeInput } from './ColorModeInput';

export const colorGroups = Object.entries(tailwindColors).flatMap(
  ([name, colors]) => {
    if (typeof colors === 'string') return [];
    return name;
  },
);

export const SwatchGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(24px, 1fr))',
  gap: '4px',
});

const DEFAULT_DS_CONFIG: DS['config'] = {
  colorMode: 'light',
  colors: {
    primary: 'blue',
  },
};

export function DSThemeInspector({
  dsConfig = DEFAULT_DS_CONFIG,
  onChangeDSConfig,
}: {
  dsConfig?: DS['config'];
  onChangeDSConfig: (config: DS['config']) => void;
}) {
  const {
    colorMode,
    colors: { primary },
  } = dsConfig;
  const theme = useDesignSystemTheme();

  return (
    <>
      <InspectorPrimitives.LabeledRow label="Primary Color">
        <Select
          id="primary-color"
          value={primary}
          options={colorGroups}
          getTitle={upperFirst}
          onChange={(value) => {
            onChangeDSConfig(
              produce(dsConfig, (draft) => {
                draft.colors.primary = value;
              }),
            );
          }}
        >
          <Button flex="1">
            {primary}
            <Spacer.Horizontal />
            <ChevronDownIcon />
          </Button>
        </Select>
      </InspectorPrimitives.LabeledRow>
      <SwatchGrid>
        {colorGroups.map((name) => (
          <div
            key={name}
            role="button"
            onClick={() => {
              onChangeDSConfig(
                produce(dsConfig, (draft) => {
                  draft.colors.primary = name;
                }),
              );
            }}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              cursor: 'pointer',
              background: (tailwindColors as any)[name as any][500],
              // Selected
              boxShadow:
                name === primary
                  ? `0 0 0 2px ${theme.colors.primary}, 0 0 0 1px white inset`
                  : undefined,
            }}
          />
        ))}
      </SwatchGrid>
      <InspectorPrimitives.LabeledRow label="Color Mode">
        <ColorModeInput
          colorMode={colorMode}
          onChangeColorMode={(value) => {
            onChangeDSConfig(
              produce(dsConfig, (draft) => {
                draft.colorMode = value;
              }),
            );
          }}
        />
      </InspectorPrimitives.LabeledRow>
    </>
  );
}
