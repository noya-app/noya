import { fileOpen } from 'browser-fs-access';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import {
  Button,
  Chip,
  DividerVertical,
  IconButton,
  Popover,
  Small,
  Spacer,
  Stack,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { AffineTransform, Rect, transformRect } from 'noya-geometry';
import { ChevronDownIcon } from 'noya-icons';
import { BlockContent, DrawableLayerType, Layers, Selectors } from 'noya-state';
import * as React from 'react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import ConfigureBlockTypeWebp from '../../assets/ConfigureBlockType.webp';
import { OnboardingAnimation } from '../../components/OnboardingAnimation';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Stacking } from '../stacking';
import { imageSymbolId } from '../symbols/symbolIds';
import { getAllInsertableSymbols } from '../symbols/symbols';
import { SearchCompletionMenu } from './SearchCompletionMenu';

// function getElementRect(element: HTMLElement) {
//   const style = window.getComputedStyle(element);
//   const width = parseFloat(style.width);
//   const height = parseFloat(style.height);
//   const marginLeft = parseFloat(style.marginLeft);
//   const marginTop = parseFloat(style.marginTop);
//   const left = element.offsetLeft - marginLeft;
//   const top = element.offsetTop - marginTop;
//   return { width, height, x: left, y: top };
// }

const ContentElement = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  borderRadius: 4,
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  color: theme.colors.textMuted,
}));

function WidgetContainer({
  frame,
  children,
  transform,
  zIndex,
  footer,
  label,
}: {
  frame: Rect;
  children?: React.ReactNode;
  transform?: AffineTransform;
  zIndex?: number;
  footer?: React.ReactNode;
  label?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        transform: transform?.toString(),
        zIndex,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
          pointerEvents: 'none',
        }}
      >
        {children}
        {footer && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100%)',
              right: 0,
              pointerEvents: 'all',
              cursor: 'default',
              whiteSpace: 'pre',
              display: 'flex',
              transformOrigin: 'top right',
              transform: AffineTransform.scale(
                transform ? 1 / transform.scaleComponents.x : 1,
                transform ? 1 / transform.scaleComponents.y : 1,
              )
                .translate(0, 6)
                .toString(),
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onPointerMove={(event) => {
              event.stopPropagation();
            }}
          >
            {footer}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            whiteSpace: 'pre',
            display: 'flex',
            transformOrigin: 'bottom right',
            transform: AffineTransform.scale(
              transform ? 1 / transform.scaleComponents.x : 1,
              transform ? 1 / transform.scaleComponents.y : 1,
            )
              .translate(-8, -4)
              .toString(),
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function BlockTypeOnboardingPopover({
  show,
  dismiss,
  trigger,
}: {
  show: boolean;
  dismiss?: () => void;
  trigger: ReactNode;
}) {
  if (!show) return <>{trigger}</>;

  return (
    <Popover
      trigger={trigger}
      open={show}
      closable
      side="right"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
      }}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
      }}
      onClickClose={() => {
        dismiss?.();
      }}
    >
      <Stack.V width={300} padding={20} gap={10} alignItems="start">
        <Small fontWeight={'bold'}>Step 2: Choose Block Type</Small>
        <Small>Noya chooses a default block type automatically.</Small>
        <Small>You can change the block type by clicking this dropdown.</Small>
        <Small>
          You can also type slash{' '}
          <Chip style={{ fontSize: '13px' }} variant="secondary">
            /
          </Chip>{' '}
          within the block to search block types.
        </Small>
        <OnboardingAnimation src={ConfigureBlockTypeWebp.src} />
      </Stack.V>
    </Popover>
  );
}

