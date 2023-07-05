import { useApplicationState } from 'noya-app-state-context';
import {
  CompletionItem,
  InputField,
  InputFieldWithCompletions,
  Stack,
} from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import { useKeyboardShortcuts } from 'noya-keymap';
import { useShallowArray } from 'noya-react-utils';
import {
  Layers,
  OverriddenBlockContent,
  Selectors,
  getSiblingBlocks,
} from 'noya-state';
import React, { useCallback, useMemo } from 'react';
import { BlockPreviewProps } from '../../docs/InteractiveBlockPreview';
import { Blocks, allInsertableBlocks } from '../blocks/blocks';
import { flattenPassthroughLayers } from '../blocks/flattenPassthroughLayers';
import { boxSymbolId } from '../blocks/symbolIds';
import { inferBlockTypes } from '../inferBlock';
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

export function AyonLayerInspector({
  setOverriddenBlock,
}: {
  setOverriddenBlock: (
    overriddenBlock: OverriddenBlockContent | undefined,
  ) => void;
}) {
  const [state, dispatch] = useApplicationState();

  const selectedLayers = useShallowArray(
    Selectors.getSelectedLayers(state).filter(Layers.isSymbolInstance),
  );

  const componentSearchInputRef = React.useRef<HTMLInputElement>(null);

  const blockCompletionItems = useMemo(
    () =>
      allInsertableBlocks.map(
        (block): CompletionItem => ({
          id: block.symbol.symbolID,
          name: block.symbol.name,
        }),
      ),
    [],
  );

  const handleSelectBlockItem = useCallback(
    (item: CompletionItem) => {
      dispatch('setSymbolInstanceSource', item.id, 'preserveCurrent');
    },
    [dispatch],
  );

  const onSetOverriddenBlock = (item: BlockPreviewProps | undefined) => {
    if (item) {
      setOverriddenBlock({
        layerId: selectedLayer.do_objectID,
        blockContent: {
          symbolId: item.blockId,
          blockText: item.blockText || '',
          overrides: item.overrideValues,
        },
      });
    } else {
      setOverriddenBlock(undefined);
    }
  };

  useKeyboardShortcuts({
    '/': () => {
      componentSearchInputRef.current?.focus();
    },
  });

  if (selectedLayers.length !== 1) return null;

  const selectedLayer = selectedLayers[0];
  const block = Blocks[selectedLayer.symbolID];
  const componentName = block.symbol.name;

  const nestedLayers = flattenPassthroughLayers(block.symbol);

  const blockTypes = inferBlockTypes({
    frame: selectedLayer.frame,
    blockText: selectedLayer.blockText,
    siblingBlocks: getSiblingBlocks(state),
  });

  const relatedBlocks: BlockPreviewProps[] = [
    {
      blockId: selectedLayer.symbolID,
      blockText: selectedLayer.blockText,
      overrideValues: selectedLayer.overrideValues,
      resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
    },
    ...blockTypes
      .flatMap(({ type }) => (typeof type === 'string' ? [] : type.symbolId))
      .filter(
        (blockId) =>
          blockId !== boxSymbolId && blockId !== selectedLayer.symbolID,
      )
      .slice(0, 2)
      .map(
        (blockId): BlockPreviewProps => ({
          blockId,
          blockText: selectedLayer.blockText,
          overrideValues: selectedLayer.overrideValues,
          resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
        }),
      ),
  ];

  const presetStyles: BlockPreviewProps[] = [
    {
      blockId: selectedLayer.symbolID,
      blockText: selectedLayer.blockText?.replace(/#dark/g, ''),
      overrideValues: selectedLayer.overrideValues,
      resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
    },
    {
      blockId: selectedLayer.symbolID,
      blockText: [selectedLayer.blockText, '#dark'].filter(Boolean).join(' '),
      overrideValues: selectedLayer.overrideValues,
      resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
    },
  ];

  return (
    <Stack.V gap="1px">
      <InspectorSection>
        <InputFieldWithCompletions
          ref={componentSearchInputRef}
          placeholder={componentName}
          items={blockCompletionItems}
          onSelectItem={handleSelectBlockItem}
        />
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>
            Related Components
          </InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorCarousel
          key={selectedLayer.symbolID}
          items={relatedBlocks}
          onSelectItem={(index) => {
            dispatch(
              'setSymbolInstanceSource',
              relatedBlocks[index].blockId,
              'preserveCurrent',
            );
          }}
          onHoverItemChange={(index, isHovering) => {
            onSetOverriddenBlock(isHovering ? relatedBlocks[index] : undefined);
          }}
        />
      </InspectorSection>
      <InspectorSection title="Style">
        <InputField.Root>
          <InputField.Input value={componentName} onSubmit={() => {}} />
        </InputField.Root>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Presets</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorCarousel
          items={presetStyles}
          onSelectItem={(index) => {
            dispatch(
              'setBlockText',
              undefined,
              presetStyles[index].blockText || '',
              'preserveCurrent',
            );
          }}
          onHoverItemChange={(index, isHovering) => {
            onSetOverriddenBlock(isHovering ? presetStyles[index] : undefined);
          }}
        />
      </InspectorSection>
      <InspectorSection title="Content">
        <Stack.V gap="4px">
          {nestedLayers.map(({ layer }, index) => {
            const block = Blocks[layer.symbolID];
            const componentName = block.symbol.name;

            return (
              <InputField.Root key={index}>
                <InputField.Label>{componentName}</InputField.Label>
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
