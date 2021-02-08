import { useMemo } from 'react';
import styled from 'styled-components';
import * as ListView from '../components/ListView';
import * as Spacer from '../components/Spacer';
import { useApplicationState } from '../contexts/ApplicationStateContext';

interface Props {}

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
  paddingRight: '20px',
  paddingBottom: '0px',
  paddingLeft: '20px',
  display: 'flex',
  alignItems: 'center',
}));

export default function PageList(props: Props) {
  const [state, dispatch] = useApplicationState();

  const pageElements = useMemo(() => {
    return state.sketch.pages.map((page) => (
      <ListView.Row
        key={page.do_objectID}
        selected={state.selectedPage === page.do_objectID}
        onClick={() => {
          dispatch('interaction', ['reset']);
          dispatch('selectPage', page.do_objectID);
        }}
      >
        <Spacer.Horizontal size={6 + 15} />
        {page.name}
      </ListView.Row>
    ));
  }, [state, dispatch]);

  return (
    <Container>
      <Header>Pages</Header>
      <ListView.Root>{pageElements}</ListView.Root>
    </Container>
  );
}
