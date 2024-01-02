import { useShallowArray } from '@noya-app/react-utils';
import { useDispatch, useSelector } from 'noya-app-state-context';
import { CheckboxArrayController, ShadowRow } from 'noya-inspector';
import {
  EditableShadow,
  Selectors,
  getEditableShadow,
  getEditableStyles,
} from 'noya-state';
import React, { ReactNode, memo, useCallback, useMemo } from 'react';

export default memo(function InnerShadowInspector() {
  const dispatch = useDispatch();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );

  const shadowMatrix = useShallowArray(
    selectedStyles.map((style) => style?.innerShadows ?? []),
  );

  const editableShadows: EditableShadow[] = useMemo(
    () => getEditableStyles(shadowMatrix, getEditableShadow),
    [shadowMatrix],
  );

  return (
    <CheckboxArrayController<EditableShadow>
      title="Inner Shadows"
      id="inner-shadow"
      key="inner-shadow"
      value={editableShadows}
      onClickPlus={useCallback(() => dispatch('addNewInnerShadow'), [dispatch])}
      onClickTrash={useCallback(
        () => dispatch('deleteDisabledInnerShadows'),
        [dispatch],
      )}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveInnerShadow', sourceIndex, destinationIndex),
        [dispatch],
      )}
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setInnerShadowEnabled', index, checked),
        [dispatch],
      )}
      renderItem={useCallback(
        ({
          item,
          index,
          checkbox,
        }: {
          item: EditableShadow;
          index: number;
          checkbox: ReactNode;
        }) => (
          <ShadowRow
            id={`inner-shadow-${index}`}
            prefix={checkbox}
            x={item.offsetX}
            y={item.offsetY}
            blur={item.blurRadius}
            spread={item.spread}
            supportsSpread
            onSetX={(value, mode) =>
              dispatch('setInnerShadowX', index, value, mode)
            }
            onSetY={(value, mode) =>
              dispatch('setInnerShadowY', index, value, mode)
            }
            onSetBlur={(value, mode) =>
              dispatch('setInnerShadowBlur', index, value, mode)
            }
            onSetSpread={(value, mode) =>
              dispatch('setInnerShadowSpread', index, value, mode)
            }
            colorProps={{
              color: item.color,
              onChangeColor: (value) =>
                dispatch('setInnerShadowColor', index, value),
            }}
          />
        ),
        [dispatch],
      )}
    />
  );
});
