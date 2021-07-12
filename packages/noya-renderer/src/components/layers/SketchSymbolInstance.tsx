import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { AffineTransform } from 'noya-geometry';
import { useFill } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import { Layers, Overrides, PageLayer, Primitives } from 'noya-state';
import { memo, useMemo } from 'react';
import { Group, Rect } from '../..';
import { useApplicationState } from 'noya-app-state-context';
import { useTintColorFilter } from '../../hooks/useTintColorFilter';
import SketchGroup from './SketchGroup';

interface SymbolProps {
  layer: Sketch.SymbolInstance;
  symbolMaster: Sketch.SymbolMaster;
  layerStyles: Sketch.SharedStyleContainer;
  layerTextStyles: Sketch.SharedTextStyleContainer;
}

const Symbol = memo(function Symbol({
  layer,
  symbolMaster,
  layerStyles,
  layerTextStyles,
}: SymbolProps) {
  const CanvasKit = useCanvasKit();

  const backgroundFillProperties = useMemo(
    () => ({
      color: Primitives.color(CanvasKit, symbolMaster.backgroundColor),
    }),
    [CanvasKit, symbolMaster.backgroundColor],
  );
  const fill = useFill(backgroundFillProperties);

  const rect = useMemo(() => Primitives.rect(CanvasKit, symbolMaster.frame), [
    CanvasKit,
    symbolMaster.frame,
  ]);

  const transform = useMemo(
    () =>
      AffineTransform.translation(
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
              override.layer.attributedString.string = override.value;
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

  return (
    <Group transform={transform} opacity={opacity} colorFilter={colorFilter}>
      {overriddenSymbolMaster.includeBackgroundColorInInstance && (
        <Rect paint={fill} rect={rect} />
      )}
      <SketchGroup layer={overriddenSymbolMaster} />
    </Group>
  );
});

interface Props {
  layer: Sketch.SymbolInstance;
}

export default memo(function SketchSymbolInstance({ layer }: Props) {
  const [state] = useApplicationState();

  const symbolMaster = useMemo(
    () =>
      Layers.findInArray(
        state.sketch.pages,
        (child) =>
          Layers.isSymbolMaster(child) && layer.symbolID === child.symbolID,
      ) as Sketch.SymbolMaster | undefined,
    [layer.symbolID, state.sketch.pages],
  );

  if (!symbolMaster) return null;

  return (
    <Symbol
      layer={layer}
      symbolMaster={symbolMaster}
      layerStyles={state.sketch.document.layerStyles}
      layerTextStyles={state.sketch.document.layerTextStyles}
    />
  );
});
