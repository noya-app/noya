import {
  useDispatch,
  useGetStateSnapshot,
  useHistory,
  useWorkspace,
} from 'noya-app-state-context';
import {
  Button,
  DropdownMenu,
  MenuItem,
  Spacer,
  createSectionedMenu,
} from 'noya-designsystem';
import { ApplicationMenuItemType, applicationMenu } from 'noya-embedded';
import { HamburgerMenuIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import { decode, encode } from 'noya-sketch-file';
import { ApplicationState } from 'noya-state';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useEnvironmentParameter } from '../hooks/useEnvironmentParameters';
import { useFileManager } from '../hooks/useFileManager';

interface Props {
  fileHandle?: FileSystemFileHandle;
  getStateSnapshot: () => ApplicationState;
  setShowRulers: (value: boolean) => void;
  setShowPageListThumbnails: (value: boolean) => void;
  setShowInterface: (value: boolean) => void;
  setShowLeftSidebar: (value: boolean) => void;
  setShowRightSidebar: (value: boolean) => void;
  showRulers: boolean;
  actuallyShowInterface: boolean;
  actuallyShowLeftSidebar: boolean;
  actuallyShowRightSidebar: boolean;
  showPageListThumbnails: boolean;
  canRedo: boolean;
  canUndo: boolean;
}

const MenubarContent = memo(function MenubarContent({
  fileHandle,
  getStateSnapshot,
  setShowRulers,
  setShowPageListThumbnails,
  setShowInterface,
  setShowLeftSidebar,
  setShowRightSidebar,
  showRulers,
  actuallyShowInterface,
  actuallyShowLeftSidebar,
  actuallyShowRightSidebar,
  showPageListThumbnails,
  canRedo,
  canUndo,
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

      dispatch('setFileHandle', newFileHandle ?? undefined);
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
              disabled: !canUndo,
              shortcut: 'Mod-z',
              role: 'undo',
            },
            {
              value: 'redo',
              title: 'Redo',
              disabled: !canRedo,
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
        title: 'View',
        items: [
          {
            value: 'showLeftSidebar',
            title: actuallyShowLeftSidebar
              ? 'Hide Left Sidebar'
              : 'Show Left Sidebar',
            shortcut: 'Mod-Alt-1',
          },
          {
            value: 'showRightSidebar',
            title: actuallyShowRightSidebar
              ? 'Hide Right Sidebar'
              : 'Show Right Sidebar',
            shortcut: 'Mod-Alt-2',
          },
          {
            value: 'showInterface',
            title: actuallyShowInterface ? 'Hide Interface' : 'Show Interface',
            shortcut: 'Mod-.',
          },
        ],
      },
      {
        title: 'Preferences',
        items: [
          {
            value: 'showRulers',
            title: 'Rulers',
            checked: showRulers,
          },
          {
            value: 'showPageListThumbnails',
            title: 'Page List Thumbnails',
            checked: showPageListThumbnails,
          },
        ],
      },
    ]);
  }, [
    actuallyShowInterface,
    actuallyShowLeftSidebar,
    actuallyShowRightSidebar,
    isElectron,
    canRedo,
    showPageListThumbnails,
    showRulers,
    canUndo,
  ]);

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
        case 'showInterface':
          setShowInterface(!actuallyShowInterface);
          return;
        case 'showLeftSidebar':
          setShowLeftSidebar(!actuallyShowLeftSidebar);
          return;
        case 'showRightSidebar':
          setShowRightSidebar(!actuallyShowRightSidebar);
          return;
        case 'showPageListThumbnails':
          setShowPageListThumbnails(!showPageListThumbnails);
          return;
      }
    },
    [
      actuallyShowInterface,
      actuallyShowLeftSidebar,
      actuallyShowRightSidebar,
      dispatch,
      handleOpen,
      handleSave,
      setShowInterface,
      setShowLeftSidebar,
      setShowPageListThumbnails,
      setShowRightSidebar,
      setShowRulers,
      showPageListThumbnails,
      showRulers,
    ],
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
    setShowPageListThumbnails,
    setShowInterface,
    setShowLeftSidebar,
    setShowRightSidebar,
    actuallyShowInterface,
    actuallyShowLeftSidebar,
    actuallyShowRightSidebar,
    preferences: { showRulers, showPageListThumbnails },
  } = useWorkspace();
  const getStateSnapshot = useGetStateSnapshot();
  const { canRedo, canUndo } = useHistory();

  return (
    <MenubarContent
      fileHandle={fileHandle}
      getStateSnapshot={getStateSnapshot}
      canRedo={canRedo}
      canUndo={canUndo}
      showRulers={showRulers}
      actuallyShowInterface={actuallyShowInterface}
      actuallyShowLeftSidebar={actuallyShowLeftSidebar}
      actuallyShowRightSidebar={actuallyShowRightSidebar}
      setShowPageListThumbnails={setShowPageListThumbnails}
      setShowInterface={setShowInterface}
      setShowLeftSidebar={setShowLeftSidebar}
      setShowRightSidebar={setShowRightSidebar}
      showPageListThumbnails={showPageListThumbnails}
      setShowRulers={setShowRulers}
    />
  );
}
