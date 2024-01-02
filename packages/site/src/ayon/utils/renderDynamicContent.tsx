import { Sketch } from '@noya-app/noya-file-format';
import {
  DesignSystemDefinition,
  component,
} from '@noya-design-system/protocol';
import produce from 'immer';
import { SketchModel } from 'noya-sketch-model';
import {
  InteractionState,
  Selectors,
  createOverrideHierarchy,
} from 'noya-state';
import React, { ReactNode } from 'react';
import { boxSymbol } from '../symbols/primitive/BoxSymbol';

export function renderDynamicContent(
  system: DesignSystemDefinition,
  artboard: Sketch.Artboard,
  getSymbolMaster: (symbolId: string) => Sketch.SymbolMaster,
  drawing: Extract<InteractionState, { type: 'drawing' }> | undefined,
  theme: unknown,
  mode: 'absolute-layout' | 'automatic-layout',
) {
  const Provider = system.components[component.id.Provider];

  type RenderableItem = {
    instance: Sketch.SymbolInstance;
    nested: RenderableItem[];
    indexPath: number[];
  };

  function renderSymbol({
    instance,
    nested,
    indexPath,
  }: RenderableItem): ReactNode {
    const master = getSymbolMaster(instance.symbolID);

    if (!master) return null;

    const render =
      master.blockDefinition?.render ??
      (master.blockDefinition?.primitiveSymbolID
        ? getSymbolMaster(master.blockDefinition.primitiveSymbolID)
            .blockDefinition!.render!
        : boxSymbol.blockDefinition!.render!);

    const content: ReactNode = render({
      passthrough: {
        key: `${indexPath.join('.')}-${instance.do_objectID}}`,
      },
      Components: system.components,
      instance: produce(instance, (draft) => {
        draft.blockParameters =
          instance.blockParameters ??
          master.blockDefinition?.placeholderParameters;
      }),
      getSymbolMaster,
      children: nested.map(renderSymbol),
    });

    return content;
  }

  function renderTopLevelSymbol(item: RenderableItem): ReactNode {
    const content = renderSymbol(item);

    if (mode === 'automatic-layout') return content;

    const { instance } = item;

    return (
      <div
        key={instance.do_objectID}
        style={{
          position: 'absolute',
          left: instance.frame.x,
          top: instance.frame.y,
          width: instance.frame.width,
          height: instance.frame.height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {content}
      </div>
    );
  }

  const drawingLayer = drawing
    ? SketchModel.symbolInstance({
        do_objectID: 'drawing',
        frame: SketchModel.rect(
          Selectors.getDrawnLayerRect(
            drawing.origin,
            drawing.current,
            drawing.options,
          ),
        ),
        symbolID:
          typeof drawing.shapeType === 'string'
            ? component.id.Button
            : drawing.shapeType.symbolId,
      })
    : undefined;

  const drawingArtboard = drawingLayer
    ? produce(artboard, (draft) => {
        draft.layers.push(drawingLayer);
      })
    : artboard;

  const hierarchy = createOverrideHierarchy(
    getSymbolMaster,
  ).map<RenderableItem>(
    drawingArtboard,
    (instance, transformedChildren, indexPath) => {
      return {
        instance: instance as Sketch.SymbolInstance,
        nested: transformedChildren,
        indexPath: [...indexPath],
      };
    },
  );

  const content = hierarchy.nested.map(renderTopLevelSymbol);

  return Provider ? <Provider theme={theme}>{content}</Provider> : content;
}
