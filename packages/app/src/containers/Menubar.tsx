import {
  HamburgerMenuIcon,
  StackIcon,
  TokensIcon,
} from '@radix-ui/react-icons';
import { fileOpen, fileSave, FileSystemHandle } from 'browser-fs-access';
import {
  Button,
  DropdownMenu,
  MenuItem,
  RadioGroup,
  Spacer,
} from 'noya-designsystem';
import { decode, encode } from 'noya-sketch-file';
import { ApplicationState, Selectors, WorkspaceTab } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  useDispatch,
  useGetStateSnapshot,
  useSelector,
} from '../contexts/ApplicationStateContext';
import { useWorkspace } from '../hooks/useWorkspace';

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

interface Props {
  currentTab: WorkspaceTab;
  fileHandle?: FileSystemHandle;
  getStateSnapshot: () => ApplicationState;
}

const MenubarContent = memo(function MenubarContent({
  currentTab,
  fileHandle,
  getStateSnapshot,
}: Props) {
  const dispatch = useDispatch();

  const handleChangeTab = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch('setTab', event.target.value as WorkspaceTab);
    },
    [dispatch],
  );

  const menuItems: MenuItem<MenuItemType>[] = useMemo(
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
      }
    },
    [dispatch, fileHandle, getStateSnapshot],
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
  );
});

export default function Menubar() {
  const { fileHandle } = useWorkspace();
  const getStateSnapshot = useGetStateSnapshot();
  const currentTab = useSelector(Selectors.getCurrentTab);

  return (
    <MenubarContent
      currentTab={currentTab}
      fileHandle={fileHandle}
      getStateSnapshot={getStateSnapshot}
    />
  );
}
