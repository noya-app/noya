import { useDispatch, useSelector } from 'noya-app-state-context';
import {
  EditableShadow,
  getEditableShadow,
  getEditableStyles,
  Selectors,
} from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import CheckboxArrayController from '../components/inspector/CheckboxArrayController';
import ShadowRow from '../components/inspector/ShadowRow';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function ShadowInspector() {
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

  return (
    <CheckboxArrayController<EditableShadow>
      title="Shadows"
      id="shadows"
      key="shadows"
      value={editableShadows}
      onClickPlus={useCallback(() => dispatch('addNewShadow'), [dispatch])}
      onClickTrash={useCallback(() => dispatch('deleteDisabledShadows'), [
        dispatch,
      ])}
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
        [dispatch],
      )}
    />
  );
});
