import { Action, ApplicationState } from 'ayano-state';
import { useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import * as ListView from '../components/ListView';
import { defaultTheme } from '../theme';
import withSeparatorElements from '../utils/withSeparatorElements';
import Canvas from './Canvas';

interface Props {
  state: ApplicationState;
  dispatch: (action: Action) => void;
}

export default function Workspace({ state, dispatch }: Props) {
  const pageElements = useMemo(() => {
    return withSeparatorElements(
      state.sketch.pages.map((page) => (
        <ListView.Row
          onClick={() => {
            console.log(page, page.do_objectID);
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
    <div
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}
    >
      <ThemeProvider theme={defaultTheme}>
        <ListView.Root>
          <ListView.SectionHeader>
            <strong>Pages</strong>
          </ListView.SectionHeader>
          {pageElements}
        </ListView.Root>
      </ThemeProvider>
      <Canvas state={state} dispatch={dispatch} />
    </div>
  );
}
