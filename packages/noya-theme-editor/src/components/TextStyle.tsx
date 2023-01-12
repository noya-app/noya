import produce from 'immer';
import { sketchColorToRgba } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { center, Size } from 'noya-geometry';
import { SketchLayer, useTextLayerParagraph } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { Selectors } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { CanvasPreviewItem } from './CanvasPreviewItem';

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
    const textStyle = produce(
      style.textStyle ?? SketchModel.textStyle(),
      (textStyle) => {
        textStyle.encodedAttributes.paragraphStyle = SketchModel.paragraphStyle(
          {
            ...textStyle.encodedAttributes.paragraphStyle,
            // Always center-align previews
            alignment: Sketch.TextHorizontalAlignment.Centered,
          },
        );
      },
    );

    return SketchModel.text({
      style: { ...style, textStyle },
      frame: SketchModel.rect({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
      }),
      attributedString: Selectors.fromTextSpans([
        {
          string: name,
          attributes: textStyle.encodedAttributes,
        },
      ]),
    });
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

export const TextStyle = memo(function TextStyle({ name, style }: Props) {
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
    <CanvasPreviewItem
      background={backgroundColor}
      renderContent={(size) => (
        <RCKTextStylePreview name={name} style={style} size={size} />
      )}
    />
  );
});
