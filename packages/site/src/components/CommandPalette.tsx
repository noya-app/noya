import { Dialog, Stack } from '@noya-app/noya-designsystem';
import { AutoSizer } from '@noya-app/react-utils';
import React, { memo } from 'react';
import {
  ISearchCompletionMenu,
  SearchCompletionMenu,
} from '../ayon/components/SearchCompletionMenu';

export const CommandPalette = memo(function CommandPalette({
  showCommandPalette,
  setShowCommandPalette,
  items,
  onSelect,
  onHover,
}: {
  showCommandPalette: boolean;
  setShowCommandPalette: (value: boolean) => void;
} & Pick<
  React.ComponentProps<typeof SearchCompletionMenu>,
  'items' | 'onSelect' | 'onHover'
>) {
  const menuRef = React.useRef<ISearchCompletionMenu>(null);

  const handleClose = React.useCallback(() => {
    setShowCommandPalette(false);
  }, [setShowCommandPalette]);

  return (
    <Dialog
      style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '500px',
        minHeight: '100px',
        padding: '1px',
        top: '100px',
        left: '50%',
        transform: 'translate(-50%, 0)',
      }}
      open={showCommandPalette}
      onOpenChange={(value) => {
        setShowCommandPalette(value);
      }}
      closeOnInteractOutside
      onOpenAutoFocus={() => {
        menuRef.current?.focus();
        setTimeout(() => {
          menuRef.current?.focus();
        }, 0);
      }}
    >
      <Stack.V flex="1">
        <AutoSizer>
          {(size) => (
            <SearchCompletionMenu
              ref={menuRef}
              width={size.width}
              items={items}
              onSelect={onSelect}
              onHover={onHover}
              onClose={handleClose}
            />
          )}
        </AutoSizer>
      </Stack.V>
    </Dialog>
  );
});
