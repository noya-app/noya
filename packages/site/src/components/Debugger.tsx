import { useNetworkRequests } from 'noya-api';
import {
  Chip,
  IconButton,
  ListView,
  Small,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import {
  AutoSizer,
  castHashParameter,
  useUrlHashParameters,
} from 'noya-react-utils';
import React, { memo } from 'react';

// If a request contains 'api/', show only the part after 'api/'
// Otherwise, show the full URL
function formatUrl(url: string) {
  const index = url.indexOf('api/');
  return index === -1 ? url : url.slice(index + 4);
}

const NetworkDebugger = memo(function NetworkDebugger() {
  const requests = useNetworkRequests();

  return (
    <AutoSizer>
      {(size) => (
        <ListView.Root
          scrollable
          data={requests}
          keyExtractor={(request, index) => index.toString()}
          divider
          virtualized={size}
          renderItem={({
            method,
            completed,
            abort,
            url,
            aborted,
            abortStream,
            isStreaming,
            status,
          }) => (
            <ListView.Row
              gap={4}
              onPress={() => {
                // console.log('request', request, 'response', response);
              }}
            >
              <Chip size="small">{method}</Chip>
              <ListView.RowTitle>
                <Small fontSize="11px">{formatUrl(url)}</Small>
              </ListView.RowTitle>
              {!completed && (
                <>
                  <IconButton iconName="CrossCircledIcon" onClick={abort} />
                </>
              )}
              {isStreaming && (
                <Chip
                  size="small"
                  deletable
                  onDelete={() => {
                    abortStream?.();
                  }}
                >
                  Streaming
                </Chip>
              )}
              {completed && (
                <Chip
                  size="small"
                  colorScheme={
                    status && status >= 200 && status < 300
                      ? 'secondary'
                      : 'error'
                  }
                >
                  {aborted ? 'Aborted' : status}
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
