import { useApplicationState } from 'noya-app-state-context';
import { InputField, Stack } from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import { useShallowArray } from 'noya-react-utils';
import { Layers, Selectors } from 'noya-state';
import React from 'react';
import { Blocks } from '../blocks/blocks';
import { flattenPassthroughLayers } from '../blocks/flattenPassthroughLayers';
import { InspectorCarousel } from './InspectorCarousel';

const InspectorSection = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => (
  <Stack.V
    padding={title ? '32px 12px 12px' : '12px'}
    gap="12px"
    background="white"
  >
    {title && (
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>{title}</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
    )}
    {children}
  </Stack.V>
);

export function AyonLayerInspector() {
  const [state] = useApplicationState();

  const selectedLayers = useShallowArray(
    Selectors.getSelectedLayers(state).filter(Layers.isSymbolInstance),
  );

  if (selectedLayers.length !== 1) return null;

  const symbolId = selectedLayers[0].symbolID;
  const block = Blocks[symbolId];
  const componentName = block.symbol.name;

  const nestedLayers = flattenPassthroughLayers(block.symbol);

  return (
    <Stack.V gap="1px">
      <InspectorSection>
        <InputField.Root>
          <InputField.Label>Component</InputField.Label>
          <InputField.Input value={componentName} onSubmit={() => {}} />
        </InputField.Root>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>
            Related Components
          </InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorCarousel />
      </InspectorSection>
      <InspectorSection title="Style">
        <InputField.Root>
          <InputField.Label>Style</InputField.Label>
          <InputField.Input value={componentName} onSubmit={() => {}} />
        </InputField.Root>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Presets</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorCarousel />
      </InspectorSection>
      <InspectorSection title="Content">
        <Stack.V gap="4px">
          {nestedLayers.map(({ layer }, index) => {
            // const block = Blocks[layer.symbolID];
            // const componentName = block.symbol.name;

            return (
              <InputField.Root>
                <InputField.Label>Component</InputField.Label>
                <InputField.Input
                  value={''}
                  placeholder={layer.blockText}
                  onSubmit={() => {}}
                />
              </InputField.Root>
            );
          })}
        </Stack.V>
      </InspectorSection>
    </Stack.V>
  );
}
