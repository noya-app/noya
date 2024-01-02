import {
  decodeQueryParameters,
  encodeQueryParameters,
} from '@noya-app/noya-utils';
import { useNetworkRequests } from 'noya-api';
import {
  Chip,
  Divider,
  IconButton,
  InputField,
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
import { usePersistentState } from '../utils/clientStorage';

// If a request contains 'api/', show only the part after 'api/'
// Otherwise, show the full URL
function formatUrl(url: string) {
  const index = url.indexOf('api/');
  return index === -1 ? url : url.slice(index + 4);
}

const NetworkDebugger = memo(function NetworkDebugger() {
  const theme = useDesignSystemTheme();
  const requests = useNetworkRequests();
  const [filter, setFilter] = usePersistentState('networkDebuggerFilter');
  const [pendingFilter, setPendingFilter] = usePersistentState<'on' | 'off'>(
    'networkDebuggerPendingFilter',
    'off',
  );
  const [streamingFilter, setStreamingFilter] = usePersistentState<
    'on' | 'off'
  >('networkDebuggerStreamingFilter', 'off');

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        if (filter && !request.url.includes(filter)) return false;
        if (pendingFilter === 'on' && streamingFilter === 'on') {
          return !request.completed || request.isStreaming;
        }
        if (pendingFilter === 'on') return !request.completed;
        if (streamingFilter === 'on') return request.isStreaming;
        return true;
      }),
    [filter, pendingFilter, requests, streamingFilter],
  );

  const pendingCount = useMemo(
    () => filteredRequests.filter((request) => !request.completed).length,
    [filteredRequests],
  );

  const streamingCount = useMemo(
    () => filteredRequests.filter((request) => request.isStreaming).length,
    [filteredRequests],
  );

  return (
    <>
      <Stack.V padding="12px" gap="8px">
        <Stack.H>
          <InputField.Root>
            <InputField.Input
              placeholder="Filter"
              onChange={setFilter}
              value={filter ?? ''}
              type="search"
            />
          </InputField.Root>
        </Stack.H>
        <Stack.H gap="4px">
          <Chip
            size="small"
            addable={pendingFilter !== 'on'}
            deletable={pendingFilter === 'on'}
            onAdd={() => setPendingFilter('on')}
            onDelete={() => setPendingFilter('off')}
            colorScheme={pendingFilter === 'on' ? 'secondary' : undefined}
          >
            {pendingCount} in flight
          </Chip>
          <Chip
            size="small"
            addable={streamingFilter !== 'on'}
            deletable={streamingFilter === 'on'}
            onAdd={() => setStreamingFilter('on')}
            onDelete={() => setStreamingFilter('off')}
            colorScheme={streamingFilter === 'on' ? 'secondary' : undefined}
          >
            {streamingCount} streaming
          </Chip>
        </Stack.H>
      </Stack.V>
      <Divider />
      <AutoSizer>
        {(size) => (
          <ListView.Root
            scrollable
            data={filteredRequests}
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
              attempt,
            }) => (
              <ListView.Row
                gap={4}
                backgroundColor={
                  completed && !isStreaming
                    ? theme.colors.dividerSubtle
                    : undefined
                }
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
                {attempt > 1 && <Chip size="small">Retry {attempt - 1}</Chip>}
                {isStreaming && (
                  <Chip
                    size="small"
                    deletable
                    colorScheme="primary"
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
                      aborted || (status && status >= 300)
                        ? 'error'
                        : 'secondary'
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
    </>
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
      <Stack.H
        height={theme.sizes.toolbar.height}
        alignItems="center"
        padding="0 12px"
      >
        <Small>Debugger</Small>
        <Spacer.Horizontal />
        <IconButton
          iconName="Cross1Icon"
          onClick={() => {
            // Remove the #debug=true parameter from the URL
            const parameters = decodeQueryParameters(
              window.location.hash.slice(1),
            );
            const newParameters = Object.fromEntries(
              Object.entries(parameters).filter(([key]) => key !== 'debug'),
            );
            window.location.hash = encodeQueryParameters(newParameters);
          }}
        />
      </Stack.H>
      <Divider />
      <NetworkDebugger />
    </Stack.V>
  );
});
