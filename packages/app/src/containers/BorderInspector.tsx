import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import BorderRow from '../components/inspector/BorderRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function BorderInspector() {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );

  const borders = useShallowArray(
    selectedStyles.map((style) => style?.borders),
  );
  // TODO: Modify all borders
  const firstBorder = useMemo(() => borders[0] || [], [borders]);

  return (
    <ArrayController<FileFormat.Border>
      title="Borders"
      id="borders"
      key="borders"
      value={firstBorder}
      onClickPlus={useCallback(() => dispatch('addNewBorder'), [dispatch])}
      onClickTrash={useCallback(() => dispatch('deleteDisabledBorders'), [
        dispatch,
      ])}
      onDeleteItem={useCallback((index) => dispatch('deleteBorder', index), [
        dispatch,
      ])}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveBorder', sourceIndex, destinationIndex),
        [dispatch],
      )}
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setBorderEnabled', index, checked),
        [dispatch],
      )}
    >
      {useCallback(
        ({
          item,
          index,
          checkbox,
        }: {
          item: FileFormat.Border;
          index: number;
          checkbox: ReactNode;
        }) => (
          <BorderRow
            id={`border-${index}`}
            color={item.color}
            prefix={checkbox}
            width={item.thickness}
            position={item.position}
            onNudgeWidth={(value) =>
              dispatch('setBorderWidth', index, value, 'adjust')
            }
            onChangeWidth={(value) => dispatch('setBorderWidth', index, value)}
            onChangeColor={(value) => {
              dispatch('setBorderColor', index, value);
            }}
            onChangePosition={(value) => {
              dispatch('setBorderPosition', index, value);
            }}
          />
        ),
        [dispatch],
      )}
    </ArrayController>
  );
});
