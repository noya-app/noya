import {
  FileIcon,
  PlusIcon,
  StackIcon,
  TokensIcon,
} from '@radix-ui/react-icons';
import {
  useApplicationState,
  useDispatch,
  useWorkspace,
} from 'noya-app-state-context';
import {
  Button,
  TreeView,
  MenuItem,
  RelativeDropPosition,
  Spacer,
} from 'noya-designsystem';
import { Selectors, WorkspaceTab } from 'noya-state';
import { uuid } from 'noya-utils';
import { memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import useDeepArray from '../hooks/useDeepArray';

const Container = styled.div(({ theme }) => ({
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
}));

const Header = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  userSelect: 'none',
  fontWeight: 500,
  paddingTop: '8px',
  paddingRight: '8px',
  paddingBottom: '0px',
  paddingLeft: '20px',
  display: 'flex',
  alignItems: 'center',
}));

type MenuItemType = 'duplicate' | 'rename' | 'delete';

type PageInfo = { do_objectID: string; name: string; type: 'design' | 'theme' };

interface Props {
  currentTab: WorkspaceTab;
  selectedPageId: string;
  pageInfo: PageInfo[];
  canDelete: boolean;
  renamingPage?: string;
  startRenamingPage: (id: string) => void;
  didHandleFocus: () => void;
}

const PageListContent = memo(function PageListContent({
  currentTab,
  selectedPageId,
  pageInfo,
  canDelete,
  renamingPage,
  startRenamingPage,
  didHandleFocus,
}: Props) {
  const dispatch = useDispatch();
  const {
    icon: iconColor,
    iconSelected: iconSelectedColor,
  } = useTheme().colors;
  const [editingPage, setEditingPage] = useState<string | undefined>();

  const pageMenuItems: MenuItem<MenuItemType>[] = useMemo(
    () => [
      { value: 'duplicate', title: 'Duplicate Page' },
      { value: 'rename', title: 'Rename Page' },
      {
        value: 'delete' as MenuItemType,
        title: 'Delete Page',
        disabled: !canDelete,
      },
    ],
    [canDelete],
  );

  const handleSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      switch (value) {
        case 'rename': {
          startRenamingPage(selectedPageId);
          break;
        }
        case 'duplicate': {
          dispatch('duplicatePage');
          break;
        }
        case 'delete':
          dispatch('deletePage');
          break;
      }
    },
    [dispatch, selectedPageId, startRenamingPage],
  );

  const handleAddPage = useCallback(() => {
    const pageId = uuid();
    dispatch('addPage', pageId);
    startRenamingPage(pageId);
  }, [dispatch, startRenamingPage]);

  useLayoutEffect(() => {
    if (!renamingPage) return;

    setEditingPage(renamingPage);

    didHandleFocus();
  }, [didHandleFocus, renamingPage]);

  const lastIndex = pageInfo.length - 1;

  return (
    <Container>
      <Header>
        Pages
        <Spacer.Horizontal />
        <Button id="add-page" tooltip="Add a new page" onClick={handleAddPage}>
          <PlusIcon />
        </Button>
      </Header>
      <TreeView.Root
        sortable={!editingPage}
        scrollable
        onMoveItem={useCallback(
          (
            sourceIndex: number,
            destinationIndex: number,
            position: RelativeDropPosition,
          ) => {
            const adjustedDestinationIndex =
              position === 'below' ? destinationIndex + 1 : destinationIndex;

            if (
              sourceIndex === lastIndex ||
              adjustedDestinationIndex === lastIndex + 1
            )
              return;

            dispatch('movePage', sourceIndex, adjustedDestinationIndex);
          },
          [dispatch, lastIndex],
        )}
        items={pageInfo}
        renderItem={useCallback(
          (page: PageInfo, index, { isDragging }) => {
            const selected =
              !isDragging &&
              ((page.type === 'theme' && currentTab === 'theme') ||
                (page.type === 'design' &&
                  currentTab === 'canvas' &&
                  selectedPageId === page.do_objectID));

            const IconComponent =
              page.type === 'theme'
                ? TokensIcon
                : Selectors.isSymbolsPage({ name: page.name })
                ? StackIcon
                : FileIcon;

            return (
              <TreeView.Row<MenuItemType>
                id={page.do_objectID}
                key={page.do_objectID}
                selected={selected}
                onClick={() => {
                  dispatch('interaction', ['reset']);

                  switch (page.type) {
                    case 'design':
                      dispatch('setTab', 'canvas');
                      dispatch('selectPage', page.do_objectID);
                      break;
                    case 'theme':
                      dispatch('setTab', 'theme');
                      break;
                  }
                }}
                onDoubleClick={() => {
                  startRenamingPage(page.do_objectID);
                }}
                menuItems={page.type === 'design' ? pageMenuItems : undefined}
                onSelectMenuItem={handleSelectMenuItem}
                onContextMenu={() => {
                  if (page.type === 'theme') return;

                  dispatch('selectPage', page.do_objectID);
                }}
                icon={
                  <IconComponent
                    color={selected ? iconSelectedColor : iconColor}
                  />
                }
              >
                {page.do_objectID === editingPage ? (
                  <TreeView.EditableRowTitle
                    autoFocus
                    value={page.name}
                    onSubmitEditing={(name) => {
                      setEditingPage(undefined);

                      if (!name) return;

                      dispatch('setPageName', page.do_objectID, name);
                    }}
                  />
                ) : (
                  page.name
                )}
              </TreeView.Row>
            );
          },
          [
            currentTab,
            selectedPageId,
            pageMenuItems,
            handleSelectMenuItem,
            iconSelectedColor,
            iconColor,
            editingPage,
            dispatch,
            startRenamingPage,
          ],
        )}
      />
    </Container>
  );
});

export default function PageList() {
  const [state] = useApplicationState();
  const { renamingPage, startRenamingPage, didHandleFocus } = useWorkspace();
  const currentTab = Selectors.getCurrentTab(state);

  const pageInfo = useDeepArray([
    ...state.sketch.pages.map((page) => ({
      do_objectID: page.do_objectID,
      name: page.name,
      type: 'design' as const,
    })),
    {
      do_objectID: 'theme',
      name: 'Theme',
      type: 'theme' as const,
    },
  ]);

  return (
    <PageListContent
      currentTab={currentTab}
      selectedPageId={state.selectedPage}
      pageInfo={pageInfo}
      canDelete={state.sketch.pages.length > 1}
      renamingPage={renamingPage}
      startRenamingPage={startRenamingPage}
      didHandleFocus={didHandleFocus}
    />
  );
}
