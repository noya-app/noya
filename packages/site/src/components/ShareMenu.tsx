import { useNoyaClient } from 'noya-api';
import {
  IconButton,
  InputField,
  Small,
  Spacer,
  Switch,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import React, { useEffect, useReducer } from 'react';
import { useToggleTimer } from '../hooks/useToggleTimer';

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
  | {
      type: 'stopSharing';
    }
  | {
      type: 'loaded';
    };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'startSharing':
      return {
        loading: false,
        sharing: { url: action.url, duplicable: action.duplicable },
      };
    case 'stopSharing':
      return { loading: false };
    case 'loaded':
      return { loading: false };
  }
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
          url: `${process.env.NEXT_PUBLIC_NOYA_WEB_URL}/app/shares/${share.id}`,
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

                    dispatch({
                      type: 'startSharing',
                      url: `${process.env.NEXT_PUBLIC_NOYA_WEB_URL}/app/shares/${share.id}`,
                      duplicable: share.duplicable,
                    });
                  } else {
                    await client.files.shares.create(fileId, {
                      viewable: false,
                    });

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
              </>
            )}
          </>
        )}
      </InspectorPrimitives.Section>
    </>
  );
}
