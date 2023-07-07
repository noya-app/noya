import { useApplicationState } from 'noya-app-state-context';
import {
  Chip,
  CompletionItem,
  InputField,
  InputFieldWithCompletions,
  Spacer,
  Stack,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import { useKeyboardShortcuts } from 'noya-keymap';
import { OverriddenBlockContent, getSiblingBlocks } from 'noya-state';
import React, { useCallback, useMemo } from 'react';
import { BlockPreviewProps } from '../../docs/InteractiveBlockPreview';
import { Blocks, allInsertableBlocks } from '../blocks/blocks';
import { boxSymbolId } from '../blocks/symbolIds';
import { parametersToTailwindStyle } from '../blocks/tailwind';
import { inferBlockTypes } from '../inferBlock';
import { InspectorCarousel } from './InspectorCarousel';

const InspectorSection = ({
  children,
  title,
  titleTextStyle,
}: {
  children: React.ReactNode;
  title?: string;
  titleTextStyle?: 'small';
}) => (
  <Stack.V
    padding={title ? '32px 12px 12px' : '12px'}
    gap="12px"
    background="white"
  >
    {title && (
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title textStyle={titleTextStyle}>
          {title}
        </InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
    )}
    {children}
  </Stack.V>
);

export function AyonLayerInspector({
  setOverriddenBlock,
  selectedLayer,
}: {
  selectedLayer: Sketch.SymbolInstance;
  setOverriddenBlock: (
    overriddenBlock: OverriddenBlockContent | undefined,
  ) => void;
}) {
  const [state, dispatch] = useApplicationState();

  const componentSearchInputRef = React.useRef<HTMLInputElement>(null);
  const styleSearchInputRef = React.useRef<HTMLInputElement>(null);

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

  const onSetOverriddenBlock = useCallback(
    (item: BlockPreviewProps | undefined) => {
      if (item) {
        setOverriddenBlock({
          layerId: selectedLayer.do_objectID,
          blockContent: {
            symbolId: item.blockId,
            blockText: item.blockText,
            overrides: item.overrideValues,
            blockParameters: item.blockParameters,
          },
        });
      } else {
        setOverriddenBlock(undefined);
      }
    },
    [selectedLayer.do_objectID, setOverriddenBlock],
  );

  const handleHoverBlockItem = useCallback(
    (item: CompletionItem | undefined) => {
      onSetOverriddenBlock(
        item
          ? {
              blockId: item.id,
              blockText: selectedLayer.blockText,
              overrideValues: selectedLayer.overrideValues,
              resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
            }
          : undefined,
      );
    },
    [
      onSetOverriddenBlock,
      selectedLayer.blockText,
      selectedLayer.overrideValues,
      selectedLayer.resolvedBlockData?.resolvedText,
    ],
  );

  useKeyboardShortcuts({
    '/': () => {
      componentSearchInputRef.current?.focus();
    },
    '#': () => {
      styleSearchInputRef.current?.focus();
    },
  });

  const block = Blocks[selectedLayer.symbolID];
  const componentName = block.symbol.name;
  const blockTypes = inferBlockTypes({
    frame: selectedLayer.frame,
    blockText: selectedLayer.blockText,
    siblingBlocks: getSiblingBlocks(state),
  });

  const relatedBlocks: BlockPreviewProps[] = [
    {
      blockId: selectedLayer.symbolID,
      blockText: selectedLayer.blockText,
      blockParameters: selectedLayer.blockParameters,
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
          blockParameters: selectedLayer.blockParameters,
          overrideValues: selectedLayer.overrideValues,
          resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
        }),
      ),
  ];

  const presetStyles: BlockPreviewProps[] = [
    {
      blockId: selectedLayer.symbolID,
      blockText: selectedLayer.blockText,
      blockParameters: [],
      overrideValues: selectedLayer.overrideValues,
      resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
    },
    {
      blockId: selectedLayer.symbolID,
      blockText: selectedLayer.blockText,
      blockParameters: ['dark'],
      overrideValues: selectedLayer.overrideValues,
      resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
    },
  ];

  const styleItems = useMemo(
    () =>
      (block.hashtags ?? []).map((item) => ({
        name: item,
        id: item,
        icon: <HashtagIcon item={item} />,
      })),
    [block.hashtags],
  );

  const unusedStyleItems = styleItems.filter(
    (item) => !selectedLayer.blockParameters?.includes(item.name),
  );

  return (
    <Stack.V gap="1px">
      <InspectorSection>
        <InputFieldWithCompletions
          ref={componentSearchInputRef}
          placeholder={componentName}
          items={blockCompletionItems}
          onSelectItem={handleSelectBlockItem}
          onHoverItem={handleHoverBlockItem}
        >
          <InputField.Button>
            Pick
            <Spacer.Horizontal size={8} inline />
            <span style={{ opacity: 0.5 }}>/</span>
          </InputField.Button>
        </InputFieldWithCompletions>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>
            Related Components
          </InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorCarousel
          key={selectedLayer.symbolID}
          items={relatedBlocks}
          selectedIndex={0}
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
      <InspectorSection title="Style" titleTextStyle="small">
        <InputFieldWithCompletions
          ref={styleSearchInputRef}
          placeholder={'Styles'}
          items={unusedStyleItems}
          onSelectItem={(item) => {
            dispatch('setBlockParameters', undefined, [
              ...(selectedLayer.blockParameters ?? []),
              item.name,
            ]);
          }}
          onHoverItem={(item) => {
            if (item) {
              onSetOverriddenBlock({
                blockId: selectedLayer.symbolID,
                blockText: selectedLayer.blockText,
                blockParameters: (selectedLayer.blockParameters ?? []).concat(
                  item.name,
                ),
                overrideValues: selectedLayer.overrideValues,
                resolvedBlockText:
                  selectedLayer.resolvedBlockData?.resolvedText,
              });
            } else {
              onSetOverriddenBlock(undefined);
            }
          }}
        >
          <InputField.Button>
            Add
            <Spacer.Horizontal size={8} inline />
            <span style={{ opacity: 0.5 }}>#</span>
          </InputField.Button>
        </InputFieldWithCompletions>
        {selectedLayer.blockParameters &&
          selectedLayer.blockParameters.length > 0 && (
            <Stack.H flexWrap="wrap" gap="8px">
              {selectedLayer.blockParameters.map((parameter) => (
                <Chip
                  deletable
                  onDelete={() => {
                    dispatch(
                      'setBlockParameters',
                      undefined,
                      (selectedLayer.blockParameters ?? []).filter(
                        (p) => p !== parameter,
                      ),
                    );
                  }}
                  style={{
                    backgroundColor: '#545454',
                    color: 'white',
                  }}
                  key={parameter}
                >
                  {parameter}
                </Chip>
              ))}
            </Stack.H>
          )}
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Presets</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorCarousel
          items={presetStyles}
          selectedIndex={
            !selectedLayer.blockParameters ||
            selectedLayer.blockParameters.length === 0
              ? 0
              : selectedLayer.blockParameters.length === 1 &&
                selectedLayer.blockParameters[0] === 'dark'
              ? 1
              : undefined
          }
          onSelectItem={(index) => {
            dispatch(
              'setBlockParameters',
              undefined,
              presetStyles[index].blockParameters ?? [],
            );
          }}
          onHoverItemChange={(index, isHovering) => {
            onSetOverriddenBlock(isHovering ? presetStyles[index] : undefined);
          }}
        />
      </InspectorSection>
      {/* <InspectorSection title="Content">
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
      </InspectorSection> */}
    </Stack.V>
  );
}

function HashtagIcon({ item }: { item: string }) {
  const resolvedStyle = parametersToTailwindStyle({
    [item]: true,
  });

  return (
    <div
      style={{
        width: 19,
        height: 19,
        borderWidth: /^border(?!-\d)/.test(item) ? 1 : undefined,
        background: /^rounded/.test(item)
          ? 'rgb(148 163 184)'
          : /^opacity/.test(item)
          ? 'black'
          : undefined,
        ...resolvedStyle,
      }}
      className={/^(p\w?-|m\w?-)/.test(item) ? undefined : item}
    >
      {/^(text|font)/.test(item) ? 'Tt' : null}
    </div>
  );
}
