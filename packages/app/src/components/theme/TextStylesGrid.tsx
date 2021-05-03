import Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridView } from 'noya-designsystem';
import { delimitedPath } from 'noya-utils';
import { SelectionType } from 'noya-state';
import TextStyle from './TextStyle';
import { memo } from 'react';

interface Props {
  sharedStyles: Sketch.SharedStyle[];
  selectedTextStyles: string[];
  onSelectTextStyle: (id?: string, selectionType?: SelectionType) => void;
}

export default memo(function SwatchesGrid({
  sharedStyles,
  selectedTextStyles,
  onSelectTextStyle,
}: Props) {
  return (
    <GridView.Root onClick={() => onSelectTextStyle(undefined, 'replace')}>
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
              selected={selectedTextStyles.includes(item.do_objectID)}
              title={text}
              onClick={(event: React.MouseEvent) =>
                onSelectTextStyle(
                  item.do_objectID,
                  event.shiftKey ? 'intersection' : 'replace',
                )
              }
            >
              <TextStyle text={text} size={attributes.size} color={color} />
            </GridView.Item>
          );
        })}
      </GridView.Section>
    </GridView.Root>
  );
});
