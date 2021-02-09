import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'ayano-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import BorderRow from '../components/inspector/BorderRow';
import { useApplicationState } from '../contexts/ApplicationStateContext';

export default memo(function BorderInspector() {
  const [state, dispatch] = useApplicationState();

  const getPageLayers = Selectors.makeGetPageLayers(state);

  // TODO: Borders array isn't memoizing in a way that prevents re-render
  const borders = useMemo(
    () =>
      getPageLayers(state.selectedObjects).map((layer) => layer.style?.borders),
    [getPageLayers, state.selectedObjects],
  );
  const firstBorder = useMemo(() => borders[0] || [], [borders]);

  const onClickPlusBorder = useCallback(() => dispatch('addNewBorder'), [
    dispatch,
  ]);
  const onClickTrashBorder = useCallback(
    () => dispatch('deleteDisabledBorders'),
    [dispatch],
  );
  const onDeleteBorder = useCallback(
    (index) => dispatch('deleteBorder', index),
    [dispatch],
  );
  const onMoveBorder = useCallback(
    (sourceIndex, destinationIndex) =>
      dispatch('moveBorder', sourceIndex, destinationIndex),
    [dispatch],
  );
  const onChangeCheckboxBorder = useCallback(
    (index, checked) => dispatch('setBorderEnabled', index, checked),
    [dispatch],
  );
  const arrayControllerChildrenBorder = useCallback(
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
        onNudgeWidth={(value) => dispatch('nudgeBorderWidth', index, value)}
        onChangeColor={(value) => {
          dispatch('setBorderColor', index, value);
        }}
      />
    ),
    [dispatch],
  );

  return (
    <ArrayController<FileFormat.Border>
      id="borders"
      key="borders"
      value={firstBorder}
      onClickPlus={onClickPlusBorder}
      onClickTrash={onClickTrashBorder}
      onDeleteItem={onDeleteBorder}
      onMoveItem={onMoveBorder}
      onChangeCheckbox={onChangeCheckboxBorder}
      title="Borders"
    >
      {arrayControllerChildrenBorder}
    </ArrayController>
  );
});
