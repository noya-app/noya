import { PlusIcon } from '@radix-ui/react-icons';
import { Button, ListView, Spacer } from 'noya-designsystem';
import { MenuItem } from 'noya-designsystem/src/components/ContextMenu';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useApplicationState } from '../contexts/ApplicationStateContext';
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

export default function PageList() {
  const [state, dispatch] = useApplicationState();

  const pageInfo = useDeepArray(
    state.sketch.pages.map((page) => ({
      do_objectID: page.do_objectID,
      name: page.name,
    })),
  );

  const moreThanOnePage = state.sketch.pages.length > 1;
  const menuItems: MenuItem<MenuItemType>[] = useMemo(
    () => [
      { value: 'duplicate', title: 'Duplicate Page' },
      { value: 'rename', title: 'Rename Page' },
      ...(moreThanOnePage
        ? [{ value: 'delete' as MenuItemType, title: 'Delete Page' }]
        : []),
    ],
    [moreThanOnePage],
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

  const pageElements = useMemo(() => {
    return pageInfo.map((page) => (
      <ListView.Row<MenuItemType>
        id={page.do_objectID}
        key={page.do_objectID}
        selected={state.selectedPage === page.do_objectID}
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
    ));
  }, [pageInfo, state.selectedPage, menuItems, handleSelectMenuItem, dispatch]);

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
        sortable={true}
        onMoveItem={useCallback(
          (sourceIndex, destinationIndex) => {
            dispatch('movePage', sourceIndex, destinationIndex);
          },
          [dispatch],
        )}
      >
        {pageElements}
      </ListView.Root>
    </Container>
  );
}
