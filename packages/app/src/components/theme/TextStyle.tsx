import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { sketchColorToRgba } from 'noya-designsystem';
import { center, Size } from 'noya-geometry';
import { uuid } from 'noya-utils';
import SketchLayer from 'noya-renderer/src/components/layers/SketchLayer';
import { useTextLayerParagraph } from 'noya-renderer/src/components/layers/SketchText';
import { Models } from 'noya-state';
import React, { memo, useMemo } from 'react';
import CanvasGridItem from './CanvasGridItem';

interface Props {
  name: string;
  style: Sketch.Style;
}

function RCKTextStylePreview({
  name,
  style,
  size,
}: {
  name: string;
  style: Sketch.Style;
  size: Size;
}) {
  const layer = useMemo(() => {
    const layer = produce(Models.text, (draft) => {
      draft.do_objectID = uuid();
      draft.style = style;
      draft.attributedString.string = name;

      const encodedAttributes = draft.style.textStyle?.encodedAttributes;

      if (encodedAttributes) {
        draft.attributedString.attributes = [
          {
            _class: 'stringAttribute',
            location: 0,
            length: name.length,
            attributes: encodedAttributes,
          },
        ];

        encodedAttributes.paragraphStyle = encodedAttributes.paragraphStyle ?? {
          _class: 'paragraphStyle',
        };

        // Always center-align previews
        encodedAttributes.paragraphStyle.alignment =
          Sketch.TextHorizontalAlignment.Centered;
      }
    });

    layer.frame = {
      ...layer.frame,
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    };

    return layer;
  }, [size, style, name]);

  const paragraph = useTextLayerParagraph(layer);

  const measuredLayer = useMemo(() => {
    // Round up to avoid wrapping
    const width = Math.ceil(paragraph.getMaxWidth());
    const height = paragraph.getHeight();

    return {
      ...layer,
      frame: {
        ...layer.frame,
        ...center({ width, height }, size),
      },
    };
  }, [layer, paragraph, size]);

  return <SketchLayer layer={measuredLayer} />;
}

export default memo(function TextStyle({ name, style }: Props) {
  const color =
    style.textStyle?.encodedAttributes.MSAttributedStringColorAttribute;

  const backgroundColor = useMemo(() => {
    if (!color) return 'white';

    const rbga = sketchColorToRgba(color);
    /*
      Formula found in this question 
      https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
      Source: https://en.wikipedia.org/wiki/Relative_luminance 
    */
    const Y = 0.2126 * rbga.r + 0.7152 * rbga.g + 0.0722 * rbga.b;
    return Y < 128 ? 'white' : 'black';
  }, [color]);

  return (
    <CanvasGridItem
      background={backgroundColor}
      renderContent={(size) => (
        <RCKTextStylePreview name={name} style={style} size={size} />
      )}
    />
  );
});
