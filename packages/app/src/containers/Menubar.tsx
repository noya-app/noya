import { HamburgerMenuIcon } from 'noya-icons';
import { FileSystemHandle } from 'browser-fs-access';
import {
  useDispatch,
  useGetStateSnapshot,
  useWorkspace,
} from 'noya-app-state-context';
import {
  Button,
  createSectionedMenu,
  DropdownMenu,
  MenuItem,
  Spacer,
} from 'noya-web-designsystem';
import { applicationMenu, ApplicationMenuItemType } from 'noya-embedded';
import { decode, encode } from 'noya-sketch-file';
import { useHistory } from 'noya-workspace-ui';
import { ApplicationState } from 'noya-state';
import { memo, useCallback, useEffect, useMemo } from 'react';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import { useEnvironmentParameter } from '../hooks/useEnvironmentParameters';
import { useFileManager } from '../hooks/useFileManager';

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
  const fileManager = useFileManager();
  const isElectron = useEnvironmentParameter('isElectron');
  const dispatch = useDispatch();

  const handleOpen = useCallback(async () => {
    const file = await fileManager.open({
      extensions: ['.sketch'],
      mimeTypes: ['application/zip'],
    });

    const answer = window.confirm(
      'Opening a new file will replace your current file. Are you sure?',
    );
    if (answer === false) return;

    const data = await file.arrayBuffer();
    const sketch = await decode(data);
    dispatch('setFile', sketch, file.handle);
  }, [dispatch, fileManager]);

  const handleSave = useCallback(
    async (action: 'save' | 'saveAs') => {
      const data = await encode(getStateSnapshot().sketch);

      const file = new File([data], fileHandle?.name ?? 'Untitled.sketch', {
        type: 'application/zip',
      });

      const newFileHandle = await fileManager.save(
        file,
        { fileName: file.name, extensions: ['.sketch'] },
        action === 'save' ? fileHandle : undefined,
        false,
      );

      dispatch('setFileHandle', newFileHandle);
    },
    [dispatch, fileHandle, fileManager, getStateSnapshot],
  );

  const menuItems = useMemo(() => {
    const recentDocumentsMenuItem: MenuItem<ApplicationMenuItemType> = {
      value: 'openRecent',
      title: 'Open Recent',
      role: 'recentdocuments',
      items: [
        {
          value: 'clearRecent',
          title: 'Clear Recent',
          role: 'clearrecentdocuments',
        },
      ],
    };

    const closeWindowMenuItem: MenuItem<ApplicationMenuItemType> = {
      value: 'close',
      title: 'Close Window',
      role: 'close',
    };

    return createSectionedMenu<ApplicationMenuItemType>([
      {
        title: 'File',
        items: [
          {
            value: 'new',
            title: 'New',
            shortcut: isElectron ? 'Mod-n' : undefined, // Browsers don't allow overriding
          },
          { value: 'open', title: 'Open...', shortcut: 'Mod-o' },
          ...(isElectron ? [recentDocumentsMenuItem] : []),
          { value: 'save', title: 'Save', shortcut: 'Mod-s' },
          { value: 'saveAs', title: 'Save As...', shortcut: 'Mod-Shift-s' },
          ...(isElectron ? [closeWindowMenuItem] : []),
        ],
      },
      {
        title: 'Edit',
        items: createSectionedMenu<ApplicationMenuItemType>(
          [
            {
              value: 'undo',
              title: 'Undo',
              disabled: undoDisabled,
              shortcut: 'Mod-z',
              role: 'undo',
            },
            {
              value: 'redo',
              title: 'Redo',
              disabled: redoDisabled,
              shortcut: 'Mod-Shift-z',
              role: 'redo',
            },
          ],
          isElectron && [
            {
              value: 'cut',
              title: 'Cut',
              role: 'cut',
              shortcut: 'Mod-x',
            },
            {
              value: 'copy',
              title: 'Copy',
              role: 'copy',
              shortcut: 'Mod-c',
            },
            {
              value: 'paste',
              title: 'Paste',
              role: 'paste',
              shortcut: 'Mod-v',
            },
          ],
        ),
      },
      {
        title: 'Preferences',
        items: [
          {
            value: 'showRulers',
            title: 'Rulers',
            checked: showRulers,
          },
        ],
      },
    ]);
  }, [isElectron, redoDisabled, showRulers, undoDisabled]);

  const onSelectMenuItem = useCallback(
    (value: ApplicationMenuItemType) => {
      switch (value) {
        case 'new': {
          const answer = window.confirm(
            'Opening a new file will replace your current file. Are you sure?',
          );
          if (answer === false) return;
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

  return (
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
