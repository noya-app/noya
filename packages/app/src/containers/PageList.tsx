import {
  useApplicationState,
  useDispatch,
  useWorkspace,
} from 'noya-app-state-context';
import {
  IconButton,
  Label,
  MenuItem,
  RelativeDropPosition,
  Spacer,
  TreeView,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { DashboardIcon, FileIcon, StackIcon } from 'noya-icons';
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
import { PagePreviewItem } from './PagePreviewItem';

const Container = styled.div<{ expanded: boolean }>(({ theme, expanded }) => ({
  ...(expanded ? { height: '200px' } : { flex: '0 0 auto' }),
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255,255,255,0.02)',
}));

const PagePreviewContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const PageThumbnailContainer = styled.div({
  width: 128,
  height: 72,
  background: 'white',
});

const PageNumberContainer = styled.div({
  width: 16,
  textAlign: 'center',
});

interface PagePreviewProps {
  page: Sketch.Page;
  pageNumber: number;
  selected: boolean;
}

const PagePreview = memo(function PagePreview({
  page,
  pageNumber,
  selected,
}: PagePreviewProps) {
  return (
    <PagePreviewContainer>
      <PageNumberContainer>
        <Label.Label selected={selected}>{pageNumber}</Label.Label>
      </PageNumberContainer>
      <Spacer.Horizontal size={16} />
      <PageThumbnailContainer>
        <PagePreviewItem page={page} />
      </PageThumbnailContainer>
    </PagePreviewContainer>
  );
});

const TitlePrefix = styled.span({
  opacity: 0.7,
  whiteSpace: 'pre',
});

type MenuItemType = 'duplicate' | 'rename' | 'delete';

type PageInfo = {
  id: string;
  name: string;
} & (
  | {
      type: 'design';
      page?: Sketch.Page;
      pageNumber: number;
    }
  | {
      type: 'header';
      subtitle?: string;
    }
  | {
      type: 'theme';
    }
);

interface Props {
  currentTab: WorkspaceTab;
  selectedPageId: string;
  pageInfo: PageInfo[];
  canDelete: boolean;
  renamingPage?: string;
  renameOnCreate?: boolean;
  startRenamingPage: (id: string) => void;
  didHandleFocus: () => void;
  listScrollThreshold: number;
}

const PageListContent = memo(function PageListContent({
  currentTab,
  selectedPageId,
  pageInfo,
  canDelete,
  renamingPage,
  startRenamingPage,
  didHandleFocus,
  renameOnCreate,
  listScrollThreshold,
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

      if (renameOnCreate) {
        startRenamingPage(pageId);
      }
    },
    [dispatch, renameOnCreate, startRenamingPage],
  );

  useLayoutEffect(() => {
    if (!renamingPage) return;

    setIsExpanded(true);
    setEditingPage(renamingPage);

    didHandleFocus();
  }, [didHandleFocus, renamingPage]);

  const lastIndex = pageInfo.length - 1;
  const pages = useMemo(
    () => (isExpanded ? pageInfo : pageInfo.slice(0, 1)),
    [isExpanded, pageInfo],
  );

  // Limit the container size when we have enough pages
  const scrollable = pages.length > listScrollThreshold;

  return (
    <Container expanded={scrollable}>
      <TreeView.Root
        sortable={!editingPage}
        scrollable={scrollable}
        data={pages}
        keyExtractor={useCallback((item: PageInfo) => item.id, [])}
        acceptsDrop={useCallback(
          (
            sourceId: number,
            destinationId: number,
            relationDropPosition: RelativeDropPosition,
          ) => {
            if (relationDropPosition === 'inside') return false;
            const destinationItem = pages[destinationId];
            return destinationItem?.type === 'design';
          },
          [pages],
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
                ? DashboardIcon
                : Selectors.isSymbolsPage({ name: page.name })
                ? StackIcon
                : FileIcon;

            const icon =
              page.type === 'design' && page.page ? (
                <PagePreview
                  selected={selected}
                  pageNumber={page.pageNumber}
                  page={page.page}
                />
              ) : (
                page.type !== 'header' && (
                  <IconComponent
                    color={selected ? iconSelectedColor : iconColor}
                  />
                )
              );

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
                icon={icon}
              >
                {
                  // If we're showing a thumbnail, we don't show the page name
                  page.type === 'design' && page.page ? (
                    ''
                  ) : page.id === editingPage ? (
                    <TreeView.EditableRowTitle
                      autoFocus
                      value={page.name}
                      onSubmitEditing={(name) => {
                        setEditingPage(undefined);

                        if (!name) return;

                        dispatch('setPageName', page.id, name);
                      }}
                    />
                  ) : page.type === 'header' && !isExpanded && page.subtitle ? (
                    <>
                      <TitlePrefix>{page.name} / </TitlePrefix>
                      {page.subtitle}
                    </>
                  ) : (
                    page.name
                  )
                }
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
            iconSelectedColor,
            iconColor,
            isExpanded,
            pageMenuItems,
            handleSelectMenuItem,
            editingPage,
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
  const {
    renamingPage,
    startRenamingPage,
    didHandleFocus,
    preferences: { showPageListThumbnails: showPageListThumbnail },
  } = useWorkspace();
  const currentTab = Selectors.getCurrentTab(state);

  const selectedPageIndex = state.sketch.pages.findIndex(
    (page) => page.do_objectID === state.selectedPage,
  );
  const selectedPage = state.sketch.pages.find(
    (page) => page.do_objectID === state.selectedPage,
  );

  const pageInfo = useDeepMemo([
    {
      id: 'header',
      name: 'Pages',
      subtitle:
        showPageListThumbnail && selectedPageIndex !== undefined
          ? (selectedPageIndex + 1).toString()
          : selectedPage?.name,
      type: 'header' as const,
    },
    ...state.sketch.pages.map((page, index) => ({
      id: page.do_objectID,
      name: page.name,
      type: 'design' as const,
      // Include page only if needed since this will worsen perf due to re-renders
      page: showPageListThumbnail ? page : undefined,
      pageNumber: index + 1,
    })),
    ...(showPageListThumbnail
      ? []
      : [
          {
            id: 'theme',
            name: 'Theme',
            type: 'theme' as const,
          },
        ]),
  ]);

  return (
    <PageListContent
      currentTab={currentTab}
      selectedPageId={state.selectedPage}
      pageInfo={pageInfo}
      canDelete={state.sketch.pages.length > 1}
      renamingPage={renamingPage}
      renameOnCreate={!showPageListThumbnail}
      startRenamingPage={startRenamingPage}
      didHandleFocus={didHandleFocus}
      listScrollThreshold={showPageListThumbnail ? 3 : 5}
    />
  );
}