export const Widget = function Widget({
  layer,
  onChangeBlockType,
  onChangeBlockContent,
  setOverriddenBlock,
  uploadAsset,
  showToolbar = true,
}: {
  layer: Sketch.AnyLayer;
  onChangeBlockType: (type: DrawableLayerType) => void;
  onChangeBlockContent: (content: BlockContent) => void;
  setOverriddenBlock: (preview: BlockContent | undefined) => void;
  uploadAsset: (file: ArrayBuffer) => Promise<string>;
  showToolbar?: boolean;
}) {
  const { canvasInsets } = useWorkspace();
  const [state, dispatch] = useApplicationState();
  const { isContextMenuOpen } = useWorkspace();
  const { onboardingStep, setOnboardingStep } = useOnboarding();
  const page = Selectors.getCurrentPage(state);
  const rect = Selectors.getBoundingRect(page, [layer.do_objectID])!;
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const symbol = Layers.isSymbolInstance(layer)
    ? Selectors.getSymbolMaster(state, layer.symbolID)
    : undefined;

  const isPrimarySelected = state.selectedLayerIds[0] === layer.do_objectID;

  const isEditing =
    state.interactionState.type === 'editingBlock' &&
    state.interactionState.layerId === layer.do_objectID;

  const symbolItems = useMemo(
    () =>
      getAllInsertableSymbols(state).map((symbol) => ({
        name: symbol.name,
        id: symbol.symbolID,
      })),
    [state],
  );

  const [showBlockPicker, setShowBlockPicker] = useState(false);

  const showWidgetUI =
    isPrimarySelected &&
    !isContextMenuOpen &&
    state.interactionState.type !== 'drawing' &&
    state.interactionState.type !== 'marquee' &&
    state.selectedLayerIds.length === 1;

  const showTypeOnboarding = showWidgetUI && onboardingStep === 'insertedBlock';

  // Hide the block picker whenever the widget UI is hidden
  useEffect(() => {
    const shouldHide = !showWidgetUI;

    if (shouldHide) {
      setShowBlockPicker(false);
    }
  }, [showWidgetUI, isEditing]);

  if (!Layers.isSymbolInstance(layer)) return null;

  const blockText = layer.blockText ?? '';

  return (
    <WidgetContainer
      frame={rect}
      transform={canvasTransform}
      zIndex={showWidgetUI ? Stacking.level.interactive : undefined}
      label={
        !showWidgetUI && (
          <Small opacity={0.5}>{symbol?.name ?? layer.name}</Small>
        )
      }
      footer={
        showToolbar &&
        showWidgetUI && (
          <Stack.V gap={6} alignItems="flex-end">
            <BlockTypeOnboardingPopover
              show={showTypeOnboarding}
              dismiss={() => setOnboardingStep('configuredBlockType')}
              trigger={
                <ContentElement>
                  <Stack.H
                    flex="1"
                    padding={'4px 6px'}
                    gap={6}
                    separator={
                      <DividerVertical variant="strong" overflow={4} />
                    }
                  >
                    {layer.symbolID === imageSymbolId && (
                      <IconButton
                        iconName="UploadIcon"
                        onPointerDown={async (event) => {
                          event.preventDefault();

                          const file = await fileOpen({
                            extensions: ['.png', '.jpg', '.webp'],
                            mimeTypes: [
                              'image/png',
                              'image/jpeg',
                              'image/webp',
                            ],
                          });

                          const url = await uploadAsset(
                            await file.arrayBuffer(),
                          );

                          dispatch('interaction', ['reset']);
                          dispatch('selectLayer', []);
                          onChangeBlockContent({
                            blockText: url,
                          });
                        }}
                      />
                    )}
                    <Stack.H>
                      <Popover
                        open={showBlockPicker}
                        onOpenChange={(open) => {
                          if (open) {
                            setShowBlockPicker(true);
                          }
                          if (!open) {
                            setOverriddenBlock(undefined);
                          }
                        }}
                        onInteractOutside={(event) => {
                          event.preventDefault();
                          setOverriddenBlock(undefined);
                        }}
                        onPointerDownOutside={(event) => {
                          setShowBlockPicker(false);
                          setOverriddenBlock(undefined);
                        }}
                        trigger={
                          <Button
                            variant="none"
                            onClick={() => {
                              setShowBlockPicker(!showBlockPicker);
                            }}
                          >
                            {symbol?.name}
                            <Spacer.Horizontal size={4} />
                            <ChevronDownIcon />
                          </Button>
                        }
                      >
                        <SearchCompletionMenu
                          items={symbolItems}
                          onClose={() => {
                            setOverriddenBlock(undefined);
                            setShowBlockPicker(false);
                          }}
                          onHover={(item) => {
                            if (!showBlockPicker) return;

                            setOverriddenBlock({
                              symbolId: item.id,
                              blockText,
                            });
                          }}
                          onSelect={(item) => {
                            setOverriddenBlock(undefined);
                            setShowBlockPicker(false);
                            onChangeBlockType({ symbolId: item.id });
                          }}
                        />
                      </Popover>
                    </Stack.H>
                  </Stack.H>
                </ContentElement>
              }
            />
          </Stack.V>
        )
      }
    />
  );
};

