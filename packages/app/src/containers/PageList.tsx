import { PlusIcon } from '@radix-ui/react-icons';
import {
  Button,
  ListView,
  MenuItem,
  RelativeDropPosition,
  Spacer,
} from 'noya-designsystem';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  useApplicationState,
  useDispatch,
} from '../contexts/ApplicationStateContext';
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
}

const PageListContent = memo(function PageListContent({
  selectedPageId,
  pageInfo,
  canDelete,
}: Props) {
  const dispatch = useDispatch();

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
          const name = prompt('New page Name');

          if (name) dispatch('renamePage', name);
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
    [dispatch],
  );

  const handleAddPage = useCallback(() => {
    const name = prompt('New page Name');

    if (name !== null) dispatch('addPage', name);
  }, [dispatch]);

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
        sortable
        scrollable
        onMoveItem={useCallback(
          (
            sourceIndex: number,
            destinationIndex: number,
            position: RelativeDropPosition,
          ) => {
            if (
              sourceIndex === destinationIndex ||
              (position === 'above' && sourceIndex + 1 === destinationIndex) ||
              (position === 'below' && sourceIndex - 1 === destinationIndex)
            )
              return;

            dispatch('movePage', sourceIndex, destinationIndex);
          },
          [dispatch],
        )}
        items={pageInfo}
        renderItem={useCallback(
          (page: PageInfo, index, { isDragging }) => (
            <ListView.Row<MenuItemType>
              id={page.do_objectID}
              key={page.do_objectID}
              selected={!isDragging && selectedPageId === page.do_objectID}
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
              <Spacer.Horizontal size={6 + 15} />
              {page.name}
            </ListView.Row>
          ),
          [selectedPageId, menuItems, handleSelectMenuItem, dispatch],
        )}
      />
    </Container>
  );
});

export default function PageList() {
  const [state] = useApplicationState();

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
    />
  );
}
