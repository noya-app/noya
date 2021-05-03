import Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridView } from 'noya-designsystem';
import { delimitedPath } from 'noya-utils';
import TextStyle from './TextStyle';
import { memo } from 'react';

interface Props {
  sharedStyles: Sketch.SharedStyle[];
}

export default memo(function SwatchesGrid({ sharedStyles }: Props) {
  return (
    <GridView.Root onClick={() => {}}>
      <GridView.Section>
        {sharedStyles.map((item) => {
          const text = delimitedPath.basename(item.name);
          const encoded = item.value.textStyle?.encodedAttributes;
          const color = encoded?.MSAttributedStringColorAttribute;
          const attributes =
            encoded?.MSAttributedStringFontAttribute.attributes;

          if (!attributes || !color) return null;

          return (
            <GridView.Item
              id={item.do_objectID}
              key={item.do_objectID}
              selected={false}
              title={text}
            >
              <TextStyle text={text} size={attributes.size} color={color} />
            </GridView.Item>
          );
        })}
      </GridView.Section>
    </GridView.Root>
  );
});
