import { useNoyaClient } from 'noya-api';
import {
  Button,
  Divider,
  IconButton,
  InputField,
  Small,
  Spacer,
  Stack,
  Switch,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { OpenInNewWindowIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import { amplitude } from 'noya-log';
import React, { useEffect, useReducer } from 'react';
import { useToggleTimer } from '../hooks/useToggleTimer';
import { NOYA_HOST } from '../utils/noyaClient';

type State =
  | {
      loading: false;
      sharing?: {
        url: string;
        duplicable: boolean;
      };
    }
  | {
      loading: true;
    };

type Action =
  | {
      type: 'startSharing';
      url: string;
      duplicable: boolean;
    }
  | { type: 'stopSharing' }
  | { type: 'setDuplicable'; value: boolean }
  | { type: 'loaded' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'startSharing':
      return {
        loading: false,
        sharing: { url: action.url, duplicable: action.duplicable },
      };
    case 'stopSharing':
      return { loading: false };
    case 'setDuplicable':
      if (state.loading || !state.sharing) return state;

      return {
        loading: false,
        sharing: { ...state.sharing, duplicable: action.value },
      };
    case 'loaded':
      return { loading: false };
  }
}

function getShareUrl(shareId: string) {
  return `${NOYA_HOST!.replace('www.', '')}/share/${shareId}`;
}

export function ShareMenu({ fileId }: { fileId: string }) {
  const client = useNoyaClient();
  const [shareState, dispatch] = useReducer(reducer, { loading: false });
  const theme = useDesignSystemTheme();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const clipboardIcon = useToggleTimer(1000);

  useEffect(() => {
    client.files.shares.list(fileId).then((shares) => {
      const share = shares[0];

      if (share && share.viewable) {
        dispatch({
          type: 'startSharing',
          url: getShareUrl(share.id),
          duplicable: share.duplicable,
        });
      } else {
        dispatch({ type: 'loaded' });
      }
    });
  }, [client.files.shares, fileId]);

  return (
    <>
      <InspectorPrimitives.Section>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Sharing</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.VerticalSeparator />
        {shareState.loading && <Small color="text">Loading...</Small>}
        {!shareState.loading && (
          <>
            <InspectorPrimitives.Row>
              <Small color="text">Share (read only)</Small>
              <Spacer.Horizontal />
              <Switch
                value={!!shareState.sharing}
                variant="secondary"
                onChange={async (value) => {
                  if (value) {
                    const share = await client.files.shares.create(fileId);

                    amplitude.logEvent('Project - Share - Enabled');

                    dispatch({
                      type: 'startSharing',
                      url: getShareUrl(share.id),
                      duplicable: share.duplicable,
                    });
                  } else {
                    await client.files.shares.create(fileId, {
                      viewable: false,
                    });

                    amplitude.logEvent('Project - Share - Disabled');

                    dispatch({ type: 'stopSharing' });
                  }
                }}
              />
            </InspectorPrimitives.Row>
            {shareState.sharing && (
              <>
                <InspectorPrimitives.VerticalSeparator />
                <InspectorPrimitives.Row>
                  <InputField.Root labelPosition="end" labelSize={16}>
                    <InputField.Input
                      readOnly
                      value={shareState.sharing.url}
                      ref={inputRef}
                      onClick={() => {
                        inputRef.current?.select();
                      }}
                    />
                    <InputField.Label pointerEvents="all">
                      <IconButton
                        color={theme.colors.text}
                        iconName={
                          clipboardIcon.value ? 'CheckIcon' : 'ClipboardIcon'
                        }
                        onClick={() => {
                          if (!shareState.sharing) return;
                          navigator.clipboard.writeText(shareState.sharing.url);
                          clipboardIcon.trigger();
                        }}
                      />
                    </InputField.Label>
                  </InputField.Root>
                </InspectorPrimitives.Row>
                <InspectorPrimitives.VerticalSeparator />
                <Button
                  as="a"
                  variant="secondary"
                  href={shareState.sharing.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview in new tab
                  <Spacer.Horizontal size={6} inline />
                  <OpenInNewWindowIcon />
                </Button>
                <InspectorPrimitives.VerticalSeparator />
                <Divider overflow={10} />
                <InspectorPrimitives.VerticalSeparator />
                <InspectorPrimitives.Row>
                  <Stack.V flex="1 1 0%">
                    <Small color="text">This is a template</Small>
                    <Spacer.Vertical size={4} />
                    <Small color="textSubtle" fontSize="12px">
                      Allow people who view your project to clone it as a
                      starting point for their own work
                    </Small>
                  </Stack.V>
                  <Spacer.Horizontal size={8} />
                  <Switch
                    value={shareState.sharing.duplicable}
                    variant="secondary"
                    onChange={async (value) => {
                      if (!shareState.sharing) return;

                      await client.files.shares.create(fileId, {
                        viewable: true,
                        duplicable: value,
                      });

                      if (value) {
                        amplitude.logEvent(
                          'Project - Share - Duplication - Enabled',
                        );
                      } else {
                        amplitude.logEvent(
                          'Project - Share - Duplication - Disabled',
                        );
                      }

                      dispatch({ type: 'setDuplicable', value });
                    }}
                  />
                </InspectorPrimitives.Row>
              </>
            )}
          </>
        )}
      </InspectorPrimitives.Section>
    </>
  );
}
