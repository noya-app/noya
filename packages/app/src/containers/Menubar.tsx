import {
  HamburgerMenuIcon,
  StackIcon,
  TokensIcon,
} from '@radix-ui/react-icons';
import { fileOpen, fileSave } from 'browser-fs-access';
import {
  Button,
  ContextMenu,
  DropdownMenu,
  RadioGroup,
  Spacer,
} from 'noya-designsystem';
import { decode, encode } from 'noya-sketch-file';
import { Selectors, WorkspaceTab } from 'noya-state';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  useApplicationState,
  useSelector,
  useWorkspace,
} from '../contexts/ApplicationStateContext';

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

type MenuItemType = 'new' | 'open' | 'save' | 'saveAs';

export default function Menubar() {
  const { fileHandle, setFileHandle, setFile, setNewFile } = useWorkspace();
  const [state, dispatch] = useApplicationState();
  const currentTab = useSelector(Selectors.getCurrentTab);

  const handleChangeTab = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch('setTab', event.target.value as WorkspaceTab);
    },
    [dispatch],
  );

  const menuItems: ContextMenu.MenuItem<MenuItemType>[] = useMemo(
    () => [
      { value: 'new', title: 'File: New' },
      { value: 'open', title: 'File: Open' },
      { value: 'save', title: 'File: Save' },
      { value: 'saveAs', title: 'File: Save As...' },
    ],
    [],
  );

  const onSelectMenuItem = useCallback(
    async (value: MenuItemType) => {
      switch (value) {
        case 'new': {
          setNewFile();
          return;
        }
        case 'open': {
          const file = await fileOpen({
            extensions: ['.sketch'],
            mimeTypes: ['application/zip'],
          });

          const data = await file.arrayBuffer();

          const sketch = await decode(data);

          setFile(sketch, file.handle);
          return;
        }
        case 'save':
        case 'saveAs': {
          const data = await encode(state.sketch);

          const file = new File([data], fileHandle?.name ?? 'Untitled.sketch', {
            type: 'application/zip',
          });

          const newFileHandle = await fileSave(
            file,
            { fileName: file.name, extensions: ['.sketch'] },
            value === 'save' ? fileHandle : undefined,
            false,
          );

          setFileHandle(newFileHandle);
          return;
        }
      }
    },
    [fileHandle, setFile, setFileHandle, setNewFile, state.sketch],
  );

  return useMemo(
    () => (
      <Container>
        <Spacer.Horizontal size={8} />
        <Row>
          <DropdownMenu.Root<MenuItemType>
            items={menuItems}
            onSelect={onSelectMenuItem}
          >
            <Button id="menu">
              <HamburgerMenuIcon />
            </Button>
          </DropdownMenu.Root>
          <Spacer.Horizontal />
          <RadioGroup.Root value={currentTab} onValueChange={handleChangeTab}>
            <RadioGroup.Item value="canvas" tooltip="Canvas">
              <StackIcon />
            </RadioGroup.Item>
            <RadioGroup.Item value="theme" tooltip="Theme">
              <TokensIcon />
            </RadioGroup.Item>
          </RadioGroup.Root>
        </Row>
        <Spacer.Horizontal size={8} />
      </Container>
    ),
    [currentTab, handleChangeTab, menuItems, onSelectMenuItem],
  );
}
