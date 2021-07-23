import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { isDeepEqual, zipLongest } from 'noya-utils';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import CheckboxArrayController from '../components/inspector/CheckboxArrayController';
import ShadowRow from '../components/inspector/ShadowRow';
import { useDispatch, useSelector } from 'noya-app-state-context';
import useShallowArray from '../hooks/useShallowArray';
import getMultiNumberValue from '../utils/getMultiNumberValue';
import getMultiValue from '../utils/getMultiValue';

type EditableShadow = {
  // TODO: Indeterminate `isEnabled` state
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

  const editableShadows: EditableShadow[] = useMemo(
    () =>
      zipLongest(undefined, ...layerShadowLists).map((shadows) => {
        const filtered = shadows.flatMap((shadow) => (shadow ? [shadow] : []));

        return {
          isEnabled:
            getMultiValue(filtered.map((shadow) => shadow.isEnabled)) ?? true,
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
      }),
    [layerShadowLists],
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
