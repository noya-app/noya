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
export default memo(function ShadowInspector({
  allowMoreThanOne = true,
  supportsSpread = true,
}: {
  allowMoreThanOne?: boolean;
  supportsSpread?: boolean;
}) {
  const dispatch = useDispatch();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );

  const shadowMatrix = useShallowArray(
    selectedStyles.map((style) => style?.shadows ?? []),
  );

  const editableShadows: EditableShadow[] = useMemo(
    () => getEditableStyles(shadowMatrix, getEditableShadow),
    [shadowMatrix],
  );

  const handleAddShadow = useCallback(
    () => dispatch('addNewShadow'),
    [dispatch],
  );

  return (
    <CheckboxArrayController<EditableShadow>
      title="Shadows"
      id="shadows"
      key="shadows"
      value={editableShadows}
      onClickPlus={
        allowMoreThanOne || editableShadows.length === 0
          ? handleAddShadow
          : undefined
      }
      onClickTrash={useCallback(
        () => dispatch('deleteDisabledShadows'),
        [dispatch],
      )}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveShadow', sourceIndex, destinationIndex),
        [dispatch],
      )}
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setShadowEnabled', index, checked),
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
            id={`shadow-${index}`}
            prefix={checkbox}
            x={item.offsetX}
            y={item.offsetY}
            blur={item.blurRadius}
            spread={item.spread}
            supportsSpread={supportsSpread}
            onSetX={(value, mode) => dispatch('setShadowX', index, value, mode)}
            onSetY={(value, mode) => dispatch('setShadowY', index, value, mode)}
            onSetBlur={(value, mode) =>
              dispatch('setShadowBlur', index, value, mode)
            }
            onSetSpread={(value, mode) =>
              dispatch('setShadowSpread', index, value, mode)
            }
            colorProps={{
              color: item.color,
              onChangeColor: (value) =>
                dispatch('setShadowColor', index, value),
            }}
          />
        ),
        [dispatch, supportsSpread],
      )}
    />
  );
});
