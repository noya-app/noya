import { FileIcon, StackIcon, TokensIcon } from 'noya-icons';
import {
  useApplicationState,
  useDispatch,
  useWorkspace,
} from 'noya-app-state-context';
import {
  IconButton,
  MenuItem,
  RelativeDropPosition,
  Spacer,
  TreeView,
} from 'noya-designsystem';
import { useDeepMemo } from 'noya-react-utils';
import { Selectors, WorkspaceTab } from 'noya-state';
import { uuid } from 'noya-utils';
import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';

const Container = styled.div<{ expanded: boolean }>(({ theme, expanded }) => ({
  ...(expanded ? { height: '200px' } : { flex: '0 0 auto' }),
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255,255,255,0.02)',
}));

const TitlePrefix = styled.span({
  opacity: 0.7,
  whiteSpace: 'pre',
});

type MenuItemType = 'duplicate' | 'rename' | 'delete';

type PageInfo = {
  id: string;
  name: string;
  type: 'header' | 'design' | 'theme';
};

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
  const { icon: iconColor, iconSelected: iconSelectedColor } =
    useTheme().colors;
  const [editingPage, setEditingPage] = useState<string | undefined>();
  const [isExpanded, setIsExpanded] = useState(true);

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
          dispatch('duplicatePage', selectedPageId);
          break;
        }
        case 'delete':
          dispatch('deletePage', selectedPageId);
          break;
      }
    },
    [dispatch, selectedPageId, startRenamingPage],
  );

  const handleAddPage = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      const pageId = uuid();
      dispatch('addPage', pageId);
      startRenamingPage(pageId);
    },
    [dispatch, startRenamingPage],
  );

  useLayoutEffect(() => {
    if (!renamingPage) return;

    setIsExpanded(true);
    setEditingPage(renamingPage);

    didHandleFocus();
  }, [didHandleFocus, renamingPage]);

  const lastIndex = pageInfo.length - 1;
  const pages = isExpanded ? pageInfo : pageInfo.slice(0, 1);
  const selectedPageName = pageInfo.find(
    (info) => info.id === selectedPageId,
  )?.name;

  // Limit the container size when we have enough pages
  const scrollable = pages.length > 5;

  return (
    <Container expanded={scrollable}>
      <TreeView.Root
        sortable={!editingPage}
        scrollable={scrollable}
        acceptsDrop={useCallback(
          (
            sourceId: string,
            destinationId: string,
            relationDropPosition: RelativeDropPosition,
          ) => {
            if (relationDropPosition === 'inside') return false;

            const destinationItem = pageInfo.find(
              (info) => destinationId === info.id,
            );

            return destinationItem?.type === 'design';
          },
          [pageInfo],
        )}
        onMoveItem={useCallback(
          (
            sourceIndex: number,
            destinationIndex: number,
            position: RelativeDropPosition,
          ) => {
            const adjustedDestinationIndex =
              position === 'below' ? destinationIndex + 1 : destinationIndex;

            const isFirstItem =
              sourceIndex === 0 || adjustedDestinationIndex === 0;

            const isLastItem =
              sourceIndex === lastIndex ||
              adjustedDestinationIndex === lastIndex + 1;

            if (isFirstItem || isLastItem) return;

            // Offset both source and destination due to our fake header item
            dispatch('movePage', sourceIndex - 1, adjustedDestinationIndex - 1);
          },
          [dispatch, lastIndex],
        )}
        data={pages}
        keyExtractor={useCallback((item: PageInfo) => item.id, [])}
        renderItem={useCallback(
          (page: PageInfo, index, { isDragging }) => {
            const selected =
              !isDragging &&
              ((page.type === 'theme' && currentTab === 'theme') ||
                (page.type === 'header' && currentTab === 'pages') ||
                (page.type === 'design' &&
                  currentTab === 'canvas' &&
                  selectedPageId === page.id));

            const IconComponent =
              page.type === 'theme'
                ? TokensIcon
                : Selectors.isSymbolsPage({ name: page.name })
                ? StackIcon
                : FileIcon;

            return (
              <TreeView.Row<MenuItemType>
                id={page.id}
                key={page.id}
                isSectionHeader={page.type === 'header'}
                sortable={page.type === 'design'}
                expanded={page.type === 'header' ? isExpanded : undefined}
                selected={selected}
                onClickChevron={() => {
                  setIsExpanded(!isExpanded);
                }}
                onPress={() => {
                  dispatch('interaction', ['reset']);

                  switch (page.type) {
                    case 'header':
                      dispatch('setTab', 'pages');
                      break;
                    case 'design':
                      dispatch('setTab', 'canvas');
                      dispatch('selectPage', page.id);
                      break;
                    case 'theme':
                      dispatch('setTab', 'theme');
                      break;
                  }
                }}
                onDoubleClick={() => {
                  if (page.type !== 'design') return;

                  startRenamingPage(page.id);
                }}
                menuItems={page.type === 'design' ? pageMenuItems : undefined}
                onSelectMenuItem={handleSelectMenuItem}
                onContextMenu={() => {
                  if (page.type !== 'design') return;

                  dispatch('selectPage', page.id);
                }}
                icon={
                  page.type !== 'header' && (
                    <IconComponent
                      color={selected ? iconSelectedColor : iconColor}
                    />
                  )
                }
              >
                {page.id === editingPage ? (
                  <TreeView.EditableRowTitle
                    autoFocus
                    value={page.name}
                    onSubmitEditing={(name) => {
                      setEditingPage(undefined);

                      if (!name) return;

                      dispatch('setPageName', page.id, name);
                    }}
                  />
                ) : page.type === 'header' &&
                  !isExpanded &&
                  selectedPageName ? (
                  <>
                    <TitlePrefix>{`${page.name} / `}</TitlePrefix>
                    {selectedPageName}
                  </>
                ) : (
                  page.name
                )}
                {page.type === 'header' && (
                  <>
                    <Spacer.Horizontal />
                    <Spacer.Horizontal size={10} />
                    <IconButton
                      id="add-page"
                      iconName="PlusIcon"
                      tooltip="Add a new page"
                      onClick={handleAddPage}
                      selected={selected}
                    />
                  </>
                )}
              </TreeView.Row>
            );
          },
          [
            currentTab,
            selectedPageId,
            isExpanded,
            pageMenuItems,
            handleSelectMenuItem,
            iconSelectedColor,
            iconColor,
            editingPage,
            selectedPageName,
            handleAddPage,
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

  const pageInfo = useDeepMemo([
    {
      id: 'header',
      name: 'Pages',
      type: 'header' as const,
    },
    ...state.sketch.pages.map((page) => ({
      id: page.do_objectID,
      name: page.name,
      type: 'design' as const,
    })),
    {
      id: 'theme',
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
