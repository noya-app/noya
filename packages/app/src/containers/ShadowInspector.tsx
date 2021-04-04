import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import ShadowRow from '../components/inspector/ShadowRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function ShadowInspector() {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );
  const shadows = useShallowArray(
    selectedStyles.map((style) => style?.shadows),
  );
  // TODO: Modify all shadows
  const firstShadow = useMemo(() => shadows[0] || [], [shadows]);

  return (
    <ArrayController<FileFormat.Shadow>
      title="Shadows"
      id="shadows"
      key="shadows"
      value={firstShadow}
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
          item: FileFormat.Shadow;
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
            onChangeX={(value) => dispatch('setShadowX', index, value)}
            onNudgeX={(value) => dispatch('setShadowX', index, value, 'adjust')}
            onChangeY={(value) => dispatch('setShadowY', index, value)}
            onNudgeY={(value) => dispatch('setShadowY', index, value, 'adjust')}
            onChangeBlur={(value) => dispatch('setShadowBlur', index, value)}
            onNudgeBlur={(value) =>
              dispatch('setShadowBlur', index, value, 'adjust')
            }
            onChangeSpread={(value) =>
              dispatch('setShadowSpread', index, value)
            }
            onNudgeSpread={(value) =>
              dispatch('setShadowSpread', index, value, 'adjust')
            }
          />
        ),
        [dispatch],
      )}
    </ArrayController>
  );
});
