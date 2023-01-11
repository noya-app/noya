import { formatDistance, parseISO } from 'date-fns';
import { useRouter } from 'next/router';
import { useNoyaClient, useNoyaFiles } from 'noya-api';
import {
  Button,
  Heading2,
  ListView,
  Small,
  Spacer,
  Stack,
} from 'noya-designsystem';
import { DashboardIcon, PlusIcon } from 'noya-icons';
import React, { useState } from 'react';
import { createAyonFile } from '../ayon/createAyonFile';

export function Projects() {
  const { push } = useRouter();
  const files = useNoyaFiles();
  const client = useNoyaClient();

  const sortedFiles = files.sort(
    (a, b) => parseISO(b.updatedAt).valueOf() - parseISO(a.updatedAt).valueOf(),
  );

  const [hovered, setHovered] = useState<string | undefined>();
  const [selected, setSelected] = useState<string | undefined>();
  const [renaming, setRenaming] = useState<string | undefined>();

  return (
    <Stack.V flex="1">
      <Stack.H alignItems="center">
        <Heading2 color="text">Projects</Heading2>
        <Spacer.Horizontal />
        <Button
          onClick={() => {
            const design = createAyonFile();

            client.files
              // Wait till after navigating to refetch, since it looks bad
              // if the list updates before transitioning to the new page
              .create({ name: 'Untitled', design }, { fetchPolicy: 'no-cache' })
              .then((id) => push(`/projects/${id}`))
              .then(() => client.files.refetch());
          }}
        >
          <PlusIcon />
          <Spacer.Horizontal size={8} />
          New Project
        </Button>
      </Stack.H>
      <Spacer.Vertical size={44} />
      <Stack.V margin={'0 -12px'}>
        <ListView.Root>
          {sortedFiles.map((file) => {
            return (
              <ListView.Row
                key={file.id}
                hovered={hovered === file.id}
                selected={selected === file.id}
                menuItems={[
                  {
                    title: 'Delete',
                    value: 'delete',
                  } as const,
                  {
                    title: 'Rename',
                    value: 'rename',
                  } as const,
                ]}
                onSelectMenuItem={(value) => {
                  switch (value) {
                    case 'delete':
                      client.files.delete(file.id);
                      return;
                    case 'rename':
                      setRenaming(file.id);
                      return;
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
                <Stack.H padding={'8px 0'} alignItems="center" flex="1">
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
                  <Small>
                    {'edited '}
                    {formatDistance(parseISO(file.updatedAt), new Date(), {
                      addSuffix: true,
                    }).replace('less than a minute ago', 'just now')}
                  </Small>
                </Stack.H>
              </ListView.Row>
            );
          })}
        </ListView.Root>
      </Stack.V>
    </Stack.V>
  );
}
