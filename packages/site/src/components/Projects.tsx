import { formatDistance, parseISO } from 'date-fns';
import { useRouter } from 'next/router';
import { useNoyaClient, useNoyaFiles } from 'noya-api';
import {
  Button,
  createSectionedMenu,
  Heading2,
  ListView,
  Small,
  Spacer,
  Stack,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { resize } from 'noya-geometry';
import { DashboardIcon, PlusIcon } from 'noya-icons';
import { amplitude } from 'noya-log';
import { Layers } from 'noya-state';
import React, { useEffect, useState } from 'react';
import { createAyonDocument } from '../ayon/createAyonDocument';
import { ClientStorage } from '../utils/clientStorage';
import { NOYA_HOST } from '../utils/noyaClient';
import { Card } from './Subscription';

const thumbnailSize = { width: 64, height: 64 };

export function Projects() {
  const { push } = useRouter();
  const { files, loading } = useNoyaFiles();
  const client = useNoyaClient();

  const [showWelcomeCard, _setShowWelcomeCard] = useState(false);
  const hasFiles = files.length > 0;

  // Show welcome card in a useEffect so it doesn't flash due to SSR
  useEffect(() => {
    const dismissed = !!ClientStorage.getItem('welcomeCardDismissed');
    _setShowWelcomeCard(!dismissed && !loading && !hasFiles);
  }, [hasFiles, loading]);

  const setShowWelcomeCard = (value: boolean) => {
    if (!value) {
      ClientStorage.setItem('welcomeCardDismissed', 'true');
    }

    _setShowWelcomeCard(value);
  };

  const sortedFiles = [...files].sort(
    (a, b) => parseISO(b.updatedAt).valueOf() - parseISO(a.updatedAt).valueOf(),
  );

  const [hovered, setHovered] = useState<string | undefined>();
  const [selected, setSelected] = useState<string | undefined>();
  const [renaming, setRenaming] = useState<string | undefined>();

  const newProjectButton = (
    <Button
      variant="secondary"
      onClick={() => {
        const document = createAyonDocument();

        client.files
          // Wait till after navigating to refetch, since it looks bad
          // if the list updates before transitioning to the new page
          .create(
            {
              data: {
                name: 'Untitled',
                type: 'io.noya.ayon',
                schemaVersion: '0.1.0',
                document,
              },
            },
            { fetchPolicy: 'no-cache' },
          )
          .then((id) => {
            amplitude.logEvent('Project - Created');

            return push(`/projects/${id}`);
          })
          .then(() => client.files.refetch());
      }}
    >
      <PlusIcon />
      <Spacer.Horizontal size={8} />
      New Project
    </Button>
  );

  return (
    <Stack.V flex="1">
      <Stack.H alignItems="center">
        <Heading2 color="text">Projects</Heading2>
        <Spacer.Horizontal />
        {newProjectButton}
      </Stack.H>
      <Spacer.Vertical size={44} />
      {showWelcomeCard && (
        <>
          <Card
            title="Welcome to Noya!"
            subtitle="Get started by creating a new project."
            action={newProjectButton}
            closable
            onClose={() => {
              amplitude.logEvent('Welcome Card - Dismissed');

              setShowWelcomeCard(false);
            }}
          >
            <Spacer.Vertical size={6} />
            <Small color="text" fontWeight="bold">
              Watch the Intro Video
            </Small>
            <Spacer.Vertical size={10} />
            <iframe
              src="https://player.vimeo.com/video/797476910?h=9da5d48d32&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{ aspectRatio: '16/9' }}
              title="Noya Demo Video"
            />
            <script src="https://player.vimeo.com/api/player.js"></script>
          </Card>
          <Spacer.Vertical size={44} />
        </>
      )}
      <Stack.V>
        <ListView.Root divider>
          {sortedFiles.map((file) => {
            const artboard = Layers.find<Sketch.Artboard>(
              file.data.document.pages[0],
              Layers.isArtboard,
            );
            const scaledThumbnailSize = artboard
              ? resize(artboard.frame, thumbnailSize, 'scaleAspectFit')
              : thumbnailSize;
            scaledThumbnailSize.width = Math.round(scaledThumbnailSize.width);
            scaledThumbnailSize.height = Math.round(scaledThumbnailSize.height);

            return (
              <ListView.Row
                key={file.id}
                hovered={hovered === file.id}
                selected={selected === file.id}
                menuItems={createSectionedMenu(
                  [
                    { title: 'Rename', value: 'rename' } as const,
                    { title: 'Duplicate', value: 'duplicate' } as const,
                  ],
                  [{ title: 'Delete', value: 'delete' } as const],
                )}
                onSelectMenuItem={async (value) => {
                  switch (value) {
                    case 'delete':
                      client.files.delete(file.id);
                      return;
                    case 'rename':
                      setRenaming(file.id);
                      return;
                    case 'duplicate': {
                      const newFileId = await client.files.create({
                        fileId: file.id,
                      });

                      amplitude.logEvent(
                        'Project - Created (From Duplication)',
                      );

                      // Update the name of the new file
                      const newFile = await client.files.read(newFileId);

                      await client.files.update(newFile.id, {
                        ...newFile.data,
                        name: `${file.data.name} Copy`,
                      });

                      setRenaming(newFile.id);
                    }
                  }
                }}
                onHoverChange={(hovered) => {
                  setHovered(hovered ? file.id : undefined);
                }}
                onPress={() => {
                  push(`/projects/${file.id}`);
                }}
                onMenuOpenChange={(open) => {
                  setSelected(open ? file.id : undefined);
                }}
              >
                <Stack.H
                  gap={12}
                  padding={'8px 0'}
                  margin={'0 -10px'}
                  alignItems="center"
                  flex="1"
                >
                  <img
                    src={`${NOYA_HOST}/api/files/${file.id}/thumbnail.png?width=${scaledThumbnailSize.width}&height=${scaledThumbnailSize.height}&deviceScaleFactor=1`}
                    alt=""
                    style={{
                      ...thumbnailSize,
                      objectFit: 'contain',
                      background: '#eee',
                    }}
                  />
                  <Stack.V flex="1">
                    <Stack.H alignItems="center">
                      <DashboardIcon />
                      <Spacer.Horizontal size={10} />
                      {renaming === file.id ? (
                        <ListView.EditableRowTitle
                          value={file.data.name}
                          autoFocus
                          onSubmitEditing={(value) => {
                            setRenaming(undefined);

                            if (value === file.data.name) return;

                            client.files.update(file.id, {
                              ...file.data,
                              name: value,
                            });
                          }}
                        />
                      ) : (
                        <ListView.RowTitle>{file.data.name}</ListView.RowTitle>
                      )}
                      <Spacer.Horizontal size={10} />
                      <Small color="textMuted">
                        {'Edited '}
                        {formatDistance(parseISO(file.updatedAt), new Date(), {
                          addSuffix: true,
                        }).replace('less than a minute ago', 'just now')}
                      </Small>
                    </Stack.H>
                  </Stack.V>
                </Stack.H>
              </ListView.Row>
            );
          })}
        </ListView.Root>
      </Stack.V>
    </Stack.V>
  );
}
