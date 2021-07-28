import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { fileOpen, fileSave, FileSystemHandle } from 'browser-fs-access';
import {
  useDispatch,
  useGetStateSnapshot,
  useWorkspace,
} from 'noya-app-state-context';
import {
  Button,
  createSectionedMenu,
  DropdownMenu,
  Spacer,
} from 'noya-designsystem';
import { decode, encode } from 'noya-sketch-file';
import { ApplicationState } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useHistory } from '../hooks/useHistory';

const Container = styled.header(({ theme }) => ({
  minHeight: `${theme.sizes.toolbar.height}px`,
  display: 'flex',
  borderBottom: `1px solid transparent`, // For height to match toolbar
  alignItems: 'center',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
}));

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
}));

type MenuItemType =
  | 'new'
  | 'open'
  | 'save'
  | 'saveAs'
  | 'undo'
  | 'redo'
  | 'showRulers';

interface Props {
  fileHandle?: FileSystemHandle;
  getStateSnapshot: () => ApplicationState;
  setShowRulers: (value: boolean) => void;
  showRulers: boolean;
  redoDisabled: boolean;
  undoDisabled: boolean;
}

const MenubarContent = memo(function MenubarContent({
  fileHandle,
  getStateSnapshot,
  setShowRulers,
  showRulers,
  redoDisabled,
  undoDisabled,
}: Props) {
  const dispatch = useDispatch();

  const menuItems = useMemo(
    () =>
      createSectionedMenu<MenuItemType>(
        [
          { value: 'new', title: 'File: New' },
          { value: 'open', title: 'File: Open' },
          { value: 'save', title: 'File: Save' },
          { value: 'saveAs', title: 'File: Save As...' },
        ],
        [
          { value: 'undo', title: 'Edit: Undo', disabled: undoDisabled },
          { value: 'redo', title: 'Edit: Redo', disabled: redoDisabled },
        ],
        [
          {
            value: 'showRulers',
            title: 'Preferences: Rulers',
            checked: showRulers,
          },
        ],
      ),
    [redoDisabled, showRulers, undoDisabled],
  );

  const onSelectMenuItem = useCallback(
    async (value: MenuItemType) => {
      switch (value) {
        case 'new': {
          dispatch('newFile');
          return;
        }
        case 'open': {
          const file = await fileOpen({
            extensions: ['.sketch'],
            mimeTypes: ['application/zip'],
          });

          const data = await file.arrayBuffer();

          const sketch = await decode(data);

          dispatch('setFile', sketch, file.handle);
          return;
        }
        case 'save':
        case 'saveAs': {
          const data = await encode(getStateSnapshot().sketch);

          const file = new File([data], fileHandle?.name ?? 'Untitled.sketch', {
            type: 'application/zip',
          });

          const newFileHandle = await fileSave(
            file,
            { fileName: file.name, extensions: ['.sketch'] },
            value === 'save' ? fileHandle : undefined,
            false,
          );

          dispatch('setFileHandle', newFileHandle);
          return;
        }
        case 'undo':
          dispatch('undo');
          return;
        case 'redo':
          dispatch('redo');
          return;
        case 'showRulers':
          setShowRulers(!showRulers);
          return;
      }
    },
    [dispatch, fileHandle, getStateSnapshot, setShowRulers, showRulers],
  );

  return (
    <Container>
      <Spacer.Horizontal size={8} />
      <Row>
        <DropdownMenu<MenuItemType>
          items={menuItems}
          onSelect={onSelectMenuItem}
        >
          <Button id="menu">
            <HamburgerMenuIcon />
          </Button>
        </DropdownMenu>
      </Row>
      <Spacer.Horizontal size={8} />
    </Container>
  );
});

export default function Menubar() {
  const {
    fileHandle,
    setShowRulers,
    preferences: { showRulers },
  } = useWorkspace();
  const getStateSnapshot = useGetStateSnapshot();
  const { redoDisabled, undoDisabled } = useHistory();

  return (
    <MenubarContent
      fileHandle={fileHandle}
      getStateSnapshot={getStateSnapshot}
      redoDisabled={redoDisabled}
      undoDisabled={undoDisabled}
      showRulers={showRulers}
      setShowRulers={setShowRulers}
    />
  );
}
