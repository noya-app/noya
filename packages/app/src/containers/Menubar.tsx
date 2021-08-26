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
import { applicationMenu, ApplicationMenuItemType } from 'noya-embedded';
import { decode, encode } from 'noya-sketch-file';
import { ApplicationState } from 'noya-state';
import { memo, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import { useEnvironmentParameter } from '../hooks/useEnvironmentParameters';
import { useHistory } from '../hooks/useHistory';

const Container = styled.header(({ theme }) => ({
  minHeight: `${theme.sizes.toolbar.height - (theme.isElectron ? 8 : 0)}px`,
  display: 'flex',
  flexDirection: 'column',
  borderBottom: `1px solid ${
    theme.isElectron ? 'transparent' : theme.colors.dividerStrong
  }`,
  borderRight: `1px solid ${
    theme.isElectron ? theme.colors.dividerStrong : 'transparent'
  }`,
  alignItems: 'stretch',
  justifyContent: 'center',
  color: theme.colors.textMuted,
  WebkitAppRegion: 'drag',
  background: theme.isElectron ? 'rgba(255,255,255,0.02)' : 'none',
}));

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

  const handleOpen = useCallback(async () => {
    const file = await fileOpen({
      extensions: ['.sketch'],
      mimeTypes: ['application/zip'],
    });

    const data = await file.arrayBuffer();

    const sketch = await decode(data);

    dispatch('setFile', sketch, file.handle);
  }, [dispatch]);

  const handleSave = useCallback(
    async (action: 'save' | 'saveAs') => {
      const data = await encode(getStateSnapshot().sketch);

      const file = new File([data], fileHandle?.name ?? 'Untitled.sketch', {
        type: 'application/zip',
      });

      const newFileHandle = await fileSave(
        file,
        { fileName: file.name, extensions: ['.sketch'] },
        action === 'save' ? fileHandle : undefined,
        false,
      );

      dispatch('setFileHandle', newFileHandle);
    },
    [dispatch, fileHandle, getStateSnapshot],
  );

  const menuItems = useMemo(
    () =>
      createSectionedMenu<ApplicationMenuItemType>([
        {
          title: 'File',
          items: [
            { value: 'new', title: 'New', shortcut: 'Mod-n' },
            { value: 'open', title: 'Open...', shortcut: 'Mod-o' },
            { value: 'save', title: 'Save', shortcut: 'Mod-s' },
            { value: 'saveAs', title: 'Save As...', shortcut: 'Mod-Shift-s' },
          ],
        },
        {
          title: 'Edit',
          items: [
            {
              value: 'undo',
              title: 'Undo',
              disabled: undoDisabled,
              shortcut: 'Mod-z',
            },
            {
              value: 'redo',
              title: 'Redo',
              disabled: redoDisabled,
              shortcut: 'Mod-Shift-z',
            },
          ],
        },
        {
          title: 'Preferences',
          items: [
            {
              value: 'showRulers',
              title: 'Preferences: Rulers',
              checked: showRulers,
            },
          ],
        },
      ]),
    [redoDisabled, showRulers, undoDisabled],
  );

  const onSelectMenuItem = useCallback(
    (value: ApplicationMenuItemType) => {
      switch (value) {
        case 'new': {
          dispatch('newFile');
          return;
        }
        case 'open': {
          handleOpen();
          return;
        }
        case 'save':
        case 'saveAs': {
          handleSave(value);
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
    [dispatch, handleOpen, handleSave, setShowRulers, showRulers],
  );

  useEffect(() => {
    applicationMenu.setMenu(menuItems);
    applicationMenu.addListener(onSelectMenuItem);

    return () => {
      applicationMenu.removeListener(onSelectMenuItem);
    };
  }, [menuItems, onSelectMenuItem]);

  const isElectron = useEnvironmentParameter('isElectron');

  return (
    <Container>
      <InspectorPrimitives.Row>
        <Spacer.Horizontal size={8} />
        {!isElectron && (
          <DropdownMenu<ApplicationMenuItemType>
            items={menuItems}
            onSelect={onSelectMenuItem}
          >
            <Button id="menu">
              <HamburgerMenuIcon />
            </Button>
          </DropdownMenu>
        )}
        <Spacer.Horizontal size={8} />
      </InspectorPrimitives.Row>
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
