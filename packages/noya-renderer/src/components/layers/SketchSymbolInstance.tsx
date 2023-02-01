import produce from 'immer';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { AffineTransform } from 'noya-geometry';
import { useFill } from 'noya-react-canvaskit';
import {
  Layers,
  Overrides,
  PageLayer,
  Primitives,
  replaceTextInRange,
  Selectors,
} from 'noya-state';
import React, { memo, useMemo } from 'react';
import { Group, Rect } from '../../ComponentsContext';
import { useCanvasKit } from '../../hooks/useCanvasKit';
import { useTintColorFilter } from '../../hooks/useTintColorFilter';
import SketchGroup from './SketchGroup';
import { BaseLayerProps } from './types';

interface SymbolProps extends BaseLayerProps {
  layer: Sketch.SymbolInstance;
  symbolMaster: Sketch.SymbolMaster;
  layerStyles: Sketch.SharedStyleContainer;
  layerTextStyles: Sketch.SharedTextStyleContainer;
  wireframe?: boolean;
}

const Symbol = memo(function Symbol({
  layer,
  symbolMaster,
  layerStyles,
  layerTextStyles,
  wireframe,
  SketchLayer,
}: SymbolProps) {
  const CanvasKit = useCanvasKit();

  const backgroundFillProperties = useMemo(
    () => ({
      color: Primitives.color(CanvasKit, symbolMaster.backgroundColor),
    }),
    [CanvasKit, symbolMaster.backgroundColor],
  );
  const fill = useFill(backgroundFillProperties);

  const rect = useMemo(
    () => Primitives.rect(CanvasKit, symbolMaster.frame),
    [CanvasKit, symbolMaster.frame],
  );

  const transform = useMemo(
    () =>
      AffineTransform.translate(
        layer.frame.x - symbolMaster.frame.x,
        layer.frame.y - symbolMaster.frame.y,
      ),
    [layer.frame, symbolMaster.frame],
  );

  const overriddenSymbolMaster = useMemo(() => {
    return produce(symbolMaster, (draft) => {
      layer.overrideValues.forEach(({ overrideName, value }) => {
        const {
          layerIdPath: [layerId, ...remainingLayerIdPath],
          propertyType,
        } = Overrides.decodeName(overrideName);

        const targetLayer = Layers.find(
          draft,
          (l) => l.do_objectID === layerId,
        ) as PageLayer;

        if (!targetLayer) return;

        if (remainingLayerIdPath.length > 0) {
          if (!Layers.isSymbolInstance(targetLayer)) return;

          // Propagate the override into the nested symbol and handle it there instead
          targetLayer.overrideValues.push({
            _class: 'overrideValue',
            overrideName: Overrides.encodeName(
              remainingLayerIdPath,
              propertyType,
            ),
            value,
          });
        } else {
          const override = Overrides.getLayerOverride(
            targetLayer,
            propertyType,
            value,
          );

          if (!override) return;

          switch (override.type) {
            case 'stringValue':
              override.layer.attributedString = replaceTextInRange(
                override.layer.attributedString,
                [0, override.layer.attributedString.string.length],
                override.value,
                Selectors.getEncodedStringAttributes(override.layer.style),
              );
              break;
            case 'symbolID':
              override.layer.symbolID = override.value;
              break;
            case 'image':
              override.layer.image = override.value;
              break;
            case 'textStyle': {
              const style = layerTextStyles.objects.find(
                (obj) => obj.do_objectID === override.value,
              )?.value;

              if (!style || !style.textStyle) return;

              override.layer.style = style;
              override.layer.attributedString.attributes = [
                {
                  _class: 'stringAttribute',
                  location: 0,
                  length: override.layer.attributedString.string.length,
                  attributes: style.textStyle.encodedAttributes,
                },
              ];
              break;
            }
            case 'layerStyle': {
              override.layer.style = layerStyles.objects.find(
                (obj) => obj.do_objectID === override.value,
              )?.value;
              break;
            }
          }
        }
      });
    });
  }, [
    symbolMaster,
    layer.overrideValues,
    layerStyles.objects,
    layerTextStyles.objects,
  ]);

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  const firstFill = layer.style?.fills?.[0];
  const tintColor =
    firstFill && firstFill.isEnabled ? firstFill.color : undefined;
  const colorFilter = useTintColorFilter(tintColor);

  if (wireframe) return null;

  return (
    <Group transform={transform} opacity={opacity} colorFilter={colorFilter}>
      {overriddenSymbolMaster.includeBackgroundColorInInstance && (
        <Rect paint={fill} rect={rect} />
      )}
      <SketchGroup SketchLayer={SketchLayer} layer={overriddenSymbolMaster} />
    </Group>
  );
});

interface Props extends BaseLayerProps {
  layer: Sketch.SymbolInstance;
}

export default memo(function SketchSymbolInstance({
  layer,
  SketchLayer,
}: Props) {
  const {
    preferences: { wireframeMode },
  } = useWorkspace();
  const [state] = useApplicationState();

  const symbolMaster = useMemo(
    () => Selectors.getSymbolMaster(state, layer.symbolID),
    [layer.symbolID, state],
  );

  if (!symbolMaster) return null;

  return (
    <Symbol
      layer={layer}
      symbolMaster={symbolMaster}
      layerStyles={state.sketch.document.layerStyles}
      layerTextStyles={state.sketch.document.layerTextStyles}
      SketchLayer={SketchLayer}
      wireframe={wireframeMode}
    />
  );
});
