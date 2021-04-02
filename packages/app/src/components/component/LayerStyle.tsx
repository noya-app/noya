import Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo, useMemo } from 'react';
import styled from 'styled-components';
import { sketchColorToRgbaString } from 'noya-designsystem';

interface Props {
  style: Sketch.Style;
}

interface SharedStyleProps {
  border: string;
  background: string;
  shadow: string;
  opacity: number;
}

const LayerStyle = styled.div(
  ({ border, background, shadow, opacity }: SharedStyleProps) => ({
    height: '65px',
    width: '65px',
    border: border,
    borderRadius: '10px',
    background: background,
    boxShadow: shadow,
    opacity: opacity,
  }),
);

export default memo(function SharedStyle({ style }: Props) {
  const enabledBorders = useMemo(
    () => style.borders?.filter((border) => border.isEnabled),
    [style],
  );

  const boxShadow = useMemo(() => {
    let boxshadow = '';
    if (style.shadows && style.shadows.length) {
      const shadow = style.shadows[0];
      const innerShadow =
        style.innerShadows && style.innerShadows.length
          ? `inset ${style.innerShadows[0].offsetX}px ${
              style.innerShadows[0].offsetY
            }px ${sketchColorToRgbaString(style.innerShadows[0].color)}`
          : '';

      boxshadow = `${shadow.offsetX}px ${
        shadow.offsetY
      }px ${sketchColorToRgbaString(shadow.color)} ${innerShadow}}`;
    }
    if (enabledBorders && enabledBorders.length > 1) {
      const border = enabledBorders.map((border, index, array) => {
        const previousBorder = index > 0 ? array[index - 1].thickness : 0;
        return `0 0 0 ${
          border.thickness + previousBorder
        }px ${sketchColorToRgbaString(border.color)}`;
      });

      return boxshadow + (boxshadow === '' ? '' : ',') + border.join(',');
    }
    return boxshadow;
  }, [style, enabledBorders]);

  const border = useMemo(() => {
    if (enabledBorders && enabledBorders.length === 1) {
      const border = enabledBorders[0];
      return `${border.thickness}px solid ${sketchColorToRgbaString(
        border.color,
      )}`;
    }

    return '';
  }, [enabledBorders]);

  const background = useMemo(
    () =>
      style.fills
        ? style.fills
            .filter((e) => e.isEnabled)
            .map(
              (e) =>
                `linear-gradient(
                  ${sketchColorToRgbaString(e.color)}, 
                  ${sketchColorToRgbaString(e.color)})`,
            )
            .join(',')
        : '',
    [style],
  );

  const opacity = useMemo(
    () => (style.contextSettings ? style.contextSettings.opacity : 1),
    [style],
  );

  return (
    <LayerStyle
      border={border}
      background={background}
      shadow={boxShadow}
      opacity={opacity}
    />
  );
});
