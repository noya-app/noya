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
import { useDesignSystemConfiguration } from 'noya-ui';
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
    const platform = useDesignSystemConfiguration().platform;
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

    const rowSelected = !isDragging && selected;
    const rowHovered = !isDragging && hovered;

    // TODO: check for external mouse? on tablets
    const showIcon =
      platform === 'ios' || platform === 'android' ? selected : hovered;

    const titleElement = (
      <TreeView.RowTitle disable={!visible} selected={rowSelected}>
        {name}
      </TreeView.RowTitle>
    );

    return (
      <TreeView.Row<LayerMenuItemType>
        ref={forwardedRef}
        onHoverChange={handleHoverChange}
        selected={rowSelected}
        disabled={!visible}
        hovered={rowHovered}
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
                  name="lock-closed"
                  selected={selected}
                  onClick={handleSetUnlocked}
                />
              ) : showIcon ? (
                <IconButton
                  name="lock-open-1"
                  selected={selected}
                  onClick={handleSetLocked}
                />
              ) : null,
              !visible ? (
                <IconButton
                  name="eye-closed"
                  selected={selected}
                  onClick={handleSetVisible}
                />
              ) : showIcon ? (
                <IconButton
                  name="eye-open"
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
