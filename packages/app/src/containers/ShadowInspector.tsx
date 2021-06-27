import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { isDeepEqual, zipLongest } from 'noya-utils';
import { memo, ReactNode, useCallback } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import ShadowRow from '../components/inspector/ShadowRow';
import { useDispatch, useSelector } from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import getMultiNumberValue from '../utils/getMultiNumberValue';
import getMultiValue from '../utils/getMultiValue';

type EditableShadow = {
  // isEnabled?: boolean;
  isEnabled: boolean;
  blurRadius?: number;
  color?: Sketch.Color;
  offsetX?: number;
  offsetY?: number;
  spread?: number;
};

export default memo(function ShadowInspector() {
  const dispatch = useDispatch();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );
  const layerShadowLists = useShallowArray(
    selectedStyles.map((style) => style?.shadows ?? []),
  );

  const editableShadows: EditableShadow[] = zipLongest(
    undefined,
    ...layerShadowLists,
  ).map((shadows) => {
    const filtered = shadows.flatMap((shadow) => (shadow ? [shadow] : []));

    return {
      isEnabled:
        getMultiValue(filtered.map((shadow) => shadow.isEnabled)) ?? true,
      // isEnabled: getMultiValue(filtered.map((shadow) => shadow.isEnabled)),
      blurRadius: getMultiNumberValue(
        filtered.map((shadow) => shadow.blurRadius),
      ),
      color: getMultiValue(
        filtered.map((shadow) => shadow.color),
        isDeepEqual,
      ),
      offsetX: getMultiValue(filtered.map((shadow) => shadow.offsetX)),
      offsetY: getMultiValue(filtered.map((shadow) => shadow.offsetY)),
      spread: getMultiValue(filtered.map((shadow) => shadow.spread)),
    };
  });

  return (
    <ArrayController<EditableShadow>
      title="Shadows"
      id="shadows"
      key="shadows"
      value={editableShadows}
      onClickPlus={useCallback(() => dispatch('addNewShadow'), [dispatch])}
      onClickTrash={useCallback(() => dispatch('deleteDisabledShadows'), [
        dispatch,
      ])}
      onDeleteItem={useCallback((index) => dispatch('deleteShadow', index), [
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
    >
      {useCallback(
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
            color={item.color}
            x={item.offsetX}
            y={item.offsetY}
            blur={item.blurRadius}
            spread={item.spread}
            prefix={checkbox}
            onChangeColor={(value) => dispatch('setShadowColor', index, value)}
            onSetX={(value, mode) => dispatch('setShadowX', index, value, mode)}
            onSetY={(value, mode) => dispatch('setShadowY', index, value, mode)}
            onSetBlur={(value, mode) =>
              dispatch('setShadowBlur', index, value, mode)
            }
            onSetSpread={(value, mode) =>
              dispatch('setShadowSpread', index, value, mode)
            }
          />
        ),
        [dispatch],
      )}
    </ArrayController>
  );
});
