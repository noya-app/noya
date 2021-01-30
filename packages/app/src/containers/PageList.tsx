import { useMemo } from 'react';
import styled from 'styled-components';
import * as ListView from '../components/ListView';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import withSeparatorElements from '../utils/withSeparatorElements';

interface Props {}

const Container = styled.div(({ theme }) => ({
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
}));

export default function PageList(props: Props) {
  const [state, dispatch] = useApplicationState();

  const pageElements = useMemo(() => {
    return withSeparatorElements(
      state.sketch.pages.map((page) => (
        <ListView.Row
          key={page.do_objectID}
          selected={state.selectedPage === page.do_objectID}
          onClick={() => {
            dispatch(['selectPage', page.do_objectID]);
          }}
        >
          {page.name}
        </ListView.Row>
      )),
      <ListView.Spacer />,
    );
  }, [state, dispatch]);

  return (
    <Container>
      <ListView.Root>
        <ListView.SectionHeader>
          <strong>Pages</strong>
        </ListView.SectionHeader>
        {pageElements}
      </ListView.Root>
    </Container>
  );
}
