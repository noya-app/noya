import { useNetworkRequests } from 'noya-api';
import {
  Chip,
  IconButton,
  ListView,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import {
  AutoSizer,
  castHashParameter,
  useUrlHashParameters,
} from 'noya-react-utils';
import React, { memo, useMemo } from 'react';

// If a request contains 'api/', show only the part after 'api/'
// Otherwise, show the full URL
function formatUrl(url: string) {
  const index = url.indexOf('api/');
  return index === -1 ? url : url.slice(index + 4);
}

const NetworkDebugger = memo(function NetworkDebugger() {
  const { requests, completedRequests } = useNetworkRequests();

  const allRequests = useMemo(
    () => [...requests, ...completedRequests],
    [completedRequests, requests],
  );

  return (
    <AutoSizer>
      {(size) => (
        <ListView.Root
          scrollable
          data={allRequests}
          keyExtractor={(request, index) => index.toString()}
          divider
          virtualized={size}
          renderItem={({ request, completed, abort, response, aborted }) => (
            <ListView.Row>
              <Chip size="small">{request.method}</Chip>
              <Spacer.Horizontal size="4px" />
              <ListView.RowTitle>
                <Small fontSize="11px">{formatUrl(request.url)}</Small>
              </ListView.RowTitle>
              {!completed && (
                <>
                  <IconButton iconName="CrossCircledIcon" onClick={abort} />
                </>
              )}
              <Spacer.Horizontal size="4px" />
              {completed && (
                <Chip
                  size="small"
                  colorScheme={
                    response && response.status >= 200 && response.status < 300
                      ? 'secondary'
                      : 'primary'
                  }
                >
                  {response ? response.status : aborted ? 'Aborted' : '?'}
                </Chip>
              )}
            </ListView.Row>
          )}
        />
      )}
    </AutoSizer>
  );
});

export const Debugger = memo(function Debugger() {
  const urlHashParameters = useUrlHashParameters();
  const isDebug = castHashParameter(urlHashParameters.debug, 'boolean');
  const theme = useDesignSystemTheme();

  if (!isDebug) return null;

  return (
    <Stack.V
      id="debugger"
      flex="0 0 300px"
      borderLeft={`1px solid ${theme.colors.divider}`}
      background={theme.colors.sidebar.background}
    >
      <NetworkDebugger />
    </Stack.V>
  );
});
