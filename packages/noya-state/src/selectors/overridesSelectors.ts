import produce from 'immer';
import Sketch from 'noya-file-format';
import { Layers } from '../layer';
import { PageLayer } from '../layers';
import { decodeName, encodeName, getLayerOverride } from '../overrides';
import { replaceTextInRange } from './attributedStringSelectors';
import { getEncodedStringAttributes } from './textStyleSelectors';

interface SymbolProps {
  overrideValues: Sketch.SymbolInstance['overrideValues'];
  symbolMaster: Sketch.SymbolMaster;
  layerStyles?: Sketch.SharedStyleContainer;
  layerTextStyles?: Sketch.SharedTextStyleContainer;
}

export function applyOverrides({
  overrideValues,
  symbolMaster,
  layerStyles,
  layerTextStyles,
}: SymbolProps): Sketch.SymbolMaster {
  return produce(symbolMaster, (draft) => {
    overrideValues.forEach(({ overrideName, value }) => {
      const {
        layerIdPath: [layerId, ...remainingLayerIdPath],
        propertyType,
      } = decodeName(overrideName);

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
          overrideName: encodeName(remainingLayerIdPath, propertyType),
          value,
        });
      } else {
        const override = getLayerOverride(targetLayer, propertyType, value);

        if (!override) return;

        switch (override.type) {
          case 'stringValue':
            override.layer.attributedString = replaceTextInRange(
              override.layer.attributedString,
              [0, override.layer.attributedString.string.length],
              override.value,
              getEncodedStringAttributes(override.layer.style),
            );
            break;
          case 'symbolID':
            override.layer.symbolID = override.value;
            break;
          case 'image':
            override.layer.image = override.value;
            break;
          case 'textStyle': {
            const style = layerTextStyles?.objects.find(
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
            const style = layerStyles?.objects.find(
              (obj) => obj.do_objectID === override.value,
            )?.value;

            if (!style) return;

            override.layer.style = style;
            break;
          }
          case 'blockText':
            if (!override.value) return;

            override.layer.blockText = override.value;
            break;
        }
      }
    });
  });
}
