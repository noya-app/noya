import { FileIcon, PlusIcon, StackIcon } from '@radix-ui/react-icons';
import {
  useApplicationState,
  useDispatch,
  useWorkspace,
} from 'noya-app-state-context';
import {
  Button,
  ListView,
  MenuItem,
  RelativeDropPosition,
  Spacer,
} from 'noya-designsystem';
import { Selectors } from 'noya-state';
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
  cursor: 'pointer',
  fontWeight: 500,
  paddingTop: '8px',
  paddingRight: '8px',
  paddingBottom: '0px',
  paddingLeft: '20px',
  display: 'flex',
  alignItems: 'center',
}));

type MenuItemType = 'duplicate' | 'rename' | 'delete';

type PageInfo = { do_objectID: string; name: string };

interface Props {
  selectedPageId: string;
  pageInfo: PageInfo[];
  canDelete: boolean;
  renamingPage?: string;
  startRenamingPage: (id: string) => void;
  didHandleFocus: () => void;
}

const PageListContent = memo(function PageListContent({
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

  const menuItems: MenuItem<MenuItemType>[] = useMemo(
    () => [
      { value: 'duplicate', title: 'Duplicate Page' },
      { value: 'rename', title: 'Rename Page' },
      ...(canDelete
        ? [{ value: 'delete' as MenuItemType, title: 'Delete Page' }]
        : []),
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

  return (
    <Container>
      <Header>
        Pages
        <Spacer.Horizontal />
        <Button id="add-page" tooltip="Add a new page" onClick={handleAddPage}>
          <PlusIcon />
        </Button>
      </Header>
      <ListView.Root
        sortable={!editingPage}
        scrollable
        onMoveItem={useCallback(
          (
            sourceIndex: number,
            destinationIndex: number,
            position: RelativeDropPosition,
          ) => {
            dispatch(
              'movePage',
              sourceIndex,
              position === 'below' ? destinationIndex + 1 : destinationIndex,
            );
          },
          [dispatch],
        )}
        items={pageInfo}
        renderItem={useCallback(
          (page: PageInfo, index, { isDragging }) => {
            const selected = !isDragging && selectedPageId === page.do_objectID;
            const IconComponent = Selectors.isSymbolsPage({ name: page.name })
              ? StackIcon
              : FileIcon;

            return (
              <ListView.Row<MenuItemType>
                id={page.do_objectID}
                key={page.do_objectID}
                selected={selected}
                onClick={() => {
                  dispatch('interaction', ['reset']);
                  dispatch('selectPage', page.do_objectID);
                }}
                menuItems={menuItems}
                onSelectMenuItem={handleSelectMenuItem}
                onContextMenu={() => {
                  dispatch('selectPage', page.do_objectID);
                }}
              >
                <IconComponent
                  color={selected ? iconSelectedColor : iconColor}
                />
                <Spacer.Horizontal size={10} />
                {page.do_objectID === editingPage ? (
                  <ListView.EditableRowTitle
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
              </ListView.Row>
            );
          },
          [
            selectedPageId,
            menuItems,
            handleSelectMenuItem,
            iconSelectedColor,
            iconColor,
            editingPage,
            dispatch,
          ],
        )}
      />
    </Container>
  );
});

export default function PageList() {
  const [state] = useApplicationState();
  const { renamingPage, startRenamingPage, didHandleFocus } = useWorkspace();

  const pageInfo = useDeepArray(
    state.sketch.pages.map((page) => ({
      do_objectID: page.do_objectID,
      name: page.name,
    })),
  );

  return (
    <PageListContent
      selectedPageId={state.selectedPage}
      pageInfo={pageInfo}
      canDelete={state.sketch.pages.length > 1}
      renamingPage={renamingPage}
      startRenamingPage={startRenamingPage}
      didHandleFocus={didHandleFocus}
    />
  );
}