export function DrawingWidget() {
  const [state] = useApplicationState();
  const { canvasInsets } = useWorkspace();
  const transform = Selectors.getCanvasTransform(state, canvasInsets);

  if (state.interactionState.type !== 'drawing') return null;

  const block = state.interactionState.shapeType;

  if (typeof block === 'string') return null;

  const symbol = Selectors.getSymbolMaster(state, block.symbolId);

  const rect = transformRect(
    Selectors.getDrawnLayerRect(
      state.interactionState.origin,
      state.interactionState.current,
      state.interactionState.options,
    ),
    transform,
  );

  return (
    <WidgetContainer
      frame={rect}
      zIndex={Stacking.level.interactive}
      footer={
        <ContentElement>
          <Stack.H flex="1" padding={'4px 6px'}>
            <Button variant="none">
              {symbol?.name}
              <Spacer.Horizontal size={4} />
              <ChevronDownIcon />
            </Button>
          </Stack.H>
        </ContentElement>
      }
    />
  );
}

export function MultipleSelectionWidget() {
  const [state] = useApplicationState();
  const { canvasInsets } = useWorkspace();
  const transform = Selectors.getCanvasTransform(state, canvasInsets);

  if (state.interactionState.type !== 'none') return null;

  const page = Selectors.getCurrentPage(state);
  const boundingRect = Selectors.getBoundingRect(page, state.selectedLayerIds, {
    groups: 'childrenOnly',
    includeHiddenLayers: true,
  });

  if (!boundingRect) return null;

  const rect = transformRect(boundingRect, transform);

  // const layers = Selectors.getSelectedLayers(state);

  return (
    <WidgetContainer
      frame={rect}
      zIndex={Stacking.level.interactive}
      footer={
        <ContentElement>
          <Stack.H
            flex="1"
            padding={'4px 6px'}
            gap={6}
            separator={<DividerVertical variant="strong" overflow={4} />}
          >
            <Button variant="none">Multiple</Button>
          </Stack.H>
        </ContentElement>
      }
    />
  );
}

// function shouldShowReload(layer: Sketch.SymbolInstance): boolean {
//   const block = Blocks[layer.symbolID];

//   if (!block) return false;

//   if (block.usesResolver) return true;

//   return block.symbol.layers
//     .filter(Layers.isSymbolInstance)
//     .some(shouldShowReload);
// }

// function clearResolvedData({
//   layer,
//   dispatch,
// }: {
//   layer: Sketch.SymbolInstance;
//   dispatch: FlatDispatcher;
// }) {
//   dispatch('setResolvedBlockData', layer.do_objectID, undefined);

//   clearResolverCache(layer.do_objectID);

//   layer.overrideValues.forEach((override) => {
//     const { layerIdPath, propertyType } = Overrides.decodeName(
//       override.overrideName,
//     );

//     if (propertyType === 'resolvedBlockData') {
//       clearResolverCache(`${layer.do_objectID}@${layerIdPath.join('/')}`);

//       dispatch(
//         'setOverrideValue',
//         [layer.do_objectID],
//         override.overrideName,
//         undefined,
//       );
//     }
//   });
// }