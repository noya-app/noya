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
  MenuItem,
  RelativeDropPosition,
  Spacer,
  Tooltip,
  TreeView,
} from 'noya-designsystem';
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
import useDeepArray from '../hooks/useDeepArray';

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

// Icon components can't have tooltips (no ref) so need a container.
// We use padding to expand the hit target a little.
const PlusIconContainer = styled.span({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px',
  position: 'relative',
  left: '2px',
});

type MenuItemType = 'duplicate' | 'rename' | 'delete';

type PageInfo = {
  do_objectID: string;
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
  const {
    icon: iconColor,
    iconSelected: iconSelectedColor,
  } = useTheme().colors;
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

      setIsExpanded(true);
      const pageId = uuid();
      dispatch('addPage', pageId);
      startRenamingPage(pageId);
    },
    [dispatch, startRenamingPage],
  );

  useLayoutEffect(() => {
    if (!renamingPage) return;

    setEditingPage(renamingPage);

    didHandleFocus();
  }, [didHandleFocus, renamingPage]);

  const lastIndex = pageInfo.length - 1;
  const pages = isExpanded ? pageInfo : pageInfo.slice(0, 1);
  const selectedPageName = pageInfo.find(
    (info) => info.do_objectID === selectedPageId,
  )?.name;

  // Limit the container size when we have enough pages
  const scrollable = pages.length > 5;

  return (
    <Container expanded={scrollable}>
      <TreeView.Root
        sortable={!editingPage}
        scrollable={scrollable}
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
        items={pages}
        renderItem={useCallback(
          (page: PageInfo, index, { isDragging }) => {
            const selected =
              !isDragging &&
              ((page.type === 'theme' && currentTab === 'theme') ||
                (page.type === 'header' && currentTab === 'pages') ||
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
                isSectionHeader={page.type === 'header'}
                expanded={page.type === 'header' ? isExpanded : undefined}
                selected={selected}
                onClickChevron={() => {
                  setIsExpanded(!isExpanded);
                }}
                onClick={() => {
                  dispatch('interaction', ['reset']);

                  switch (page.type) {
                    case 'header':
                      dispatch('setTab', 'pages');
                      break;
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
                  if (page.type !== 'design') return;

                  startRenamingPage(page.do_objectID);
                }}
                menuItems={page.type === 'design' ? pageMenuItems : undefined}
                onSelectMenuItem={handleSelectMenuItem}
                onContextMenu={() => {
                  if (page.type !== 'design') return;

                  dispatch('selectPage', page.do_objectID);
                }}
                icon={
                  page.type !== 'header' && (
                    <IconComponent
                      color={selected ? iconSelectedColor : iconColor}
                    />
                  )
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
                    <Tooltip content="Add a new page">
                      <PlusIconContainer id="add-page" onClick={handleAddPage}>
                        <PlusIcon />
                      </PlusIconContainer>
                    </Tooltip>
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

  const pageInfo = useDeepArray([
    {
      do_objectID: 'header',
      name: 'Pages',
      type: 'header' as const,
    },
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
