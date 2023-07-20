import produce from 'immer';
import { StateProvider, useWorkspaceState } from 'noya-app-state-context';
import { GridView, Stack } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { Layers } from 'noya-state';
import React from 'react';
import { BlockPreviewProps } from '../../../docs/InteractiveBlockPreview';
import { useResolvedDesignSystem } from '../../../hooks/useResolvedDesignSystem';
import { blockMetadata } from '../../symbols/metadata';
import { DOMRenderer } from '../DOMRenderer';

// function NestedState({
//   children,
//   initialState,
// }: {
//   children: React.ReactNode;
//   initialState: WorkspaceState;
// }) {
//   const CanvasKit = useCanvasKit();
//   const fontManager = useFontManager();
//   const [state, dispatch] = useReducer(
//     (state: WorkspaceState, action: WorkspaceAction) =>
//       workspaceReducer(state, action, CanvasKit, fontManager),
//     initialState,
//   );

//   return (
//     <StateProvider state={state} dispatch={dispatch}>
//       {children}
//     </StateProvider>
//   );
// }

export function InspectorCarousel({
  items,
  onSelectItem,
  onHoverItemChange,
  selectedIndex,
  getSymbolMaster,
}: {
  items: BlockPreviewProps[];
  onSelectItem: (index: number) => void;
  onHoverItemChange?: (index: number, isHovering: boolean) => void;
  selectedIndex?: number;
  getSymbolMaster: (symbolId: string) => Sketch.SymbolMaster;
}) {
  const state = useWorkspaceState();
  const ds = useResolvedDesignSystem(
    state.history.present.sketch.document.designSystem,
  );

  if (!ds) return null;

  return (
    <GridView.Root scrollable={false} size="xs" textPosition="overlay" bordered>
      <GridView.Section padding={0}>
        {items.map((props, index) => {
          const customState = produce(state, (draft) => {
            const draftArtboard = Layers.find<Sketch.Artboard>(
              draft.history.present.sketch.pages[0],
              Layers.isArtboard,
            );

            if (!draftArtboard) return;

            const blockWidth =
              props.blockWidth ??
              blockMetadata[props.symbolId]?.preferredSize.width ??
              600;
            const blockHeight =
              props.blockHeight ??
              blockMetadata[props.symbolId]?.preferredSize.height ??
              400;
            draftArtboard.frame.width = blockWidth;
            draftArtboard.frame.height = blockHeight;

            draftArtboard.layers.length = 0;
            draftArtboard.layers.push(
              SketchModel.symbolInstance({
                symbolID: props.symbolId,
                frame: SketchModel.rect({
                  x: 0,
                  y: 0,
                  width: blockWidth,
                  height: blockHeight,
                }),
                blockParameters: props.blockParameters,
                blockText: props.blockText,
              }),
            );
          });

          return (
            <GridView.Item
              key={index}
              id={props.symbolId}
              title={props.name ?? ''}
              onClick={() => {
                onSelectItem(index);
              }}
              onHoverChange={(isHovering) => {
                onHoverItemChange?.(index, isHovering);
              }}
              selected={index === selectedIndex}
            >
              <Stack.V
                tabIndex={-1}
                background={'white'}
                width="100%"
                height="100%"
                // This color sets the component text, so that it doesn't default
                // to what GridView sets it to. This should be coming from Chakra
                color="black"
              >
                {/* <NestedState initialState={customState}> */}
                <StateProvider state={customState}>
                  <DOMRenderer
                    resizeBehavior={'fit-container'}
                    designSystem={ds}
                    sync={false}
                    padding={0}
                  />
                </StateProvider>
                {/* </NestedState> */}
                {/* <InteractiveBlockPreview
                key={props.symbolId}
                height="100%"
                width="100%"
                viewType="previewOnly"
                getSymbolMaster={getSymbolMaster}
                {...props}
              /> */}
                {/* Block pointer events */}
                <Stack.V width="100%" height="100%" position="absolute" />
              </Stack.V>
            </GridView.Item>
          );
        })}
      </GridView.Section>
    </GridView.Root>
  );
}
