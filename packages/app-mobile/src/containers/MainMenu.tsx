import React, { memo, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import {
  useDispatch,
  useWorkspace,
  useGetStateSnapshot,
} from 'noya-app-state-context';
import type { ApplicationMenuItemType } from 'noya-embedded';
import { useHistory } from 'noya-workspace-ui';
import { TreeView } from 'noya-designsystem';
import { decode, encode } from 'noya-sketch-file';
import { base64ToArrayBuffer, arrayBufferToBase64 } from '../utils/arrayBuffer';

interface MenuItem {
  title: string;
  value: ApplicationMenuItemType;
  shortcut?: string;
  disabled?: boolean;
  role?: string;
  checked?: boolean;
}

interface MenuItemGroup {
  title: string;
  items: MenuItem[];
}

const MainMenu: React.FC = () => {
  const {
    fileHandle,
    setShowRulers,
    preferences: { showRulers },
  } = useWorkspace();
  const { redoDisabled, undoDisabled } = useHistory();
  const getStateSnapshot = useGetStateSnapshot();
  const dispatch = useDispatch();

  const handleOpen = useCallback(async () => {
    try {
      const results = await DocumentPicker.getDocumentAsync({
        multiple: false,
        type: '*/*',
      });

      if (results.type !== 'success') {
        return;
      }

      if (results.file) {
        const data = await results.file.arrayBuffer();
        const sketch = await decode(data);

        dispatch('setFile', sketch);
        return;
      }
      const fileString = await FileSystem.readAsStringAsync(results.uri, {
        encoding: 'base64',
      });
      const data = base64ToArrayBuffer(fileString);
      const sketch = await decode(data);
      dispatch('setFile', sketch);
    } catch (e) {
      console.warn(e);
    }
  }, [dispatch]);

  const handleSave = useCallback(
    async (action: 'save' | 'saveAs') => {
      const data = await encode(getStateSnapshot().sketch);
      const base64File = arrayBufferToBase64(data);
      // TODO: add file name dialog after implementing dialog component/context
      const fileName = action === 'save' ? fileHandle?.name : 'NewFile.sketch';
      const fileUrl = `${FileSystem.cacheDirectory}${fileName}`;

      try {
        // Create temp file for system sharing dialog
        await FileSystem.writeAsStringAsync(fileUrl, base64File, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await Sharing.shareAsync(fileUrl);

        // @ts-ignore TODO: proper file handle instance?
        dispatch('setFileHandle', { name: fileName, kind: 'file' });
      } catch (e) {
        console.log(e);
      }
    },
    [dispatch, fileHandle, getStateSnapshot],
  );

  const onSelectMenuItem = useCallback(
    (value: ApplicationMenuItemType) => {
      switch (value) {
        case 'new': {
          Alert.alert(
            'New file',
            'Opening a new file will replace your current file. Are you sure?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: () => {
                  dispatch('newFile');
                },
              },
            ],
          );
          break;
        }
        case 'open': {
          handleOpen();
          break;
        }
        case 'save':
        case 'saveAs': {
          handleSave(value);
          break;
        }
        case 'undo': {
          dispatch('undo');
          break;
        }
        case 'redo': {
          dispatch('redo');
          break;
        }
        case 'showRulers': {
          setShowRulers(!showRulers);
          break;
        }
      }
    },
    [dispatch, setShowRulers, showRulers, handleOpen, handleSave],
  );

  const menuItems: MenuItemGroup[] = useMemo(() => {
    return [
      {
        title: 'File',
        items: [
          {
            title: 'New',
            value: 'new',
            shortcut: 'Mod-n',
          },
          {
            value: 'open',
            title: 'Open...',
            shortcut: 'Mod-o',
          },
          {
            value: 'save',
            title: 'Save',
            shortcut: 'Mod-s',
          },
          {
            value: 'saveAs',
            title: 'Save As...',
            shortcut: 'Mod-Shift-s',
          },
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
    ];
  }, [undoDisabled, showRulers, redoDisabled]);

  const menuElements = useMemo(
    () =>
      menuItems.map((itemGroup) => [
        <TreeView.Row
          isSectionHeader
          expanded
          depth={0}
          key={`group-${itemGroup.title}`}
        >
          <TreeView.RowTitle>{itemGroup.title}</TreeView.RowTitle>
        </TreeView.Row>,
        ...itemGroup.items.map((item) => (
          <TreeView.Row
            depth={1}
            key={`${itemGroup.title}-${item.title}`}
            onPress={() => onSelectMenuItem(item.value)}
            disabled={item.disabled}
          >
            <TreeView.RowTitle>{item.title}</TreeView.RowTitle>
          </TreeView.Row>
        )),
      ]),
    [menuItems, onSelectMenuItem],
  );

  return <TreeView.Root>{menuElements}</TreeView.Root>;
};

export default memo(MainMenu);
