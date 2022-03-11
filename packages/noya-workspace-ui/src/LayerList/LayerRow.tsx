import React, {
  memo,
  forwardRef,
  ForwardedRef,
  useState,
  useCallback,
} from 'react';

import {
  Layout,
  TreeView,
  ListView,
  IconButton,
  withSeparatorElements,
} from 'noya-designsystem';
import type { LayerMenuItemType } from '../hooks/useLayerMenu';

const LayerRow = memo(
  forwardRef(function LayerRow(
    {
      name,
      selected,
      visible,
      isWithinMaskChain,
      onHoverChange,
      onChangeVisible,
      onChangeIsLocked,
      isLocked,
      isDragging,
      isEditing,
      onSubmitEditing,
      ...props
    }: TreeView.TreeRowProps<LayerMenuItemType> & {
      name: string;
      selected: boolean;
      visible: boolean;
      isWithinMaskChain: boolean;
      isLocked: boolean;
      isDragging: boolean;
      isEditing: boolean;
      onChangeVisible: (visible: boolean) => void;
      onChangeIsLocked: (isLocked: boolean) => void;
      onSubmitEditing: (name: string) => void;
    },
    forwardedRef: ForwardedRef<HTMLLIElement>,
  ) {
    const [hovered, setHovered] = useState(false);

    const handleHoverChange = useCallback(
      (hovered: boolean) => {
        onHoverChange?.(hovered);
        setHovered(hovered);
      },
      [onHoverChange],
    );

    const handleSetVisible = useCallback(() => {
      // (event: React.MouseEvent) => {
      //   event.stopPropagation();
      onChangeVisible(true);
    }, [onChangeVisible]);

    const handleSetHidden = useCallback(() => {
      // (event: React.MouseEvent) => {
      //   event.stopPropagation();
      onChangeVisible(false);
    }, [onChangeVisible]);

    const handleSetLocked = useCallback(() => {
      // (event: React.MouseEvent) => {
      //   event.stopPropagation();
      onChangeIsLocked(true);
    }, [onChangeIsLocked]);

    const handleSetUnlocked = useCallback(() => {
      // (event: React.MouseEvent) => {
      //   event.stopPropagation();
      onChangeIsLocked(false);
    }, [onChangeIsLocked]);

    const titleElement = <TreeView.RowTitle>{name}</TreeView.RowTitle>;

    return (
      <TreeView.Row<LayerMenuItemType>
        ref={forwardedRef}
        onHoverChange={handleHoverChange}
        selected={!isDragging && selected}
        disabled={!visible}
        hovered={!isDragging && hovered}
        {...props}
      >
        {isEditing ? (
          <ListView.EditableRowTitle
            autoFocus
            value={name}
            onSubmitEditing={onSubmitEditing}
          />
        ) : isDragging ? (
          titleElement
        ) : (
          withSeparatorElements(
            [
              titleElement,
              isLocked ? (
                <IconButton
                  name="LockClosedIcon"
                  selected={selected}
                  onClick={handleSetUnlocked}
                />
              ) : hovered ? (
                <IconButton
                  name="LockOpen1Icon"
                  selected={selected}
                  onClick={handleSetLocked}
                />
              ) : null,
              !visible ? (
                <IconButton
                  name="EyeClosedIcon"
                  selected={selected}
                  onClick={handleSetVisible}
                />
              ) : hovered ? (
                <IconButton
                  name="EyeOpenIcon"
                  selected={selected}
                  onClick={handleSetHidden}
                />
              ) : isLocked ? (
                <Layout.Queue size={15} />
              ) : null,
            ],
            <Layout.Queue size={6} />,
          )
        )}
      </TreeView.Row>
    );
  }),
);

export default LayerRow;
